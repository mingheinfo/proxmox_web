<template>
    <div class="card">
      <div class="card-title">
        <div class="card-title-left">
          <slot name="title"></slot>
        </div>
        <div class="card-title-right">
          <slot name="operate"></slot>
        </div>
      </div>
      <template>
        <slot name="content"></slot>
      </template>
    </div>
</template>

<script>
  export default {
    name: "OverviewCard"
  }
</script>

<style scoped lang="less">
   .card{
     min-height: 274px;
     display: inline-block;
     vertical-align: top;
     margin-bottom: 20px;
     &-title{
       width: 100%;
       padding: 10px 20px;
       background: #dde4ed;
       display: flex;
       &-left{
         flex: 1 1 auto;
         width: 0;
       }
       &-right{
         flex: 1 1 auto;
         width: 0;
         text-align: right;
       }
     }
   }
</style>
