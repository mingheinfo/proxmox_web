<template>
  <div class="line-chart">
    <div class="line-chart-outer"></div>
    <div class="line-chart-inner"
         :style="{width: `${Number(value).toFixed(1)}%`,
         background: bgColor}"></div>
    <div class="line-chart-des">{{Number(value).toFixed(1)}}%</div>
  </div>
</template>

<script>
  export default {
    name: "Line-charts",
    props: {
      value: {
        type: [String, Number],
        default: 0
      }
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
  .line-chart{
    position: relative;
    width: 100%;
    height: 12px;
    border-radius: 12px;
    overflow: hidden;
    &::after{
      clear: both;
    }
    &-outer{
      position: relative;
      width: 100%;
      height: 12px;
      background: #e0eaf3;
      border-radius: 12px;
    }
    &-inner{
      position: absolute;
      height: 12px;
      top: 0px;
      line-height: 12px;
      border-radius: 16px;
      transition: all .5s ease-in;
    }
    &-des{
      position: absolute;
      width: 100%;
      height: 12px;
      line-height: 12px;
      top: 0px;
      text-align: center;
      font-size: 12px;
      transition: all .5s ease-in;
    }
  }
</style>
