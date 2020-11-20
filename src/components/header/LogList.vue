<template>
  <div class="log" v-show="visible">
    <div class="btn" @click="$emit('close')">
      <span class="btn-txt">隐藏</span
      ><i class="el-icon-d-arrow-right btn-icon"></i>
    </div>
    <m-scrollbar v-if="visible">
			<m-tab v-model="logType" @tab-click="handleLogTypeChange" class="log-tab">
				<m-tab-panel label="任务" name="task"></m-tab-panel>
				<m-tab-panel label="集群" name="cluster"></m-tab-panel>
      </m-tab>
      <div v-if="logType === 'task'" class="log-wrapper">
        <div
          v-for="item in taksList"
          :key="item.upid"
          class="log-item"
          @click="handleShowTasks(item)"
          :title="render_upid(item.pid, null, item)"
        >
          <base-icon
            :name="
              item.status
                ? item.status === 'OK'
                  ? 'status-ok'
                  : 'status-error'
                : 'loading'
            "
            style="width: 25px; height: 25px"
          ></base-icon>
          <span>{{ render_upid(item.pid, null, item) }}</span>
          <div class="log-time">
            开始时间：{{
              dateFormat(new Date(item.starttime * 1000), "yyyy-MM-dd hh:mm")
            }}
          </div>
          <div v-if="item.endtime" class="log-time">
            结束时间：{{
              dateFormat(new Date(item.endtime * 1000), "yyyy-MM-dd hh:mm")
            }}
          </div>
        </div>
      </div>
      <div v-if="logType === 'cluster'" class="log-wrapper">
        <div
          v-for="item in clusterLogList"
          :key="item.id"
          class="log-cluster-item"
					:class="item.pri ? render_serverity(item.pri) : ''"
          :title="item.msg"
        >
          <div>
            时间：{{
              dateFormat(new Date(item.time * 1000), "yyyy-MM-dd hh:mm")
            }}
          </div>
          <div>节点：{{ item.node ? item.node : "" }}</div>
          <div>服务：{{ item.tag ? item.tag : "" }}</div>
          <div>pid：{{ item.pid ? item.pid : "" }}</div>
          <div>用户名：{{ item.user ? item.user : "" }}</div>
          <div>
            严重程度：{{ item.pri ? render_serverity(item.pri) : "" }}
          </div>
          <div>消息：{{ item.msg ? item.msg : "" }}</div>
        </div>
      </div>
    </m-scrollbar>
    <m-dialog
      :visible="showLog"
      @close="closeLog"
      :_style="{
        width: '800px',
      }"
      title="Task Viewer: 恢复"
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
      </template>
      <template slot="footer">
        <span></span>
      </template>
    </m-dialog>
  </div>
</template>

<script>
import HeaderHttp from "@src/components/header/Http";
import {
  parse_task_upid,
  render_upid,
  dateFormat,
  render_serverity,
  quickSort,
} from "@libs/utils/index";
import BaseIcon from "../icon/BaseIcon.vue";
import MScrollbar from "@src/components/scroll/Scrollbar";
import MSteps from "../step/MSteps.vue";
import MStep from "../step/MStep.vue";
export default {
  components: { BaseIcon, MScrollbar, MSteps, MStep },
  name: "LogList",
  mixins: [HeaderHttp],
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    this.__init__();
  },
  data() {
    return {
      taksList: [],
      interVal: null,
      showLog: false,
      tab: "log",
      logType: "task",
      clusterLogList: [],
    };
  },
  methods: {
    parse_task_upid,
    render_upid,
    dateFormat,
    render_serverity,
    __init__() {
      this.queryClusterTask().then((res) => {
        this.taksList = quickSort(this.db.clusterTaskList, "starttime");
      });
    },
    //查看任务详情日志
    handleShowTasks(item) {
      this.queryLog(item.node, item.upid);
      this.queryStatus(item.node, item.upid);
      this.interVal = setInterval(() => {
        this.queryLog(item.node, item.upid);
        this.queryStatus(item.node, item.upid);
      }, 3000);
      this.tab = "log";
      this.showLog = true;
    },
    //切换tab
    handleTabChange(value) {
      this.tab = value;
    },
    handleLogTypeChange(value) {
      this.logType = value;
      switch (this.logType) {
        case "task":
          this.__init__();
          break;
        case "cluster":
          this.queryClusterLog().then((res) => {
            this.clusterLogList = quickSort(this.db.clusterLogList, "time");
          });
          break;
      }
    },
    //结束任务
    stopTask1() {
      this.stopTask(
        this.db.addClusterStatusObj.node,
        this.db.addClusterStatusObj.upid
      ).then((res) => {
        if (this.interVal) {
          clearInterval(this.interVal);
          this.interVal = null;
        }
      });
    },
    closeLog() {
      if (this.interVal) {
        clearInterval(this.interVal);
        this.interVal = null;
      }
      this.showLog = false;
    },
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal) {
          this.__init__();
				}
				this.logType = 'task';
        return newVal;
      }
    },
  },
};
</script>
<style scoped lang="less">
.log {
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  width: 15%;
  z-index: 999;
  background: #fff;
  box-shadow: -2px 0px 3px #ccd4df;
  text-overflow: ellipsis;
  table-layout: fixed;
  overflow: hidden;
  white-space: nowrap;
	animation: log-animation cubic-bezier(1, 0.5, 0.7, 0) 0.5s ease-in linear;
	&-wrapper{
		top: 60px;
		position: relative;
	}
  &-item {
    border-bottom: 1px solid #f5f5f5;
    height: 64px;
    line-height: 14px;
    padding: 5px 20px 5px 30px;
    cursor: pointer;
    text-overflow: ellipsis;
    table-layout: fixed;
    overflow: hidden;
    white-space: nowrap;
  }
  &-cluster {
    &-item {
      border-bottom: 1px solid #f5f5f5;
      height: 120px;
      line-height: 16px;
      padding: 5px 20px 5px 30px;
      cursor: pointer;
      text-overflow: ellipsis;
      table-layout: fixed;
      overflow: hidden;
      white-space: nowrap;
    }
  }
  &-time {
    height: 14px;
    line-height: 14px;
    margin-left: 40px;
  }
  &-tab {
    position: fixed;
    background: #fff;
    z-index: 2;
    width: 100%;
  }
}
.btn {
  position: absolute;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  width: 30px;
  height: 39px;
  line-height: 14px;
  left: -5px;
  background: #3a8ee6;
  z-index: 4;
  vertical-align: middle;
  white-space: normal;
  color: #fff;
  margin-left: 5px;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  transition: all 0.5s ease-out;
  cursor: pointer;
  &-icon {
    position: absolute;
    right: 2px;
    top: 13px;
    transform: scale(1, 1.5);
  }
  &-txt {
    width: 14px;
    display: inline-block;
    position: absolute;
    left: 3px;
    top: 5px;
    font-size: 12px;
  }
}
.error{
	background: #f3d6d7;
	color: #fff;
}
@keyframes log-animation {
  0% {
    width: 0px;
  }
  50% {
    width: 50%;
  }
  100% {
    width: 100%;
  }
}
</style>