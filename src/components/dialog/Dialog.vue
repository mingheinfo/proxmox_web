<template>
  <div
    class="dialog"
    v-if="visible"
    ref="dialog"
    :key="key"
    :class="{ show: visible }"
  >
    <div class="dialog-mask"></div>
    <div class="dialog-wrapper">
      <div
        class="dialog-content animate__backInLeft animate__backOutRight"
        ref="pop-wrapper"
        :style="contentStyles"
      >
        <div
          class="dialog-header"
          ref="pop-header"
          @mousedown.stop="handleMoveStart"
        >
          <span class="dialog-title">{{ title }}</span>
          <span class="dialog-close" @click="close">&times;</span>
        </div>
          <div class="dialog-main">
            <slot name="content"></slot>
          </div>
        <div class="dialog-footer">
          <template v-if="!$slots['footer']">
            <m-button type="danger" class="dialog-cancel" @on-click="cancel">{{
              cancelText
            }}</m-button>
            <m-button type="primary" class="dialog-confirm" @on-click="ok">{{
              confirmText
            }}</m-button>
          </template>
          <template v-else>
            <slot name="footer"></slot>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDocument } from "@libs/utils";
import MScrollbar from "@src/components/scroll/Scrollbar";
export default {
  name: "Dialog",
  components: {
    MScrollbar,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    cancelText: {
      type: String,
      default: "取消",
    },
    confirmText: {
      type: String,
      default: "确定",
    },
    _style: {
      type: Object,
    },
    visible: {
      type: Boolean,
    },
    drag: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      promiseStatus: null,
      isMounted: false,
      draggable: true,
      mouseStartPoint: { left: 0, top: 0 },
      mouseEndPoint: {
        left: getDocument().clientWidth / 2,
        top: getDocument().clientHeight / 2,
      },
      mouseDragDown: false,
      basePoint: { left: 0, top: 0 },
      moveTarget: null,
      appendToBody: true,
      key: 1,
      interval: null,
    };
  },
  computed: {
    //计算方法计算弹出框出现的位置
    contentStyles() {
      let style = {};
      style.left = `${this.mouseEndPoint.left}px`;
      style.top = `${this.mouseEndPoint.top}px`;
      return Object.assign({}, style, this._style);
    },
  },
  methods: {
    //关闭弹出框回调
    close() {
      let _this = this;
      _this.show = false;
      this.interval = setTimeout(() => {
        _this.$emit("close");
        _this.closed = true;
        if (this.appendToBody) {
          document.body.removeChild(this.$el);
        }
      }, 0);
    },
    //点击取消触发回调
    cancel() {
      let _this = this;
      this.$emit("cancel");
    },
    ok() {
      let _this = this;
      this.$emit("confirm");
    },
    handleMoveStart(event) {
      var dragDom = this.$refs["pop-header"];
      if (this.$refs["dialog"]) this.$refs["dialog"].classList.toggle("move");
      //阻止所选dom内容被选中
      dragDom.onselectstart = dragDom.ondrag = function () {
        return false;
      };
      if (!this.draggable) return;
      if (event.target.hasOwnProperty("close"))
        //点关闭按钮不能移动对话框
        return;
      //判断是否可以移动
      this.mouseDragDown = true;
      //移动时x轴起始位置
      this.mouseStartPoint.left = Number(
        this.$refs["pop-wrapper"].style.left.replace(/px/, "")
      );
      //移动时y轴其实位置
      this.mouseStartPoint.top = Number(
        this.$refs["pop-wrapper"].style.top.replace(/px/, "")
      );
      //移动目标
      this.moveTarget = this.$refs["pop-wrapper"];
      //开始移动位置
      this.basePoint = { left: event.pageX, top: event.pageY };
      //监听移动事件
      document.addEventListener("mousemove", this.handleMoveMove, false);
      //监听鼠标up事件
      document.addEventListener("mouseup", this.handleMoveEnd, false);
    },

    handleMoveMove(event) {
      event.preventDefault();
      event.stopPropagation();
      if (!this.mouseDragDown || this.moveTarget == undefined) return;
      //移动x轴距离
      var mousX = event.pageX - this.basePoint.left;
      //移动y轴距离
      var mousY = event.pageY - this.basePoint.top;
      //x轴距离起始位置距离
      let left = mousX + this.mouseStartPoint.left;
      //y轴距离其实位置距离
      let top = mousY + this.mouseStartPoint.top;
      //如果left， top的绝对值小于等于0证明没有发生移动
      if (Math.abs(left) <= 0 || Math.abs(top) <= 0) return;
      // offsetWidth、offsetHeight 当前元素的宽度
      // innerWidth、innerHeight 浏览器可视区的宽度和高度

      // 获取弹窗在页面中距X轴的最小、最大 位置;
      let minX = 0;
      let maxX =
        getDocument().clientWidth - this.$refs["pop-wrapper"].clientWidth;
      if (left <= minX) {
        left = minX;
      } else if (left >= maxX) {
        left = maxX;
      }
      // 获取弹窗在页面中距Y轴的最小、最大 位置
      let minY = 0;
      //top值最小为0
      let maxY =
        getDocument().clientHeight - this.$refs["pop-wrapper"].clientHeight < 0? 0 : getDocument().clientHeight - this.$refs["pop-wrapper"].clientHeight;
      if (top <= minY) {
        top = minY;
      } else if (top >= maxY) {
        top = maxY;
      }
      this.mouseEndPoint = { left: left, top: top };
    },

    handleMoveEnd(event) {
      this.mouseDragDown = false;
      this.moveTarget = null;
      //移除鼠标移动监听事件
      document.removeEventListener("mousemove", this.handleMoveMove);
      //移除鼠标按下事件
      document.removeEventListener("mousedown", this.handleMoveStart);
      if (this.$refs["dialog"]) this.$refs["dialog"].classList.toggle("move");
      //阻止事件默认行为
      event.preventDefault();
      //阻止事件冒泡
      event.stopPropagation();
    },
  },
  mounted() {
    let _this = this;
    _this.isMounted = true;
    _this.draggable = _this.drag ? _this.drag : true;
    if (this.appendToBody) {
      document.body.appendChild(this.$el);
    }
    //初始化弹框出现在可视区的位置
    if (_this.$refs["pop-wrapper"])
      _this.mouseEndPoint = {
        left:
          (getDocument().clientWidth - _this.$refs["pop-wrapper"].clientWidth) /
          2,
        top: 100,
      };
  },
  destroyed() {
    if (this.interval !== null) {
      clearTimeout(this.interval);
      this.interval = null;
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.closed = false;
        this.$emit("open");
        if (this.appendToBody) {
          document.body.appendChild(this.$el);
        }
        this.$nextTick(() => {
          this.$refs.dialog.scrollTop = 0;
          this.mouseEndPoint = {
            left:
              (getDocument().clientWidth -
                this.$refs["pop-wrapper"].clientWidth) /
              2,
            top:
              (getDocument().clientHeight -
                this.$refs["pop-wrapper"].clientHeight) /
              2,
          };
        });
        return val;
      } else {
        if (!this.closed) this.$emit("close");
        if (this.destroyOnClose) {
          this.$nextTick(() => {
            this.key++;
          });
        }
        return val;
      }
    },
  },
};
</script>

<style scoped lang="less">
@import "~@src/components/dialog/dialog.less";
</style>
