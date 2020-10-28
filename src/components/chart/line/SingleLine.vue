<template>
  <div class="line-wrapper">
    <div class="line-desc">
      <div class="line-title">
        <i v-if="icon" :class="icon" style="font-size: 16px"></i>
        <base-icon v-if="name" :name="name" :_style="{width: '16px', 'height': '16px'}"/>
        <span>{{title}}</span>
      </div>
      <div class="line-desc-content" :style="__style">{{desc}}</div>
    </div>
  </div>
</template>

<script>
  import BaseIcon from '@src/components/icon/BaseIcon';
  export default {
    name: "SingleLine",
    components: {
      BaseIcon
    },
    props: {
      value: {
        type: [String, Number],
        default: 0
      },
      desc: [String, Number],
      icon: String,
      title: String,
      name: String,
      __style: Object
    },
    computed: {
      bgColor() {
        let value = Number(this.value).toFixed(1);
        if(value > 50 && value < 80) {
          return '#fc0';
        }
        if(value >= 80) {
          return '#FF6C59';
        }
        return '#21bf4b';
      }
    }
  }
</script>

<style scoped lang="less">
  .line{
    &-wrapper{
      width: 100%;
    }
    &-desc{
      display: flex;
      justify-content: space-between;
      padding-bottom: 5px;
      font-size: 1em;
      flex-wrap: wrap;
      &-content{
        flex: 1 1 auto;
        width: 0;
        text-align: right;
      }
    }
    &-title{
      flex: 1 1 auto;
      width: 0;
      text-align: left;
    }
  }
</style>
