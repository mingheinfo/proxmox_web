<template>
   <div class="m-chart">
      <div class="m-tool-img m-tool-restore" @click="toggleMode"></div>
      <div class="m-chart-content" ref="m-chart"></div>
   </div>
</template>

<script>
  import { deepCopy, dateFormat, getEvent } from "@libs/utils";
  import echart from 'echarts/lib/echarts';
  import echartsConfig from 'echarts/lib/config';
  import 'echarts/lib/component/legend';
  import 'echarts/lib/component/tooltip';
  import 'echarts/lib/component/title';
  import 'echarts/lib/chart/line';
  export default {
    name: "LineGraph",
    props: {
      data: Object
    },
    data() {
      let _this = this;
      return {
        chartsDom: null,
        temp: {},
        options: {
          title: {
            textStyle: {
              color: '#333'
            }
          },
          legend: {
            show: true,
            bottom: 0
          },
          grid: {
            top: 20,
            bottom: 60,
          },
          xAxis: {
            type: 'category',
            data: []
          },
          tooltip: {
            show: true,
            trigger: "axis",
            confine: true,
            formatter: (param) => {
              let str = `<div style="padding: 0px 30px;opcity: 0;box-size: border-box;border-radius: 2px; background: #fff;display: inline-block">
            <div>${param[0].axisValueLabel}</div>`;
              for (let i in param) {
                str += `<div style="padding: 5px 0px;">
                 <span style="display: inline-block;width: 10px;height: 10px; background:${param[i].color.color}"></span>
                 <span style="dispaly: inline-block;color: #222;">${param[i].seriesName}\r\t${param[i].value ? _this.data && _this.data.func && _this.data.func(param[i].value) || param[i].value.toFixed(2) : 0}</span>
               </div>`;
              }
              str += `</div>`;
              return str;
            },
            backgroundColor: "rgba(255,255,255,0.98)",
            borderColor: "#EEF3F7",
            borderWidth: 1,
            extraCssText:
              "box-shadow: 0 2px 4px 0 rgba(217,225,233,0.40);border-radius: 2px;padding: 10px;",
            textStyle: {
              color: "#5E6978",
              fontFamily: "PingFangSC-Regula",
              fontSize: "12"
            }
          },
          yAxis: {
            type: 'value',
            nameLocation: 'middle',
            axisLabel: {
              padding: [15, 0, 15, 60],
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: "#555",
                opacity: 0.9,
                type: "dashed"
              }
            },
            nameTextStyle: {
              color: "#222",
              fontWeight: 500,
              padding: [0, 10, 20, 0],
              height: '100%',
              fontSize: 16,
              fontFamily:'Courier New'
            },
            axisLine: {
              color: {
                type: "radial",
                x: 0.5,
                y: 0.5,
                r: 0.5,
                colorStops: [
                  {
                    offset: 0,
                    color: "red" // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: "blue" // 100% 处的颜色
                  }
                ],
                global: false // 缺省为 false
              },
              lineStyle: {
                color: "#222"
              }
            },
          },
          series: []
        }
      }
    },
    mounted() {
      this.chartsDom = echart.init(this.$refs['m-chart']);
      this.setOption();
      window.addEventListener('resize',() => {
        this.chartsDom.resize();
      }, true)
    },
    methods: {
      //设置折线图的配置项
      setOption() {
        //省拷贝options
        let _options = deepCopy(this.options);
        if(!this.data || this.data.value.length < 0 || !this.data.time || !this.data.color) return;
        //格式化x轴时间
        _options.xAxis.data = this.data.time.map(item => {
          return dateFormat(new Date(item * 1000), 'yyyy-MM-dd hh:mm');
        });
        //格式化y轴数据
        _options.yAxis.axisLabel.formatter = (value) => {
          return this.data.func && this.data.func(value) || value;
        }
        _options.color = this.data.color.map(item => {
          return item.end;
        })
        _options.yAxis.name = this.data && this.data.title
        this.data.value.forEach((item, index) => {
          _options.series.push({
            data: item,
            type: 'line',
            smooth: true,
            name: this.data.label[index],
            areaStyle: {
              color: this.data.color[index].line
            }
          })
        })
        this.chartsDom.setOption(_options, true);
        let legend = [];
        var triggerAction = (action, selected) => {
          legend = [];

          for ( name in selected) {
            if (selected.hasOwnProperty(name)) {
              legend.push({name: name});
            }
          }

          this.chartsDom.dispatchAction({
            type: action,
            batch: legend
          });
        };
        //点击label选中事件
        var isFirstUnSelect = (selected) => {

          var unSelectedCount = 0;
          for ( name in selected) {
            if (!selected.hasOwnProperty(name)) {
              continue;
            }

            if (selected[name] == false) {
              ++unSelectedCount;
            }
          }
          return unSelectedCount==1;
        };
        //所有label都没有选中
        var isAllUnSelected = (selected) => {
          var selectedCount = 0;
          for ( name in selected) {
            if (!selected.hasOwnProperty(name)) {
              continue;
            }

            // 所有 selected Object 里面 true 代表 selected， false 代表 unselected
            if (selected[name] == true) {
              ++selectedCount;
            }
          }
          return selectedCount==0;
        };

        this.chartsDom.on('legendselectchanged', function(obj) {
          var selected = obj.selected;
          var legend = obj.name;

          // 使用 legendToggleSelect Action 会重新触发 legendselectchanged Event，导致本函数重复运行
          // 使得 无 selected 对象
          if (selected != undefined) {

            if (isFirstUnSelect(selected)) {
              triggerAction('legendToggleSelect', selected);
            } else if (isAllUnSelected(selected)) {
              triggerAction('legendSelect', selected);

            }
          }

        });
      },
      toggleMode() {
        this.options.legend.show =  !this.options.legend.show;
        this.setOption();
      }
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.setOption, true)
    },
    watch: {
      data: function (newVal, oldVal) {
        if(newVal !== oldVal)
          this.setOption();
      }
    }
  }
</script>

<style scoped lang="less">
.m-chart{
  height: 274px;
  width: 100%;
  position: relative;
  &-content{
    height: 250px;
   }
  &-legend{
    width: 100%;
    text-align: center;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    &-item{
      height: 30px;
      line-height: 30px;
      padding: 0 20px;
      border: 1px solid #e5e5e5;
      border-radius: 3px;
      position: relative;
    }
    &-checkbox{
      display: inline-block;
      width: 100%;
      height: 100%;
      position: absolute;
      padding: 100%;
      left: 0;
      opacity: 0;
    }
    .checked{
      .dot{
        opacity: 1;
      }
    }
    .unchecked{
      .dot{
        opacity: 0.5;
      }
    }
  }
  .dot{
    background: #ff4e41;
    display: inline-block;
    vertical-align: middle;
    width: 8px;
    height: 8px;
    border-radius: 8px;
    opacity: 1;
  }
}

.m-tool-restore{
  position: absolute;
  top: -25px;
  right: 20px;
}
</style>
