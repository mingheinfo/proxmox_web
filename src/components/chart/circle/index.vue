<template>
  <div class="content-item">
    <div class="title">{{title}}</div>
    <div :class="`m-chart-instance-${_uid}`" style="height: 200px"></div>
  </div>
</template>
<script>

  //1.引入上面 创建的 option.js

  import { getAnnulusOption } from './options.js'

  //2.引入 echarts 图表插件

  import echarts from 'echarts'

  export default {
    name: '',
    props: {
      value: {
        type: Number,
        validate: (value) => {
          if(!/\d/.test(String(value)))
            throw new Error('格式不正确');
        }
      },
      title: String,
      label: String
    },
    data() {
      return {
        chartsDom: null
      }
    },
    mounted() {
      //初始化dom
      let _this = this, el = document.querySelector(`.m-chart-instance-${_this._uid}`);
      //设置dom的宽高
      el.style.width = el.parentNode.parentNode.clientWidth + 'px';
      el.style.height = el.parentNode.parentNode.clientHeight + 'px';
      this.chartsDom = echarts.init(el);
    },
    methods: {
      /**
       * @param {String} id  获取HTML div元素的 ID,
       * @param {Number} dividend  数值1 ，（成功个数）
       * @param {Number} divisor   数值2，（总数）
       */
      //id,
      //dividend
      //divisor
      renderChart(chartInstance, dividend, divisor) {
        if(!chartInstance) return;
        const data = [dividend, divisor - dividend]
        const colors = ['#4b7efe', '#beddff']
        const percentage = divisor === 0 ? 0 : dividend / divisor * 100
        const text = this.formatValue(percentage, 0) + '%'
        const subText = this.label
        const textFontSize = 20
        const subTextFontSize = 0
        const option = getAnnulusOption(data, colors, text, subText, textFontSize, subTextFontSize)
        const charts = chartInstance
        charts.setOption(option)
      },

      /**
       * @param {number or string} value 数值
       * @param {Number} digits 保留小数位数
       * @param {bool} returnStr 返回值是字符串（如果保留位数那么返回是一个string）
       */
      formatValue(value, digits, returnStr = false) {
        if (digits < 0) {
          console.log('小数点后位数不能为负数')
          value = 0
        }
        if (!value) {
          value = 0
        }
        if (returnStr) {
          return parseFloat(value).toFixed(digits)
        }
        return parseFloat(parseFloat(value).toFixed(digits))
      }
    },
    watch: {
      'value': function (newVal, oldVal) {
        if(newVal !== oldVal)
          this.renderChart(this.chartsDom, newVal, 100)
      }
    }
  }

</script>

<style scoped lang="less">
  .title{
    padding: 20px 0px 0px;
    text-align: center;
  }
</style>
