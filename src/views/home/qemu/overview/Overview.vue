<template>
  <div class="overview chart-content">
    <div class="overview-select">
      <m-select @on-change="handleIntervalChange" v-model="timeframe">
        <m-option
          v-for="item of intervalList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </m-option>
      </m-select>
    </div>
    <div class="overview-content__top">
      <div class="overview-content__top_left" :style="{'padding-right': isTempalte ? '0px' : '20px', 'margin-bottom': isTempalte ? '0px' : '20px'}">
        <overview-card>
          <div slot="title">状态</div>
          <div
            slot="content"
            class="card-content"
            v-loading="loading"
            :element-loading-text="loadingText"
          >
            <div class="card-item">
              <single-line
                title="状态"
                icon="fa fa-info"
                :desc="db.qemuObj && db.qemuObj.status && db.qemuObj.status"
              />
              <single-line
                icon="fa fa-heartbeat"
                title="HA状态"
                :desc="
                  db.qemuObj && db.qemuObj.ha && db.qemuObj.ha.status
                    ? db.qemuObj.ha.status
                    : '无'
                "
              />
              <single-line
                icon="fa fa-building"
                title="节点"
                :desc="node && node.parent && node.parent"
              />
              <line-percent-chart
                name="icon-ram"
                :desc="`${Number(
                  (db.qemuObj.cpu && db.qemuObj.cpu && db.qemuObj.cpus
                    ? db.qemuObj.cpu / db.qemuObj.cpus
                    : 0) * 100
                ).toFixed(1)}%
                               of ${
                                 (db.qemuObj.cpus && db.qemuObj.cpus) || 0
                               } CPU(s)`"
                :value="
                  (db.qemuObj.cpu && db.qemuObj.cpu && db.qemuObj.cpus
                    ? db.qemuObj.cpu / db.qemuObj.cpus
                    : 0) * 100
                "
                title="CPU使用率"
              />
              <line-percent-chart
                name="icon-ram"
                :desc="`${Number(
                  (db.qemuObj.mem && db.qemuObj.mem && db.qemuObj.maxmem
                    ? db.qemuObj.mem / db.qemuObj.maxmem
                    : 0) * 100
                ).toFixed(1)}%
                              (${byteToSize(
                                (db.qemuObj.mem && db.qemuObj.mem) || 0
                              )} of ${byteToSize(
                  (db.qemuObj.maxmem && db.qemuObj.maxmem) || 0
                )})`"
                :value="
                  (db.qemuObj.mem && db.qemuObj.mem && db.qemuObj.maxmem
                    ? db.qemuObj.mem / db.qemuObj.maxmem
                    : 0) * 100
                "
                title="内存使用率"
              />
              <single-line
                icon="fa fa-hdd-o"
                title="节点"
                :desc="
                  db.qemuObj &&
                  db.qemuObj.maxdisk &&
                  byteToSize(db.qemuObj.maxdisk)
                "
              />
              <single-line
                icon="fa fa-exchange"
                title="IPs"
                :desc="'Guset Agent'"
              />
            </div>
          </div>
        </overview-card>
        <overview-card>
          <div slot="title">备注</div>
          <div
            slot="operate"
            class="m-tool-img"
            @click.stop="handleComment"
          ></div>
          <div slot="content" class="card-content" ref="comment-content">
            <ace-editor
              v-model="comment"
              :read-only="true"
              style="width: 100%; height: 250px"
              ref="ace-comment"
            ></ace-editor>
          </div>
        </overview-card>
      </div>
      <div class="overview-content__top_right" v-if="!isTempalte">
        <overview-card>
          <div slot="title">CPU利用率</div>
          <template slot="content">
            <line-graph :data="cpu"></line-graph>
          </template>
        </overview-card>
      </div>
    </div>
    <div class="overview-content__center" v-if="!isTempalte">
      <div class="overview-content__center_left">
         <overview-card>
      <div slot="title">内存利用率</div>
      <template slot="content">
        <line-graph :data="memory"></line-graph>
      </template>
    </overview-card>
      </div>
      <div class="overview-content__center_right">
        <overview-card>
      <div slot="title">网络流量</div>
      <template slot="content">
        <line-graph :data="network"></line-graph>
      </template>
    </overview-card>
      </div>
    </div>
    <overview-card v-if="!isTempalte">
      <div slot="title">磁盘IO</div>
      <template slot="content">
        <line-graph :data="disk"></line-graph>
      </template>
    </overview-card>
    <Dialog
      :visible="showComment"
      @close="showComment = false"
      @confirm="confirm"
      @cancel="cancel"
      cancelText="重置"
      :_style="{
        width: '800px',
      }"
      title="备注"
    >
      <div slot="content" ref="content">
        <ace-editor v-model="comment" ref="ace-editor"></ace-editor>
      </div>
    </Dialog>
  </div>
</template>

<script>
import LinePercentChart from "@src/components/chart/line/LinePercentChart";
import QemuOverviewHttp from "@src/views/home/qemu/overview/http";
import SingleLine from "@src/components/chart/line/SingleLine";
import LineGraph from "@src/components/chart/line/LineGraph";
import OverviewCard from "@src/components/card/OverviewCard";
import { render_uptime, byteToSize } from "@libs/utils";
import Dialog from "@src/components/dialog/Dialog";
import AceEditor from "@src/components/ace/AceEditor";

export default {
  name: "Overview",
  mixins: [QemuOverviewHttp],
  components: {
    Dialog,
    OverviewCard,
    LinePercentChart,
    SingleLine,
    LineGraph,
    AceEditor,
  },
  data() {
    return {
      node: "",
      comment: "",
      showComment: false,
      interval: null,
      timeframe: "hour(AVERAGE)",
      loading: false,
      loadingText: "",
      isTempalte: false,
      intervalList: [
        {
          label: "小时（平均）",
          value: "hour(AVERAGE)",
        },
        {
          label: "小时（最大）",
          value: "hour(MAX)",
        },
        {
          label: "天（平均）",
          value: "day(AVERAGE)",
        },
        {
          label: "天（最大）",
          value: "day(MAX)",
        },
        {
          label: "周（平均）",
          value: "week(AVERAGE)",
        },
        {
          label: "周（最大）",
          value: "week(MAX)",
        },
        {
          label: "月（平均）",
          value: "month(AVERAGE)",
        },
        {
          label: "月（最大）",
          value: "month(MAX)",
        },
        {
          label: "年（平均）",
          value: "year(AVERAGE)",
        },
        {
          label: "年（最大）",
          value: "year(MAX)",
        },
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
                color: "rgba(148, 174, 10, 1)",
              },
              {
                offset: 1,
                color: "rgba(148, 174, 10, 0.1)",
              },
            ],
            globalCord: false,
          },
          start: "rgba(148, 174, 10, 0.1)",
          end: "rgba(148, 174, 10, 1)",
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
                color: "rgba(18, 94, 166, 1)",
              },
              {
                offset: 1,
                color: "rgba(18, 94, 166, 0.1)",
              },
            ],
            globalCord: false,
          },
          start: "rgba(18, 94, 166, 0.1)",
          end: "rgba(18, 94, 166, 1)",
        },
      ],
      cpu: {
        value: [],
        label: ["CPU使用率", "IO延迟"],
      },
      loadavg: {
        value: [],
        label: ["平均负荷"],
      },
      memory: {
        value: [],
        label: ["总额", "内存使用率"],
      },
      network: {
        value: [],
        label: ["netin", "netout"],
      },
      disk: {
        value: [],
        label: ["diskread", "diskwrite"],
      },
      config: {},
    };
  },
  methods: {
    render_uptime,
    byteToSize,
    __init__() {
      let last = window.localStorage.getItem("lastsel") || "[]";
      this.node = (JSON.parse(last) && JSON.parse(last)) || "";
      this.queryResource().then((res) => {
        this.isTempalte =
          this.db.qemuObj &&
          this.db.qemuObj.template &&
          this.db.qemuObj.template === 1
            ? true
            : false;
      });
      this.queryConfig().catch((res) => {
        this.comment = res ? res : "";
      });
      this.handleIntervalChange(this.timeframe);
    },
    handleIntervalChange(value) {
      this.timeframe = value;
      this.queryRrdData();
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      this.interval = setInterval(() => this.queryRrdData(), 60 * 1000);
    },
    handleComment() {
      let _this = this;
      _this.comment = _this.comment ? _this.comment : "";
      _this.showComment = true;
      _this.$nextTick(() => {
        _this.$refs[`ace-editor`].$el.style.height =
          _this.$refs["content"].parentElement.clientHeight - 30 + "px";
        window.addEventListener("resize", _this.updateAceEditorHeight, false);
      });
    },
    confirm() {
      this.setComment();
      window.removeEventListener("resize", this.updateAceEditorHeight, false);
    },
    cancel() {
      this.comment = "";
    },
    /***
     * 当弹框高度变化是计算弹框高度
     */
    updateAceEditorHeight() {
      let _this = this;
      _this.$refs[`ace-editor`].$el.style.height =
        _this.$refs["content"].parentElement.clientHeight - 30 + "px";
    },
  },
  /**
   * 初始化请求
   */
  mounted() {
    let _this = this;
    _this.__init__();
  },
  beforeDestroy() {
    if (this.interval) {
      window.clearInterval(this.interval);
      this.interval = null;
    }
  },
  watch: {
    "$store.state.db.lastSelectObj": function (newVal, oldVal) {
      if (newVal !== oldVal && newVal.type === "qemu") {
        this.__init__();
      }
    },
  },
};
</script>

<style scoped lang="less">
.overview {
  &-select {
    margin: 5px 10px;
    position: relative;
    background-color: #fff;
    text-align: right;
  }
}
.m-tool-img {
  background-image: url("~@images/tool-sprites.png");
  overflow: hidden;
  width: 16px;
  height: 14px;
  margin: 0;
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=80);
  opacity: 0.8;
  background-position: 0 -97px;
  display: inline-block;
}

.m-overview-comment {
  width: 100%;
  height: 100%;
  min-height: 170px;
  border-color: #e0eaf3;
  padding-left: 5px;
}
.overview-content {
  &__top {
    height: 340px;
    display: flex;
    background: #f5f5f5;
    &_right {
      flex-grow: 1;
      flex-basis: auto;
      flex-shrink: 1;
      flex-wrap: nowrap;
      display: flex;
      width: 0;
    }
    &_left {
      flex-grow: 1;
      flex-basis: auto;
      flex-shrink: 1;
      flex-wrap: nowrap;
      padding-right: 20px;
      width: 0;
      display: flex;
    }
  }
  &__center{
     height: 340px;
     display: flex;
     background: #f5f5f5;
    &_right{
      flex-grow: 1;
      flex-basis: auto;
      flex-shrink: 1;
      flex-wrap: nowrap;
      width: 0;
    }
    &_left {
      flex-grow: 1;
      flex-basis: auto;
      flex-shrink: 1;
      flex-wrap: nowrap;
      padding-right: 20px;
      width: 0;
    }
  }
}
.card{
  height: 320px;
}
</style>
