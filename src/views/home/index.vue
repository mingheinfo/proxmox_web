<template>
   <div class="main">
     <Pv-Header></Pv-Header>
     <div id="toast"></div>
     <Aside-Tree></Aside-Tree>
      <section class="main-content">
         <router-view/>
      </section>
     <footer></footer>
     <ToastManager></ToastManager>
     <split-line></split-line>
   </div>
</template>

<script>
  import Vue from 'vue'
  import PvHeader from '@src/components/header/PvHeader';
  import AsideTree from '@src/components/aside/Tree.vue';
  import ToastManager from "@src/components/toast/ToastManager";
  import TableInfoState from '@src/components/table/InfoState';
  import MSelect from '@src/components/select/Select';
  import Option from '@src/components/select/Option';
  import MCheckBox from '@src/components/checkbox/Checkbox';
  import Dropdown from '@src/components/dropdown/dropdown';
  import DropdownItem from '@src/components/dropdown/dropdownItem';
  import SplitLine from '@src/components/split/SplitLine';
  //注册全局组件
  Vue.component(ToastManager);//提示框组件
  Vue.component('table-info-state', TableInfoState);//表格状态组件
  Vue.component('m-select', MSelect);//下拉选择框组件
  Vue.component('m-option', Option);//下拉选择框选项组件
  Vue.component('m-checkbox', MCheckBox);//多选框组件
  Vue.component('m-dropdown', Dropdown);//dropdown组件
  Vue.component('m-dropdown-item', DropdownItem)//dropdown选项组件
  export default {
    name: "HomeIndex",
    components: {
      ToastManager,
      PvHeader,
      AsideTree,
      SplitLine
    }
  }
</script>

<style scoped lang="less">
   .main{
     height: 100%;
     &-content{
       position: absolute;
       top: 60px;
       left: 180px;
       height: calc(100% - 60px);
       overflow: hidden;
       width: calc(100% - 180px);
       background: linear-gradient(-60deg,#f7f8fa,#f5f6f9 70%,#f7f8fa 98%);
     }
   }
</style>
