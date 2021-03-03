<template>
   <div class="line-wrapper">
     <div class="line-desc">
       <div class="line-title">
         <i v-if="icon" :class="icon" style="font-size: 16px;display: inline-block;
    width: 19px;"></i>
         <base-icon v-if="name" :name="name" :_style="{width: '16px', 'height': '16px'}"/>
         <span>{{title}}</span>
       </div>
       <div class="line-desc-content">{{desc}}</div>
     </div>
     <div class="line-chart">
       <div class="line-chart-outer"></div>
       <div class="line-chart-inner"
            :style="{width: `${Number(value).toFixed(2)}%`,
         background: bgColor}"></div>
     </div>
   </div>
</template>

<script>
  import BaseIcon from '@src/components/icon/BaseIcon';
  export default {
    name: "Line-Percent-Chart",
    components: {
      BaseIcon
    },
    props: {
      value: {
        type: [String, Number],
        default: 0
      },
      desc: String,
      icon: String,
      title: String,
      name: String
    },
    computed: {
      //计算不同百分比对应的颜色
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
    },
    watch: {
      value(newVal, oldVal){
        if(newVal !== oldVal) {
          return newVal;
        }
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
        letter-spacing: -1px;
      }
    }
    &-title{
      flex: 1 1 auto;
      width: 0;
      text-align: left;
    }
  }
  .line-chart{
    position: relative;
    width: 100%;
    height: 8px;
    border-radius:  8px;
    overflow: hidden;
    &::after{
      clear: both;
    }
    &-outer{
      position: relative;
      width: 100%;
      height:  8px;
      background: #e0eaf3;
      border-radius:  8px;
    }
    &-inner{
      position: absolute;
      height:  8px;
      top: 0px;
      line-height:  8px;
      border-radius:  8px;
      transition: all .5s ease-in;
    }
    &-des{
      position: absolute;
      width: 100%;
      height:  8px;
      line-height: 8px;
      top: 0px;
      text-align: center;
      font-size: 12px;
      transition: all .5s ease-in;
    }
  }
</style>
