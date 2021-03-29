<template>
  <transition name="transition">
    <div class="content">
      <div class="m-operate">
        <div class="m-operate-left">数据中心</div>
        <div class="m-operate-right">

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
  import { mapState } from 'vuex';
  import PvMenu from '@src/components/menu/Menu';
  import MScrollbar from "@src/components/scroll/Scrollbar";
  import MButton from "@src/components/button/Button";
  //菜单tree
  import { dataCenterMenuList } from "@src/components/menu/menuList";
  import Dropdown from "@src/components/dropdown/dropdown";
  import DropdownItem from "@src/components/dropdown/dropdownItem";
  export default {
    name: "Node",
    mixins: [MScrollbar],
    components: {
      DropdownItem,
      Dropdown,
      PvMenu,
      MButton
    },
    data() {
      return {
        node: '',
        menuData: dataCenterMenuList
      }
    },
    computed: {
      ...mapState({
        viewType: state => state.db.selectView
      })
    },
    mounted(){
      this.scrollElementSelector = '.scroll-view';
      this.scrollContainerSelector =  '.scroll-container';
    },
    methods: {
      handleReset() {
        let lastSelectView = window.localStorage.getItem("lastsel") || '[]';
        this.node = lastSelectView.text || '';
        this.$http.post('/json/nodes/test/status', {
          command: 'reboot'
        }, {
          headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        })
      }
    }
  }
</script>

<style scoped>
  .transition-enter{
    transition: all .5s ease-in;
  }
  .content{
    height: 100%;
  }
</style>
