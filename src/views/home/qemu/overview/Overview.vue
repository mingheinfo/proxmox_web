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
    <div style="display: inline;">
      <overview-card style="width: calc(calc(100% / 4) - 23px)">
        <div slot="title">状态</div>
        <div slot="content" class="card-content">
          <div class="card-item">
            <single-line title="状态"
                         icon="fa fa-info"
                         :desc="db.qemuObj && db.qemuObj.status && db.qemuObj.status"/>
            <single-line icon="fa fa-heartbeat"
                         title="HA状态"
                         :desc="db.qemuObj && db.qemuObj.ha && db.qemuObj.ha.status ? db.qemuObj.ha.status : '无'"/>
            <single-line icon="fa fa-building"
                         title="节点"
                         :desc="node && node.parent && node.parent"/>
            <line-percent-chart name="icon-ram"
                                :desc="`${Number((db.qemuObj.cpu && db.qemuObj.cpu && db.qemuObj.cpus ? db.qemuObj.cpu / db.qemuObj.cpus : 0)*100).toFixed(1)}%
                               of ${db.qemuObj.cpus && db.qemuObj.cpus || 0} CPU(s)`"
                                :value="(db.qemuObj.cpu && db.qemuObj.cpu && db.qemuObj.cpus ? db.qemuObj.cpu / db.qemuObj.cpus : 0)*100"
                                title="CPU使用率"/>
            <line-percent-chart name="icon-ram"
                                :desc="`${Number((db.qemuObj.mem && db.qemuObj.mem && db.qemuObj.maxmem ? db.qemuObj.mem / db.qemuObj.maxmem : 0)*100).toFixed(1)}%
                              (${byteToSize(db.qemuObj.mem && db.qemuObj.mem || 0)} of ${byteToSize(db.qemuObj.maxmem && db.qemuObj.maxmem || 0)})`"
                                :value="(db.qemuObj.mem && db.qemuObj.mem && db.qemuObj.maxmem ? db.qemuObj.mem / db.qemuObj.maxmem : 0)*100"
                                title="内存使用率"/>
            <single-line icon="fa fa-hdd-o"
                         title="节点"
                         :desc="db.qemuObj && db.qemuObj.maxdisk && byteToSize(db.qemuObj.maxdisk)"/>
            <single-line icon="fa fa-exchange"
                         title="IPs"
                         :desc="'Guset Agent'"/>
          </div>
        </div>
      </overview-card>
      <overview-card style="width: calc(calc(100% / 4) - 23px)">
        <div slot="title">备注</div>
        <div slot="operate" class="m-tool-img" @click.stop="handleComment"></div>
        <div slot="content" class="card-content">
           {{this.config.description}}
        </div>
      </overview-card>
    </div>
    <overview-card>
      <div slot="title">CPU利用率</div>
      <template slot="content">
        <line-graph :data="cpu"></line-graph>
      </template>
    </overview-card>
    <overview-card>
      <div slot="title">内存利用率</div>
      <template slot="content">
        <line-graph :data="memory"></line-graph>
      </template>
    </overview-card>
    <overview-card>
      <div slot="title">网络流量</div>
      <template slot="content">
        <line-graph :data="network"></line-graph>
      </template>
    </overview-card>
    <overview-card>
      <div slot="title">磁盘IO</div>
      <template slot="content">
        <line-graph :data="disk"></line-graph>
      </template>
    </overview-card>
    <Dialog :visible="showComment"
            @close="showComment = false"
            @confirm="confirm"
            @cancel="cancel"
            cancelText="重置"
            title="备注">
      <template slot="content">
        <div>
          <textarea class="m-overview-comment" v-model="comment"/>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script>
  import LinePercentChart from '@src/components/chart/line/LinePercentChart';
  import QemuOverviewHttp from '@src/views/home/qemu/overview/http';
  import SingleLine from '@src/components/chart/line/SingleLine';
  import LineGraph from '@src/components/chart/line/LineGraph';
  import OverviewCard from '@src/components/card/OverviewCard';
  import {render_uptime, byteToSize} from "@libs/utils";
  import Dialog from "@src/components/dialog/Dialog";

  export default {
    name: "Overview",
    mixins: [QemuOverviewHttp],
    components: {
      Dialog,
      OverviewCard,
      LinePercentChart,
      SingleLine,
      LineGraph
    },
    data() {
      return {
        node: '',
        comment: '',
        showComment: false,
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
        },
        disk: {
          value: [],
          label: ['diskread', 'diskwrite']
        },
        config: {}
      }
    },
    methods: {
      render_uptime,
      byteToSize,
      __init__() {
        let last = window.localStorage.getItem("lastsel") || '[]';
        this.node = (JSON.parse(last) && JSON.parse(last)) || '';
        this.queryRrdData();
        this.queryConfig();
      },
      handleIntervalChange(){
        this.queryRrdData();
        if(this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
        this.interval = setInterval(() => this.queryRrdData(), 60 * 1000);
      },
      handleComment() {
        this.showComment = true;
      },
      confirm() {
        this.setComment();
      },
      cancel() {
        this.comment = "";
      }
    },
    mounted() {
      this.__init__();
    },
    destroyed() {
      if (this.interval)
        window.clearInterval(this.interval);
      this.interval = null;
    },
    watch: {
      '$store.state.db.lastSelectObj': function(newVal, oldVal) {
        if(newVal !== oldVal && newVal.type === 'qemu') {
         this.__init__()
        }
      }
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
  .m-tool-img{
    background-image: url("~@images/tool-sprites.png");
    overflow: hidden;
    width: 16px;
    height: 16px;
    margin: 0;
    filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=80);
    opacity: 0.8;
    background-position: 0 -96px;
    display: inline-block;
  }

  .m-overview-comment{
    width: 100%;
    height: 100%;
    min-height: 170px;
    border-color: #e0eaf3;
    padding-left: 5px;
  }
</style>
