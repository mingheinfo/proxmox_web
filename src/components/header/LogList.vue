<template>
  <transition name="transition" @before-enter="beforeEnter"
                                @enter="enter"
                                @after-enter="afterEnter"
                                @before-leave="beforeLeave"
                                @after-leave="afterLeave">
    <div class="log" v-show="visible">
      <div class="btn" @click="close">
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
                : 'loading-mask'
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
          title="Task Viewer: 任务详情"
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
          <el-scrollbar style="height:100%" id="log-taskModal">
            <div class="taskmodal-content" ref="taskmodal-content">
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
  </transition>
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
       this.taksList = [];
      this.queryClusterTask().then((res) => {
        this.taksList = quickSort(this.db.clusterTaskList, "starttime");
      });
    },
    //关闭弹框
    close() {
      setTimeout(() => {
        this.$emit('close');
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
          this.clusterLogList = [];
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
    //关闭任务进度
    closeLog() {
      if (this.interVal) {
        clearInterval(this.interVal);
        this.interVal = null;
      }
      this.showLog = false;
    },
    //组件进入之前
    beforeEnter(el) {
      //设置组件进入前动画
      el.style.webkitTransform= `translate3d(0, 100%, 0) scale3d(0, 0, 0)`;
      el.style.transform = `translate3d(0, 100%, 0) scale3d(1.01, 1.01, 1.01)`;
    },
    //组件进入中
    enter(el) {
      //设置组件进入前中
      el.style.webkitTransform= `translate3d(0, 50%, 0) scale3d(1.01, 1.01, 1.01)`;
      el.style.transform = `translate3d(0, 50%, 0) scale3d(1.01, 1.01, 1.01)`
    },
    //组件进入后
    afterEnter(el) {
      //设置组件进入后动画
      el.style.webkitTransform= `translate3d(0, 0, 0) scale3d(1, 1, 1)`;
      el.style.transform = `translate3d(0, 0, 0) scale3d(1, 1, 1)`
    },
    //组件离开前
    beforeLeave(el) {
      //设置组件进入后动画
      el.style.webkitTransform= `translate3d(0, 0, 0) scale3d(1, 1, 1)`;
      el.style.transform = `translate3d(0, 0, 0) scale3d(1, 1, 1)`
    },
    //组件离开时
    leave(el) {
      //组件离开时动画
      el.style.webkitTransform= `translate3d(0, 50%, 0) scale3d(0.5, 0.5, 0.5)`;
      el.style.transform = `translate3d(0, 50%, 0) scale3d(0.5, 0.5, 0.5)`
    },
    //组件离开后
    afterLeave(el) {
      //组件离开后动画
      el.style.webkitTransform= `translate3d(0, 100%, 0) scale3d(0, 0, 0)`;
      el.style.transform = `translate3d(0, 100%, 0) scale3d(0, 0, 0)`
    }
  },
  updated() {
    let _this = this;
    if(_this.showLog) {
      this.$nextTick(() => {
        if(this.tab === 'log') {
          document.querySelector('#log-taskModal >.el-scrollbar__wrap').scrollTop = this.$refs['taskmodal-content'].scrollHeight;
        } else {
          document.querySelector('#log-taskModal >.el-scrollbar__wrap').scrollTop = 0;
        }
      })
    }
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal) {
          this.__init__();
				}
        this.logType = 'task';
        setTimeout(() => {
            return newVal;
        })
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
  width: 270px;
  z-index: 999;
  background: #fff;
  box-shadow: -2px 0px 3px #ccd4df;
  text-overflow: ellipsis;
  table-layout: fixed;
  overflow: hidden;
  white-space: nowrap;
	transition: width .5s ease-in, left .5s cubic-bezier(0.075, 0.82, 0.165, 1);
	&-wrapper{
		top: 60px;
		position: relative;
	}
  &-item {
    border-bottom: 1px solid #cecccc;
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
      border-bottom: 1px solid #b9b7b7;
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
.transition-enter, transition-leave {
  transition: all 0.5s linear;
}
</style>
