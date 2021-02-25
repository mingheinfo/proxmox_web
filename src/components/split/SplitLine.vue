<template>
	 <div
      class="aside_col-resize"
      @mousedown.stop="handleMouseDown"
      @mouseup.stop="handleMouseUp"
    ></div>
</template>

<script>
import { stopEvent } from "@libs/utils";
export default {
	name: 'SplitLine',
	data() {
		return {
			initX: 0,
			drageable: false
		}
	},
	mounted() {
		 let el = document.querySelector(".aside"),
		  colEl = document.querySelector('.aside_col-resize');
			colEl.style.left = el.clientWidth + "px";
	},
	methods: {
		 //计算左侧菜单栏的宽度
    handleMouseDown(event) {
      stopEvent(event);
      this.initX = event.clientX;
      this.drageable = true;
      document.addEventListener(
        "mousemove",
        this.handleMouseMove, 50,
        false
      );
      document.addEventListener(
        "mouseup",
        this.handleMouseUp, 50,
        false
      );
    },
    //移动左侧菜单栏
    handleMouseMove(event) {
      stopEvent(event);
      event.preventDefault();
      if (!this.drageable) return;
      let y = event.clientX - this.initX,
          dis = this.initX + y,
          colEl = document.querySelector('.aside_col-resize');
          colEl.style.left = this.initX + y + "px";
       while (dis <= 5) {
        document.removeEventListener(
          "mousemove",
          this.handleMouseMove,
          false
        );
        document.removeEventListener(
          "mouseup",
          this.handleMouseUp,
          false
        );
        return;
      }
    },
    //取消移动
    handleMouseUp(event) {
      stopEvent(event);
      event.preventDefault();
      document.removeEventListener(
        "mousemove",
        this.handleMouseMove, 50,
        false
      );
      document.removeEventListener(
        "mouseup",
        this.handleMouseUp, 50,
        false
      );
        let y = event.clientX - this.initX,
				    asideEl = document.querySelector(".aside");
      asideEl.style.width = this.initX + y + "px";
      let el = document.querySelector(".main-content");
      el.style.width = `calc(100% - ${this.initX + y}px)`;
      el.style.left = this.initX + y + "px";
      this.initX = event.clientX;
      this.drageable = false;
    },
	}
}
</script>

<style lang="less" scoped>
  .aside_col-resize{
	  position: absolute;
		width: 5px;
		height: 100%;
		top: 0px;
		bottom: 0px;
		z-index: 10;
		cursor:col-resize;
		background: #9ea7b4;
	}
</style>