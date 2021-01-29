<template>
  <m-dialog
    :visible="visible"
    :title="title"
    @cancel="close"
    @close="close"
    @confirm="confirm"
  >
    <div slot="content">
      <template v-if="modalType === 'metadata'">
        <m-select
          prop="nodename"
          v-model="nodename"
          @on-change="(value) => (nodename = value)"
          vidateEvent
          @validate="validate"
          required
          :show-error="rules['nodename'].error"
          :error-msg="rules['nodename'].message"
          label="主机"
          labelWidth="100px"
        >
          <template v-for="(item, index) in nodeList">
            <m-option :label="item.node" :key="item.node" :value="item.node">
              <div class="table-tr" v-show="index === 0">
                <div class="table-td">名称</div>
                <div class="table-td">使用率</div>
                <div class="table-td">cpu</div>
              </div>
              <div class="table-tr">
                <div class="table-td">{{ item.node }}</div>
                <div class="table-td" style="height: 28px; line-height: 28px">
                  <line-charts style="margin: 11px 0px;"
                    :value="
                      Number(
                        (item && item.maxmem && item.mem
                          ? item.mem / item.maxmem
                          : 0) * 100
                      )
                    "
                  ></line-charts>
                </div>
                <div class="table-td" style="height: 28px; line-height: 28px">
                  <line-charts style="margin: 11px 0px;"
                    :value="Number((item && item.cpu ? item.cpu : 0) * 100)"
                  ></line-charts>
                </div>
              </div>
            </m-option>
          </template>
        </m-select>
      </template>
      <template v-if="modalType === 'cephfs'">
        <m-input
          v-model="name"
          label="名称"
          labelWidth="110px"
          @validate="validate"
          :validateEvent="true"
          prop="name"
          required
          :show-error="rules['name'].error"
          :error-msg="rules['name'].message"
        />
        <m-input
          v-model="placement_groups"
          label="Placement Groups"
          labelWidth="110px"
          @validate="validate"
          :validateEvent="true"
          prop="placement_groups"
          required
          :show-error="rules['placement_groups'].error"
          :error-msg="rules['placement_groups'].message"
        />
        <m-checkbox
          v-model="add_storage"
          label="添加存储"
          labelWidth="110px"
        ></m-checkbox>
        <div class="warning">将行的CephFs添加到集群存储配置</div>
      </template>
      <template v-if="modalType === 'log'">
          <div slot="toolbar-right" style="flex: 2 1 auto">
            <m-input
              prop="expire"
              labelWidth="60px"
              label="选择日期"
              style="vertical-align: top"
              :__conStyle="{ width: '355px' }"
            >
              <template slot="other">
                <el-date-picker
                  v-model="datetime"
                  type="daterange"
                  format="yyyy-MM-dd hh:mm"
                  value-format="yyyy-MM-dd hh:mm"
                  placeholder="选择日期"
                >
                </el-date-picker>
              </template>
            </m-input>
            <m-button
              type="primary"
              style="vertical-align: middle"
              @on-click="__init__()"
              icon="el-icon-refresh"
              >更新</m-button
            >
          </div>
          <div slot="page-content">
            <ul class="log-content">
              <el-scrollbar style="height: 450px">
                <li v-for="log in logList" :key="log.n">{{ log.t }}</li>
              </el-scrollbar>
            </ul>
          </div>
      </template>
      <m-dialog
        :visible="showLog"
        @close="closeLog"
        :_style="{
          width: '800px',
        }"
        title="Task Viewer: 任务进度"
      >
        <template slot="content">
          <m-tab v-model="tab" @tab-click="handleTabChange">
            <m-tab-panel label="输出" name="log"></m-tab-panel>
            <m-tab-panel label="状态" name="status"></m-tab-panel>
          </m-tab>
          <m-button
            class="create-btn m-margin-top-10"
            type="primary"
            @on-click="stopTask1"
            :disabled="db.addClusterStatusObj.status !== 'running'"
            >停止</m-button
          >
          <el-scrollbar style="height: 100%">
            <div class="taskmodal-content">
              <div class="table" v-if="tab === 'log'">
                <div
                  class="table-tr"
                  v-for="item in db.addClusterLogList"
                  :key="item.n"
                >
                  {{ item.t }}
                </div>
              </div>
              <div class="table" v-if="tab === 'status'">
                <template v-for="(item, key) in db.addClusterStatusObj">
                  <div
                    class="table-tr"
                    v-if="!['exitstatus', 'id', 'pstart'].includes(key)"
                    :key="key"
                  >
                    <div class="table-td">{{ $t(`clusterStatus.${key}`) }}</div>
                    <div class="table-td" v-if="key === 'starttime'">
                      {{
                        dateFormat(new Date(item * 1000), "yyyy-MM-dd hh:mm")
                      }}
                    </div>
                    <div class="table-td" v-else>{{ item }}</div>
                  </div>
                </template>
              </div>
            </div>
          </el-scrollbar>
        </template>
        <template slot="footer">
          <span></span>
        </template>
      </m-dialog>
    </div>
    <template slot="footer" v-if="modalType === 'log'">
      <div></div>
    </template>
  </m-dialog>
</template>

<script>
import LineCharts from "@src/components/chart/line/LineCharts";
import CephHttp from "@src/views/home/node/ceph/http";
import { quickSort, dateFormat } from "@libs/utils/index";
import PageTemplate from "@src/components/page/PageTemplate";
export default {
  name: "CreateCephFs",
  mixins: [CephHttp],
  props: {
    visible: Boolean,
    title: String,
    modalType: String,
    param: Object,
  },
  components: {
    LineCharts,
    PageTemplate,
  },
  data() {
    return {
      nodename: "",
      nodeList: [],
      name: "",
      add_storage: false,
      placement_groups: 128,
      showLog: false,
      tab: "log",
      interVal: null,
      logList: [],
      datetime: [
        dateFormat(
          new Date(new Date().getTime() - 4 * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd hh:mm"
        ),
        dateFormat(new Date(), "yyyy-MM-dd hh:mm"),
      ],
      rules: {
        nodename: {
          error: false,
          message: "",
        },
        name: {
          error: false,
          message: "",
        },
        placement_groups: {
          error: false,
          message: "",
        },
      },
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
		dateFormat,
    __init__() {
      let _this = this;
      //当为虚拟机是过滤为添加的虚拟机
      //请求存储
      _this.queryNodes().then((res) => {
        _this.nodeList = quickSort(this.db.nodeList, "node", "+");
        _this.nodename = _this.nodeList ? _this.nodeList[0].node : "";
      });
      if (this.modalType === "log") {
        this.querySysLog();
        this.interVal = setInterval(() => {
          this.querySysLog();
        }, 3000);
      }
    },
    closeLog() {
      this.showLog = false;
      this.close();
    },
    stopTask1() {
      this.stopTask(
        this.db.addClusterStatusObj.node,
        this.db.addClusterStatusObj.upid
      );
    },
    handleTabChange(value) {
      this.tab = value;
    },
    querySysLog() {
      this.logContent = "";
      this.queryServiceLog(this.param.name, {
        service: `ceph-mds@${this.param.name}`,
        _dc: new Date().getTime(),
        start: 0,
        limit: 500,
        since: this.datetime[0],
        until: this.datetime[1],
      }).then((res) => {
        this.logList = res;
      });
    },
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "不能为空!";
        return;
      }
    },
    //校验所有
    validateAll() {
      let props = [];
      if (this.modalType === "metadata") {
        props = ["nodename"];
      }
      if (this.modalType === "cephfs") {
        props = ["name", "placement_groups"];
      }
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    //关闭弹框
    close() {
      this.$emit("close");
    },
    //确定添加
    confirm() {
      if (this.validateAll()) return;
      if (this.modalType === "metadata") {
        this.addMds(this.nodename)
          .then((res) => {
            this.showLog = true;
            this.interVal = setInterval(() => {
              this.queryStatus(
                this.db.addClusterStatusObj.node,
                this.db.addClusterStatusObj.upid
              );
              this.queryLog(
                this.db.addClusterStatusObj.node,
                this.db.addClusterStatusObj.upid
              );
            }, 3000);
          });
      } else {
        let param = {
          pg_num: this.placement_groups,
          "add-storage": this.add_storage ? 1 : 0,
        };
        this.addCephfs(this.name, param).then((res) => {
          this.showLog = true;
          this.interVal = setInterval(() => {
            this.queryStatus(
              this.db.addClusterStatusObj.node,
              this.db.addClusterStatusObj.upid
            );
            this.queryLog(
              this.db.addClusterStatusObj.node,
              this.db.addClusterStatusObj.upid
            );
          }, 3000);
        });
      }
    },
  },
  beforeDestroy() {
    if (this.interVal) {
      clearInterval(this.interVal);
      this.interVal = null;
    }
  },
};
</script>
