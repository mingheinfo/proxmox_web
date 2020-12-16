<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button
        type="primary"
        @on-click="handleOperate('start')"
        icon="el-icon-plus"
        :disabled="selectedList.length !== 1 || inStatus('running')"
        >启动</m-button
      >
      <m-button
        type="primary"
        @on-click="handleOperate('stop')"
        icon="el-icon-edit"
        :disabled="selectedList.length !== 1 || inStatus('dead')"
        >停止</m-button
      >
      <m-button
        type="warning"
        @on-click="handleOperate('restart')"
        icon="el-icon-video-play"
        :disabled="selectedList.length !== 1 || !inStatus('running')"
        >重启</m-button
      >
      <m-button
        type="info"
        @on-click="handleOperate('systemLog')"
        icon="el-icon-view"
        :disabled="selectedList.length !== 1"
        >系统日志</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="db.nodeSystemList"
        ref="dataTable"
        @selection-change="handleSelect"
        :default-sort="{ prop: 'name', order: 'ascending' }"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="名称" prop="name" sortable></el-table-column>
        <el-table-column label="状态" prop="state">
          <template slot-scope="scope">
            <table-info-state
              :content="scope.row.state"
              :state="scope.row.state"
            ></table-info-state>
          </template>
        </el-table-column>
        <el-table-column label="描述" prop="desc"></el-table-column>
      </el-table>
      <Dialog
        :visible="showLog"
        @close="closeLog"
        :_style="{
          width: '900px',
					maxHeight: '520px'
        }"
        title="Task Viewer: 任务进度"
      >
        <template slot="content">
          <template v-if="modalType === 'progress'">
            <div class="progress" v-if="!done">
              <div class="progress-inner"></div>
            </div>
            <div v-else>
              <div class="progress">{{ this.text }}</div>
            </div>
          </template>
          <template v-else>
            <page-template>
              <template slot="toolbar-right">
                <m-input prop="expire" labelWidth="100px" label="选择日期" :__conStyle="{width: 'auto'}">
                  <template slot="other">
                    <el-date-picker
                      v-model="datetime"
                      type="daterange"
											format="yyyy-MM-dd hh:mm"
											value-format="yyyy-MM-dd hh:mm"
                      placeholder="永久有效"
                    >
                    </el-date-picker>
                  </template>
                </m-input>
                <m-button
                  type="primary"
                  @on-click="upateSystemLog()"
                  icon="el-icon-refresh"
									:class="{'refresh': beginRefresh}"
                  >更新</m-button
                >
              </template>
              <div slot="page-content">
								<div class="content">
									<template v-for="item in db.nodeSystemLogList">
										<div :key="item.n">{{item.t}}</div>
									</template>
								</div>
							</div>
            </page-template>
          </template>
        </template>
        <template slot="footer">
          <span></span>
        </template>
      </Dialog>
    </div>
  </page-template>
</template>
<script>
import NodeSystemHttp from "@src/views/home/node/system/http";
import PageTemplate from "@src/components/page/PageTemplate";
import Dialog from "@src/components/dialog/Dialog";
import MButton from "@src/components/button/Button";
import { dateFormat } from '@libs/utils/index';
//import CreateReplicationModal from './CreateReplicationModal';
export default {
  name: "Replication",
  mixins: [NodeSystemHttp],
  components: {
    PageTemplate,
    MButton,
    Dialog,
    //CreateReplicationModal
  },
  data() {
    return {
      visible: false,
      title: "创建：复制作业",
      selectedList: [],
      isCreate: true,
      param: {},
      showLog: false,
			interVal: null,
			datetime: [dateFormat(new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd hh:mm:ss') , dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss')],
      text: "",
      done: false,
			modalType: "progress",
			beginRefresh: false
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //初始化查找
    __init__() {
      this.queryNodeSystemList();
    },
    //是否展示弹框
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "创建：复制作业" : "编辑：复制作业";
      this.param = type === "create" ? {} : this.selectedList[0];
      this.visible = true;
    },
    //按钮是否可点击
    inStatus() {
      if (this.selectedList.length !== 1) return false;
      let states = [];
      for (let i in arguments) {
        states.unshift(arguments[i]);
      }
      return this.selectedList.every((it) =>
        states.some((state) => it.state === state)
      );
    },
    //选择
    handleSelect(row) {
      this.selectedList = row;
    },
    handleOperate(operate) {
      if (operate !== "systemLog") {
        this.operateService(operate);
        this.modalType = "progress";
      } else {
				this.showLog = true;
				let param = {
				_dc: new Date().getTime(),
				start: 0,
				limit: 500,
				since: this.datetime[0],
				until: this.datetime[1],
				service: this.selectedList[0].service,
			} 
			 this.querySystemLog(param);
        this.modalType = "systemLog";
      }
		},
		upateSystemLog() {
			  this.datetime[1] = dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss');
	      let param = {
				_dc: new Date().getTime(),
				 start: 0,
				 limit: 500,
				 since: this.datetime[0],
				 until: this.datetime[1],
				 service: this.selectedList[0].service,
			 } 
			 this.beginRefresh = true;
			 this.querySystemLog(param)
			     .then(() => this.beginRefresh = false, () => this.beginRefresh = false);
		},
    closeLog() {
			this.showLog = false;
			this.__init__();
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

<style lang="less" scoped>
.cluster-desc {
  display: flex;
  margin: 10px 0px;
  padding: 10px 0px;
  border-top: 1px solid #c4d6ec;
  border-bottom: 1px solid #c4d6ec;
  &__item {
    flex: 1 1 auto;
    display: flex;
  }
  &__title {
    flex: 1 1 auto;
    display: inline-flex;
  }
  &__desc {
    flex: 1 1 auto;
    display: inline-flex;
  }
}
.progress {
  width: 90%;
  position: relative;
  height: 30px;
  line-height: 30px;
  background: #f5f5f5;
  padding: 0px 10px;
  margin: 90px 0px;
  text-align: center;
  &-inner {
    position: absolute;
    height: 30px;
    line-height: 30px;
    animation: progress 3s infinite;
    background: #369;
  }
}
.content{
	background: #000;
	color: #fff;
	font-family: 'Courier New', Courier, monospace;
	max-height: 350px;
  margin: 25px 0px;
	overflow-y: auto;
	letter-spacing: 0vw;
}
@keyframes progress {
  0% {
    width: 0%;
  }
  25% {
    width: 25%;
  }
  50% {
    width: 50%;
  }
  75% {
    width: 75%;
  }
  100% {
    width: 100%;
  }
}
.refresh{
	animation: refresh-animation .5s infinite;
}
@keyframes refresh-animation {
	0% {
    rotate: (0deg);
  }
  25% {
    rotate: (90deg);
  }
  50% {
    rotate: (180deg);
  }
  75% {
    rotate: (270deg);
  }
  100% {
    rotate: (360deg);
  }
}
/deep/.tool-bar-right{
  flex: 3;
  text-align: right!important;
}
/deep/.page-template__content{
  height: auto!important;
}
/deep/.page-template{
  padding: 0px!important
}
</style>