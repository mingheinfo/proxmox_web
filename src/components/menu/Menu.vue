<template>
  <el-scrollbar class="menu">
    <el-menu @select="handleSelect" :default-active="$route.path">
      <template v-for="menu of data">
        <el-menu-item v-if="!menu.children || menu.children.length <= 0"
                      :title="menu.title"
                      :key="menu.path"
                      :index="menu.path">
          <i :class="menu.icon"></i>
          <span slot="title">{{$t(menu.title)}}</span>
        </el-menu-item>
        <template v-else-if="menu.children && menu.children.length > 0">
          <el-submenu :index="`${menu.path}-${menu.key}`"  :key="menu.path">
            <el-menu-item slot="title"
                          :index="menu.path"
                          style="padding-left: 0px;">
              <i :class="menu.icon"></i>
              <span slot="title">{{$t(menu.title)}}</span>
            </el-menu-item>
            <SubMenu :data="menu.children" @on-change="handleSelect"></SubMenu>
          </el-submenu>
        </template>
      </template>
    </el-menu>
  </el-scrollbar>
</template>

<script>
  import ScrollBar from 'element-ui/lib/scrollbar'
  import SubMenu from './SubMenu';
  export default {
    name: "Menu",
    components: {
      'el-scrollbar': ScrollBar,
      SubMenu
    },
    props: {
      data: Array
    },
    methods: {
      handleSelect(e) {
        this.$router.push({path: e});
        window.localStorage.setItem("lastLink", e || "");
      }
    }
  }
</script>

<style scoped lang="less">
  .menu {
    height: 100%;
    padding-top: 60px;
    margin-left: 0px;
    width: 200px;
    overflow-x: hidden;
    border-right: 1px solid #e0eaf3;
    z-index: 1;
    background: #fff;
  }
</style>
