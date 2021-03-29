<template>
  <transition name="transition">
    <div class="content">
      <div class="m-operate">
        <div class="m-operate-left">
          资源池:{{pools && pools.pool}}
        </div>
      </div>
      <Pv-Menu :data="menuData"></Pv-Menu>
     <div class="m-scroll-wrapper  scroll-container">
        <div class="m-scroll-view scroll-view" @scroll="onScroll">
          <div class="m-content">
            <router-view />
          </div>
        </div>
        <div
          class="m-scroll-bar"
          v-show="showScrollbar"
          :style="{ top: scrollTop + 'px', height: scrollLength + 'px' }"
          @mousedown="onScrollBarMouseDown($event)"
        ></div>
      </div>
    </div>
  </transition>
</template>
 <script>
import PvMenu from "@src/components/menu/Menu";
import MScrollbar from "@src/components/scroll/Scrollbar";
import MButton from "@src/components/button/Button";
//菜单tree
import { poolList } from "@src/components/menu/menuList";
export default {
	name: "StorageIndex",
  mixins: [MScrollbar],
	components: {
		PvMenu,
		MButton
	},
  data() {
		return {
			menuData: poolList,
			pools: {}
		}
	},
	mounted() {
      this.scrollElementSelector = '.scroll-view';
      this.scrollContainerSelector =  '.scroll-container';
		  let last = window.localStorage.getItem("lastsel") || "[]";
      this.pools = (JSON.parse(last) && JSON.parse(last)) || "";
	}
};
</script>

<style lang="less" scoped>
.transition-enter {
  transition: all 0.5s ease-in;
}
.content {
  height: 100%;
}
</style>