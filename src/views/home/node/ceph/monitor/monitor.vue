<template>
  <div class="ceph-monitor">
    <div class="ceph-monitor-monitor">
      <overview-card>
        <div slot="title">配置</div>
        <div slot="content" class="card-content">
          <page-template>
            <div slot="toolbar-left">
              <m-button
                icon="fa fa-play"
                type="primary"
                :disabled="
                  selectedList.length !== 1 || !inState('stopped', 'unknown')
                "
                @on-click="handleOperate('start')"
                >启动</m-button
              >
              <m-button
                icon="fa fa-stop"
                type="danger"
                :disabled="selectedList.length !== 1"
                @on-click="handleOperate('stop')"
                >停止</m-button
              >
              <m-button
                icon="fa fa-refresh"
                type="primary"
                :disabled="selectedList.length !== 1"
                @on-click="handleOperate('restart')"
                >重启</m-button
              >
              <m-button
                icon="el-icon-plus"
                type="primary"
                @on-click="showModal('mon')"
                >创建</m-button
              >
              <m-button
                icon="el-icon-delete"
                type="danger"
                :disabled="selectedList.length !== 1"
                @on-click="handleOperate('restart')"
                >销毁</m-button
              >
              <m-button
                icon="el-icon-document"
                type="info"
                :disabled="selectedList.length !== 1"
                @on-click="showMonitorLog('mon')"
                >系统日志</m-button
              >
              <m-button
                icon="el-icon-refresh"
                type="info"
                @on-click="__init__()"
                >刷新</m-button
              >
            </div>
            <div slot="page-content">
              <el-table :data="mon" @selection-change="handleSelect">
                <el-table-column
                  type="selection"
                  width="55px;"
                ></el-table-column>
                <el-table-column label="名称">
                  <template slot-scope="scope">
                    mon.{{ scope.row.name }}
                  </template>
                </el-table-column>
                <el-table-column label="主机" prop="host"></el-table-column>
                <el-table-column label="地址" prop="addr"></el-table-column>
                <el-table-column label="状态" prop="state">
                  <template slot-scope="scope">
                    <table-info-state
                      :state="scope.row.state"
                      :content="scope.row.state"
                    ></table-info-state>
                  </template>
                </el-table-column>
                <el-table-column
                  label="版本"
                  prop="ceph_version_short"
                ></el-table-column>
                <el-table-column label="法定" prop="quorum">
                  <template slot-scope="scope">
                    <table-info-state
                      :state="scope.row.quorum == 1 ? 'actived' : 'unActived'"
                      :content="scope.row.quorum == 1 ? '是' : '否'"
                    ></table-info-state>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </page-template>
        </div>
      </overview-card>
    </div>
    <div class="ceph-monitor-manager">
      <overview-card>
        <div slot="title">配置</div>
        <div slot="content" class="card-content">
          <page-template>
            <div slot="toolbar-left">
              <m-button
                icon="fa fa-play"
                type="primary"
                :disabled="mgrSelectedList.length !== 1 || !inState('stopped')"
                @on-click="handleOperate('start')"
                >启动</m-button
              >
              <m-button
                icon="fa fa-stop"
                type="danger"
                :disabled="mgrSelectedList.length !== 1"
                @on-click="handleOperate('stop')"
                >停止</m-button
              >
              <m-button
                icon="fa fa-refresh"
                type="primary"
                :disabled="mgrSelectedList.length !== 1"
                @on-click="handleOperate('restart')"
                >重启</m-button
              >
              <m-button
                icon="el-icon-plus"
                type="primary"
                @on-click="showModal('mgr')"
                >创建</m-button
              >
              <m-button
                icon="el-icon-delete"
                type="danger"
                :disabled="mgrSelectedList.length !== 1"
                @on-click="handleOperate('delete')"
                >销毁</m-button
              >
              <m-button
                icon="el-icon-document"
                type="info"
                :disabled="mgrSelectedList.length !== 1"
                @on-click="showMonitorLog('mgr')"
                >系统日志</m-button
              >
              <m-button
                icon="el-icon-refresh"
                type="info"
                @on-click="__init__()"
                >刷新</m-button
              >
            </div>
            <div slot="page-content">
              <el-table :data="mgr" @selection-change="handleMgrSelect">
                <el-table-column
                  type="selection"
                  width="55px;"
                ></el-table-column>
                <el-table-column label="名称">
                  <template slot-scope="scope">
                    mgr.{{ scope.row.name }}
                  </template>
                </el-table-column>
                <el-table-column label="主机" prop="host"></el-table-column>
                <el-table-column label="地址" prop="addr"></el-table-column>
                <el-table-column label="状态" prop="state"></el-table-column>
                <el-table-column
                  label="版本"
                  prop="ceph_version_short"
                ></el-table-column>
              </el-table>
            </div>
          </page-template>
        </div>
      </overview-card>
    </div>
    <add-monitor-modal
      :visible="visible"
      v-if="visible"
      :title="title"
      :modal-type="modalType"
      @close="
        visible = false;
        __init__();
      "
    ></add-monitor-modal>
    <show-log
      :visible="visibleLog"
      v-if="visibleLog"
      :modalType="modalType"
      :title="title"
      @close="
        visibleLog = false;
        __init__();
      "
      :param="param"
    ></show-log>
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
                    {{ dateFormat(new Date(item * 1000), "yyyy-MM-dd hh:mm") }}
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
</template>

<script>
import PageTemplate from "@src/components/page/PageTemplate";
import OverviewCard from "@src/components/card/OverviewCard";
import CephHttp from "@src/views/home/node/ceph/http";
import AddMonitorModal from "./AddMonitorModal";
import showLog from "./showLog";
import { dateFormat } from "@libs/utils/index";
export default {
  name: "monitor",
  mixins: [CephHttp],
  components: {
    AddMonitorModal,
    PageTemplate,
    OverviewCard,
    showLog,
  },
  data() {
    return {
      mon: [],
      mgr: [],
      modalType: "",
      visible: false,
      selectedList: [],
      visibleLog: false,
      param: {},
      mgrSelectedList: [],
      showLog: false,
      tab: "log",
      interVal: null,
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //格式化日期
    dateFormat,
    __init__() {
      this.queryMonitor("mon").then((res) => {
        this.mon = res;
      });
      this.queryMonitor("mgr").then((res) => {
        this.mgr = res;
      });
    },
    //展示弹框
    showModal(type) {
      this.modalType = type;
      this.title = type === "mon" ? "创建：监视器" : "创建：管理员";
      this.visible = true;
    },
    closeLog() {
      this.showLog = false;
      this.__init__();
    },
    stopTask1() {
      this.stopTask(
        this.db.addClusterStatusObj.node,
        this.db.addClusterStatusObj.upid
      );
    },
    //查看系统日志
    showMonitorLog(type) {
      this.param =
        type === "mon" ? this.selectedList[0] : this.mgrSelectedList[0];
      this.modalType = type;
      this.title =
        type === "mon"
          ? "查看：Cepn 监视器系统日志"
          : "查看：Ceph 管理员系统日志";
      this.visibleLog = true;
    },
    handleTabChange(value) {
      this.tab = value;
    },
    //选择mon
    handleSelect(row) {
      this.selectedList = row;
      this.modalType = "mon";
    },
    //删除、重启、停止等操作
    handleOperate(operate) {
      if(operate !== 'delete') {
        this.$confirm
          .confirm({
            msg: "确认要进行以下操作吗?",
            icon: "icon-warning",
          })
          .then((res) => {
            let selectedList =
              this.modalType === "mon"
                ? this.selectedList[0]
                : this.mgrSelectedList[0];
            this.operateCeph(selectedList.host, operate, {
              service: "mon." + selectedList.name,
            }).then((res) => {
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
          });
      } else {
        this.$confirm
          .confirm({
            msg: "确认要进行以下操作吗?",
            icon: "icon-warning",
          })
          .then((res) => {
            let selectedList =
              this.modalType === "mon"
                ? this.selectedList[0]
                : this.mgrSelectedList[0];
            this.deleteMgr(selectedList.host).then((res) => {
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
          })
      }
    },
    //选择mgr
    handleMgrSelect(row) {
      this.mgrSelectedList = row;
      this.modalType = "mgr";
    },
    //判断是否在某个状态下
    inState() {
      let states = [],
        _this = this;
      for (let i = 0; i < arguments.length; i++) {
        states.push(arguments[i]);
      }
      return states.some((state) => {
        if (_this.modalType === "mon") {
          return state === _this.selectedList[0].state;
        }
        if (_this.modalType === "mgr") {
          return state === _this.mgrSelectedList[0].state;
        }
      });
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

<style scoped lang="less">
.ceph-monitor {
  width: 100%;
  &-monitor {
    height: 50%;
    margin-bottom: 20px;
  }
  &-manager {
    height: 50%;
  }
}
.card {
  width: 100%;
}
/deep/.tool-bar-left {
  flex-grow: 3 !important;
}
</style>
