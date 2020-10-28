<template>
   <div>
     <div class="tool-bar">
      <div class="tool-bar-left">
        <!--工具栏左侧区-->
        <slot name="toolbar-left"></slot>
      </div>
       <div class="tool-bar-right">
          <!--工具栏右侧区-->
         <slot name="toolbar-right"></slot>
       </div>
     </div>
     <div class="page-template__content">
        <!--主页面区-->
        <slot name="page-content"></slot>
     </div>
   </div>
</template>

<script>
  export default {
    name: "PageTemplate"
  }
</script>

<style scoped lang="less">
  .tool-bar{
    display: flex;
    flex-grow: 1;
    justify-content: space-between;
    &-left{
      flex: 1 1 auto;
      width: 0;
    }
    &-right{
      flex: 1 1 auto;
      width: 0;
    }
  }
 .page-template{
   &__content{
     height: 100%;
     padding-top: 5px;
   }
 }
</style>
