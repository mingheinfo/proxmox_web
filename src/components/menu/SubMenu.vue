<template>
  <div class="sub-menu">
    <template v-for="menu of data">
      <el-menu-item v-if="!menu.children || menu.children.length <= 0" :title="menu.title"
                     :key="menu.path"
                     :index="menu.path">
        <i :class="menu.icon"></i>
        <span slot="title">{{$t(menu.title)}}</span>
      </el-menu-item>
      <template v-else-if="menu.children && menu.children.length > 0">
        <el-submenu :index="menu.path" :key="menu.path" >
          <template slot="title">
            <i :class="menu.icon"></i>
            <span>{{$t(menu.title)}}</span>
          </template>
          <SubMenu :data="menu.children"></SubMenu>
        </el-submenu>
      </template>
    </template>
  </div>
</template>

<script>
  export default {
    name: "SubMenu",
    props: {
      data: Array
    },
  }
</script>

<style scoped>

</style>
