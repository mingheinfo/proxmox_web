<template>
  <transition name="transition">
    <div class="content">
      <div class="m-operate">
        <div class="m-operate-left">
         {{storages && storages.node && storages.storage && `存储'${storages.storage}'在节点'${storages.node}'上`}}
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
import { storageList } from "@src/components/menu/menuList";
export default {
	name: "StorageIndex",
  mixins: [MScrollbar],
	components: {
		PvMenu,
		MButton
	},
  data() {
		return {
			menuData: storageList,
			storages: {}
		}
	},
	mounted() {
      this.scrollElementSelector = '.scroll-view';
      this.scrollContainerSelector =  '.scroll-container';
		  let last = window.localStorage.getItem("lastsel") || "[]";
      this.storages = (JSON.parse(last) && JSON.parse(last)) || "";
	},
  methods: {
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