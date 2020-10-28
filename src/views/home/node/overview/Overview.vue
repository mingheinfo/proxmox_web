<template>
  <div class="overview">
    <div class="overview-select">
      <select class="pv-form-input"
              style="width: 180px;"
              @change="handleIntervalChange"
              v-model="timeframe">
        <option v-for="item of intervalList"
                :key="item.value"
                :value="item.value">{{item.label}}
        </option>
      </select>
    </div>
    <overview-card>
      <div slot="title">{{node}}(运行时间:{{render_uptime(baseInfo.uptime)}})</div>
      <div slot="content" class="card-content">
        <div class="card-item">
          <line-percent-chart name="icon-cpu"
                              :desc="`${Number((baseInfo.cpu ? baseInfo.cpu : 0)*100).toFixed(1)}% of ${baseInfo.cpuinfo && baseInfo.cpuinfo.cpus && baseInfo.cpuinfo.cpus || 0} CPU(s)`"
                              :value="(baseInfo.cpu ? baseInfo.cpu : 0)*100"
                              title="CPU利用率"/>
          <single-line icon="fa fa-tasks"
                       title="平均负荷"
                       :desc="baseInfo && baseInfo.loadavg && baseInfo.loadavg.join(',')"/>
        </div>
        <div class="card-item">
          <line-percent-chart icon="fa fa-clock-o"
                              :desc="`${Number((baseInfo.cpu ? baseInfo.wait : 0)*100).toFixed(1)}%`"
                              :value="(baseInfo.wait ? baseInfo.wait : 0)*100"
                              title="IO延迟"/>
        </div>
      </div>
      <div slot="content" class="card-content">
        <div class="card-item">
          <line-percent-chart name="icon-ram"
                              :desc="`${Number((baseInfo.memory && baseInfo.memory.used && baseInfo.memory.total ? baseInfo.memory.used / baseInfo.memory.total : 0)*100).toFixed(1)}%
                              (${byteToSize(baseInfo.memory && baseInfo.memory.used || 0)} of ${byteToSize(baseInfo.memory && baseInfo.memory.total || 0)})`"
                              :value="(baseInfo.memory && baseInfo.memory.used && baseInfo.memory.total ? baseInfo.memory.used / baseInfo.memory.total : 0)*100"
                              title="内存使用率"/>
        </div>
        <div class="card-item">
          <single-line title="KSM共享"
                       :desc="baseInfo && baseInfo.ksm && byteToSize(baseInfo.ksm.shared, 'B')"/>
        </div>
      </div>
      <div slot="content" class="card-content">
        <div class="card-item">
          <line-percent-chart icon="fa fa-hdd-o"
                              :desc="`${Number((baseInfo.rootfs && baseInfo.rootfs.used && baseInfo.rootfs.total ? baseInfo.rootfs.used / baseInfo.rootfs.total : 0)*100).toFixed(1)}%
                              (${byteToSize(baseInfo.rootfs && baseInfo.rootfs.used || 0)} of ${byteToSize(baseInfo.rootfs && baseInfo.rootfs.total || 0)})`"
                              :value="(baseInfo.rootfs && baseInfo.rootfs.used && baseInfo.rootfs.total ? baseInfo.rootfs.used / baseInfo.rootfs.total : 0)*100"
                              title="硬盘空间(root)"/>
        </div>
        <div class="card-item">
          <line-percent-chart icon="fa fa-refresh"
                              :desc="`${Number((baseInfo && baseInfo.swap && baseInfo.swap.used && baseInfo.swap.total ? baseInfo.swap.used / baseInfo.swap.total : 0)*100).toFixed(1)}%
                              (${byteToSize(baseInfo && baseInfo.swap && baseInfo.swap.used || 0)} of ${byteToSize(baseInfo.swap && baseInfo.swap.total || 0)})`"
                              :value="(baseInfo && baseInfo.swap && baseInfo.swap.used && baseInfo.swap.total ? baseInfo.swap.used / baseInfo.swap.total : 0)*100"
                              title="SWAP使用率"/>
        </div>
      </div>
      <div slot="content" class="card-content">
        <div class="card-item">
          <single-line title="CPU(s)"
                       :desc="`${baseInfo && baseInfo.cpuinfo && baseInfo.cpuinfo.cpus && baseInfo.cpuinfo.model && baseInfo.cpuinfo.cpus + 'x '+ baseInfo.cpuinfo.model || ''}`"/>
        </div>
      </div>
      <div slot="content" class="card-content">
        <div class="card-item">
          <single-line title="内核版本"
                       :desc="baseInfo && baseInfo.kversion && baseInfo.kversion"/>
        </div>
      </div>
      <div slot="content" class="card-content">
        <div class="card-item">
          <single-line title="PVE管理器版本"
                       :desc="baseInfo && baseInfo.pveversion && baseInfo.pveversion"/>
        </div>
      </div>
    </overview-card>
    <overview-card>
      <div slot="title">CPU利用率</div>
      <template slot="content">
        <line-graph :data="cpu"></line-graph>
      </template>
    </overview-card>
    <overview-card>
      <div slot="title">CPU利用率</div>
      <template slot="content">
        <line-graph :data="loadavg"></line-graph>
      </template>
    </overview-card>
    <overview-card>
      <div slot="title">CPU利用率</div>
      <template slot="content">
        <line-graph :data="memory"></line-graph>
      </template>
    </overview-card>
    <overview-card>
      <div slot="title">CPU利用率</div>
      <template slot="content">
        <line-graph :data="network"></line-graph>
      </template>
    </overview-card>
  </div>
</template>

<script>
  import LinePercentChart from '@src/components/chart/line/LinePercentChart';
  import SingleLine from '@src/components/chart/line/SingleLine';
  import LineGraph from '@src/components/chart/line/LineGraph';
  import OverviewCard from '@src/components/card/OverviewCard';
  import {render_uptime, byteToSize} from "@libs/utils";

  export default {
    name: "Overview",
    components: {
      OverviewCard,
      LinePercentChart,
      SingleLine,
      LineGraph
    },
    data() {
      return {
        node: '',
        baseInfo: {},
        interval: null,
        timeframe: 'hour(AVERAGE)',
        intervalList: [
          {
            label: '小时（平均）',
            value: 'hour(AVERAGE)'
          },
          {
            label: '小时（最大）',
            value: 'hour(MAX)'
          },
          {
            label: '天（平均）',
            value: 'day(AVERAGE)'
          },
          {
            label: '天（最大）',
            value: 'day(MAX)'
          },
          {
            label: '周（平均）',
            value: 'week(AVERAGE)'
          },
          {
            label: '周（最大）',
            value: 'week(MAX)'
          },
          {
            label: '月（平均）',
            value: 'month(AVERAGE)'
          },
          {
            label: '月（最大）',
            value: 'month(MAX)'
          },
          {
            label: '年（平均）',
            value: 'year(AVERAGE)'
          },
          {
            label: '年（最大）',
            value: 'year(MAX)'
          }
        ],
        colors: [
          {
            line: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(148, 174, 10, 1)"
                },
                {
                  offset: 1,
                  color: "rgba(148, 174, 10, 0.1)"
                }
              ],
              globalCord: false
            },
            start: "rgba(148, 174, 10, 0.1)",
            end: "rgba(148, 174, 10, 1)"
          },
          {
            line: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(18, 94, 166, 1)"
                },
                {
                  offset: 1,
                  color: "rgba(18, 94, 166, 0.1)"
                }
              ],
              globalCord: false
            },
            start: "rgba(18, 94, 166, 0.1)",
            end: "rgba(18, 94, 166, 1)"
          }
        ],
        cpu: {
          value: [],
          label: ['CPU使用率', 'IO延迟']
        },
        loadavg: {
          value: [],
          label: ['平均负荷']
        },
        memory: {
          value: [],
          label: ['总额', '内存使用率']
        },
        network: {
          value: [],
          label: ['netin', 'netout']
        }
      }
    },
    methods: {
      render_uptime,
      byteToSize,
      __init__() {
        let last = window.localStorage.getItem("lastsel") || '[]';
        this.node = (JSON.parse(last).node && JSON.parse(last).node) || '';
        this.queryResource();
        this.queryRrdData();
      },
      queryResource() {
        this.$http.get(`/json/nodes/${this.node}/status`)
          .then(res => {
            this.baseInfo = res.data;
          })
      },
      queryRrdData() {
        this.$http.get(`/json/nodes/${this.node}/rrddata?timeframe=${this.timeframe.replace(/(.*?)\((.*?)\)/g, '$1')}&cf=${this.timeframe.replace(/(.*?)\((.*?)\)/g, '$2')}`)
          .then(res => {
            this.cpu = Object.assign({}, this.cpu, {
              value: [res.data.map(it => it.cpu * 100), res.data.map(it => it.iowait * 100)],
              color: this.colors,
              time: res.data.map(it => it.time)
            })
            this.loadavg = Object.assign({}, this.loadavg, {
              value: [res.data.map(it => it.loadavg)],
              color: this.colors,
              time: res.data.map(it => it.time),
              title: '平均负荷'
            })
            this.memory = Object.assign({}, this.memory, {
              value: [res.data.map(it => it.memtotal), res.data.map(it => it.memused)],
              color: this.colors,
              func: this.byteToSize,
              time: res.data.map(it => it.time)
            })
            this.network = Object.assign({}, this.network, {
              value: [res.data.map(it => it.netin), res.data.map(it => it.netout)],
              color: this.colors,
              func: this.byteToSize,
              time: res.data.map(it => it.time)
            })
          })
      },
      handleIntervalChange(){
        this.queryRrdData();
        if(this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
        this.interval = setInterval(() => this.queryResource(), 60 * 1000);
      },
    },
    mounted() {
      this.__init__();
      this.interval = setInterval(() => this.queryResource(), 3000);
    },
    beforeDestroy() {
      if (this.interval)
        clearInterval(this.interval);
      this.interval = null;
    }
  }
</script>

<style scoped lang="less">
  .overview {
    &-select {
      margin: 5px 10px;
      position: relative;
      background-color: #fff;
      text-align: right;

      &:after {
        position: absolute;
        top: 36%;
        right: 11px;
        background-color: transparent;
        color: #52545c;
        font: normal normal normal 12px FontAwesome;
        content: "\F0D7";
        pointer-events: none;
        font-size: 11px;
      }
    }
  }
</style>
