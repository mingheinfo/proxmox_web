<template>
  <div :class="{'pop-up':true,'show':show}" :data-id="_uid">
    <div class="popup-mask" v-if="hasMark"></div>
    <transition name="bottom">
      <div class="popup-note bottom">
        <div class="pop-content animate__backInLeft" ref="pop-wrapper" :style="contentStyles">
          <div class="pop-tit" ref="pop-header" @mousedown="handleMoveStart">
            {{title}}
            <span class="pop-close" @click.prevent="noClick">&times;</span>
          </div>
          <p class="pop-note hasTitle">
            <base-icon :name="icon" v-if="icon"/>
            <slot>
              <p v-if="!dangerouslyUseHTMLString" style="display: inline-block; width: calc(100% - 80px);">{{ msg }}</p>
              <p v-else v-html="msg" style="display: inline-block; width: calc(100% - 80px);"></p>
            </slot>
          </p>
          <div class="btn-wrapper" v-if="type == 'alert'">
            <m-button class="confirm-btn" type="primary" @on-click="alertClick">{{alertBtnText}}</m-button>
          </div>
          <div class="btn-wrapper">
            <m-button class="confirm-btn" type="danger" @on-click="noClick">{{noBtnText}}</m-button>
            <m-button class="confirm-btn" type="primary" @on-click="yesClick" v-if="['confirm', 'info', 'warning'].includes(type)">{{yesBtnText}}</m-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
  import BaseIcon from "../icon/BaseIcon";
  import { getDocument } from "@libs/utils";

  export default {
    components: {BaseIcon},
    props: {
      title: {
        type: String,
        default: '提示'
      },
      msg: {
        type: String,
        default: ''
      },
      type: {
        type: String,
        default: 'alert'
      },
      alertBtnText: {
        type: String,
        default: '我知道了'
      },
      yesBtnText: {
        type: String,
        default: '确定'
      },
      noBtnText: {
        type: String,
        default: '取消'
      },
      hasMark: {
        type: Boolean,
        default: true
      },
      isClose: {
        type: Boolean,
        default: true
      },
      icon: String,
      _style: Object
    },
    computed: {
      //计算messsgebox的位置
      contentStyles () {
        let style = {};
        style.left = `${this.mouseEndPoint.left}px`;
        style.top = `${this.mouseEndPoint.top}px`;
        return Object.assign({},style, this._style);
      }
    },
    data() {
      return {
        promiseStatus: null,//点击alert的状态
        show: false,//是否展示alert
        isMounted: false,//是否已经在挂载阶段
        draggable: true,
        mouseStartPoint:{"left":0,"top":  0},
        mouseEndPoint : {"left": getDocument().clientWidth / 2,"top": getDocument().clientHeight / 2},
        mouseDragDown : false,
        basePoint : {"left": 0,"top":  0},
        moveTarget:null,
        dangerouslyUseHTMLString: false
      }
    },
    mounted() {
      let _this = this;
      _this.isMounted = true;
      _this.draggable  = _this.drag ? _this.drag : true;
    },
    methods: {
      confirm() {
        let _this = this;
        this.show = true;
        return new Promise(function (resolve, reject) {
          _this.promiseStatus = {resolve, reject};
        });
      },
      //点击取消触发的回调
      noClick() {
        this.show = false;
        this.promiseStatus && this.promiseStatus.reject();
        document.body.removeChild(this.$el);
        document.body.classList.toggle('hidden');
      },
       //点击确定触发的回调
      yesClick() {
        this.show = false;
        this.promiseStatus && this.promiseStatus.resolve();
        if(!this.isClose) return;
        this.close();
      },
      //点击关闭触发的回调
      close() {
        document.body.removeChild(this.$el);
        document.body.classList.toggle('hidden');
      },
      //点击alert框触发的回调
      alertClick() {
        this.show = false;
        this.promiseStatus && this.promiseStatus.resolve();
        if(!this.isClose) return;
        this.close();
      },
      handleMoveStart (event) {
        var dragDom = this.$refs['pop-header'];
        //阻止所选dom内容被选中
        dragDom.onselectstart=dragDom.ondrag=function(){
          return false;
        }
        if(!this.draggable)return;
        if(event.target.hasOwnProperty("close"))//点关闭按钮不能移动对话框
          return;
        //判断是否可以移动
        this.mouseDragDown = true;
        //移动时x轴起始位置
        this.mouseStartPoint.left = Number((this.$refs['pop-wrapper'].style.left).replace(/px/,''))
        //移动时y轴其实位置
        this.mouseStartPoint.top = Number((this.$refs['pop-wrapper'].style.top).replace(/px/,''))
        //移动目标
        this.moveTarget = this.$refs['pop-wrapper'];
        //开始移动位置
        this.basePoint = {'left': event.pageX, 'top':  event.pageY};
        //监听移动事件
        document.addEventListener('mousemove', this.handleMoveMove, false);
        //监听鼠标up事件
        document.addEventListener('mouseup', this.handleMoveEnd, false);
        event.preventDefault();
        event.stopPropagation();
      },

      handleMoveMove (event) {
        if(!this.mouseDragDown || this.moveTarget == undefined)return;
        //移动x轴距离
        var mousX = event.pageX - this.basePoint.left;
        //移动y轴距离
        var mousY = event.pageY -  this.basePoint.top;
        //x轴距离起始位置距离
        let left = mousX + this.mouseStartPoint.left;
        //y轴距离其实位置距离
        let top = mousY + this.mouseStartPoint.top;
        //如果left， top的绝对值小于等于0证明没有发生移动
        if(Math.abs(left)<=0 || Math.abs(top) <= 0) return;
        // offsetWidth、offsetHeight 当前元素的宽度
        // innerWidth、innerHeight 浏览器可视区的宽度和高度

        // 获取弹窗在页面中距X轴的最小、最大 位置;
        let minX = (this.$refs['pop-wrapper'].clientWidth / 2);
        let maxX = getDocument().clientWidth - (this.$refs['pop-wrapper'].clientWidth / 2);
        if (left <= minX) {
          left = minX
        } else if (left >= maxX) {
          left = maxX
        }
        // 获取弹窗在页面中距Y轴的最小、最大 位置
        let minY = (this.$refs['pop-wrapper'].clientHeight / 2)
        let maxY =  getDocument().clientHeight - (this.$refs['pop-wrapper'].clientHeight / 2)
        if (top <= minY) {
          top = minY
        } else if (top >= maxY) {
          top = maxY
        }
        this.mouseEndPoint={'left': left, 'top': top};
        event.preventDefault();
        event.stopPropagation();
      },

      handleMoveEnd (event) {
        this.mouseDragDown = false;
        this.moveTarget = null;
        //移除鼠标移动监听事件
        document.removeEventListener('mousemove', this.handleMoveMove);
        //移除鼠标按下事件
        document.removeEventListener('mousedown', this.handleMoveStart);
        //阻止事件默认行为
        event.preventDefault();
        //阻止事件冒泡
        event.stopPropagation();
      }
    },
    watch: {
      msg: {
        handler: function(newVal, oldVal) {
          if(newVal !== oldVal) return newVal;
        },
        deep:true
      }
    }
  }
</script>


<style lang='less' scoped>
  @import "~@src/components/confirm/confirm.less";
  /deep/ .base-icon {
    display: inline-block;
    height: 36px;
    width: 50px;
    margin-right: 10px;
    background-size: 36px 36px;
    background-repeat: no-repeat;
    vertical-align: top;
  }
</style>
