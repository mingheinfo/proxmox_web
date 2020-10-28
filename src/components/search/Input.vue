<template>
   <div class="search">
     <input class="search-inner"/>
     <span class="fa fa-angle-down prefix"></span>
   </div>
</template>

<script>
  export default {
    name: "Input"
  }
</script>

<style scoped lang="less">
  .search{
    width: 100%;
    padding: 5px 10px;
    height: 35px;
    line-height: 35px;
    position: relative;
    &-inner{
     display: inline-block;
      height: 100%;
      border: 1px solid #e0eaf3;
      padding-left: 5px;
    }
    .prefix{
      position: absolute;
      right: 10px;
      top: 45%;
    }
  }
</style>
