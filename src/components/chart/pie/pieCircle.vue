<template>
  <div class="chart" ref="chart-canvas"></div>
</template>

<script>
  import echart from 'echarts/lib/echarts';
  import echartsConfig from 'echarts/lib/config';
  import 'echarts/lib/component/legend';
  import 'echarts/lib/component/tooltip';
  import 'echarts/lib/component/title';
  import 'echarts/lib/chart/pie';
  export default {
    name: "pieCircle",
    props: {
      values: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        chartInstance: null,
        colorsMap: {
          'faded' : '#CFCFCF',
          'good' :'#21BF4B',
          'warning' : '#FFCC00',
          'critical' : '#FF6C59'
        },
        options: {
          color: [],
          tooltip: {
            trigger: 'item',
            formatter: (param) => {
              let str = `<div style="background: #062635;
                                 margin: -10px;
                                 box-shadow: 1px 1px 3px #007dff, -1px -1px 3px #007dff;
                                 padding: 20px;">
                            <h1>${param.name}</h1>
                            <div>
                                <span style="
                                      display: inline-block;
                                      width: 10px;
                                      height: 10px;
                                      background: ${param.color};
                                      vertical-align: middle;
                                      border-radius: 50%;"></span>
                                <span style="display: inline-block;">
                                  <span style="margin-right: 20px;">${param.data.desc ? param.data.desc : ''}</span>
                                  <span>${param.value ? param.value : 0}</span>
                                </span>
                             </div>
                         </div>`
              return str;
            }
          },
          series: [
            {
              name: 'PGs',
              type: 'pie',
              radius: ['50%', '70%'],
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '30',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: []
            }
          ]
        }
      }
    },
    mounted() {
        //计算圆环大小
        this.$refs['chart-canvas'].style.width = this.$el.parentElement.clientWidth + 'px';
        this.$refs['chart-canvas'].style.height = this.$el.parentElement.clientHeight + 'px';
        //初始化圆
        this.chartInstance = echart.init(this.$refs['chart-canvas']);
        this.setOptions();
    },
    methods: {
      setOptions() {
        if(this.values) {
          this.options.series[0].data = [];
          for(let i in this.values) {
            this.options.color.push(this.colorsMap[this.values[i].cls]);
            this.options.series[0].data.push({
              value: this.values[i].count,
              name: this.values[i].text,
              desc: this.values[i].desc
            })
          }
          this.chartInstance.setOption(this.options);
        }
      }
    },
    watch: {
      values: {
        handler: function (newVal, oldVal) {
            this.setOptions();
        },
        deep: true
      },
    }
  }
</script>

<style scoped>

</style>
