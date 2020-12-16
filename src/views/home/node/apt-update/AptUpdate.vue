<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="handleRefresh()" icon="el-icon-edit"
        >刷新</m-button
      >
      <m-dropdown
        trigger="click"
        @on-change="handleCommand"
        style="
          width: 8rem;
          height: 30px;
          line-height: 30px;
          color: #fff !important;
        "
      >
        <span slot="label">
          <m-button
            type="primary"
            style="position: absolute; left: -1px; top: -1px; right: -1px"
            icon="fa fa-refresh"
            >更新</m-button
          >
        </span>
            <m-dropdown-item command="html5" name="novnc">NoVNC</m-dropdown-item>
            <m-dropdown-item command="vv" name="virt-viewer">SPICE</m-dropdown-item>
            <m-dropdown-item command="xtermjs" name="xtermjs">xtermjs</m-dropdown-item>
      </m-dropdown>
      <m-button
        type="warning"
        @on-click="showChangeLog()"
        icon="el-icon-video-play"
        :disabled="selectedList.length !== 1"
        >变更日志</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="db.aptList"
        ref="dataTable"
        @selection-change="handleSelect"
        :default-sort="{ prop: 'Package', order: 'ascending' }"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column
          label="软件包"
          prop="Package"
          sortable
        ></el-table-column>
        <el-table-column label="版本">
          <el-table-column prop="OldVersion" label="当前"></el-table-column>
          <el-table-column prop="Version" label="新"></el-table-column>
        </el-table-column>
        <el-table-column
          label="描述"
          prop="Description"
          sortable
          show-overflow-tooltip
        ></el-table-column>
      </el-table>
      <Dialog
        :visible="showLog"
        @close="closeLog"
        :_style="{
          width: '800px',
        }"
        title="Task Viewer: 更新软件包数据库"
      >
        <template slot="content" v-if="modalType === 'log'">
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
				<template slot="content" v-if="modalType === 'changeLog'">
           <ace-editor v-model="changeLogContent"
				               ref="ace-editor"></ace-editor>
				</template>
        <template slot="footer">
          <span></span>
        </template>
      </Dialog>
    </div>
  </page-template>
</template>
<script>
import NodeAptUpdateHttp from "@src/views/home/node/apt-update/http";
import PageTemplate from "@src/components/page/PageTemplate";
import Dialog from "@src/components/dialog/Dialog";
import MButton from "@src/components/button/Button";
import { dateFormat, openConsoleWindow } from "@libs/utils/index";
export default {
  name: "Replication",
  mixins: [NodeAptUpdateHttp],
  components: {
    PageTemplate,
    MButton,
    Dialog,
  },
  data() {
    return {
      visible: false,
      title: "创建：复制作业",
      selectedList: [],
      param: {},
      showLog: false,
      interVal: null,
      visible: false,
      isCreate: false,
			tab: 'log',
			modalType: "",
			changeLogContent: '',
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
		dateFormat,
    //初始化查找
    __init__() {
      let _this = this;
			_this.queryAptUpdateList();
    },
    //选择
    handleSelect(row) {
      this.selectedList = row;
    },
    handleTabChange(tab) {
			this.tab = tab;
		},
    closeLog() {
			 if (this.interVal) {
         clearInterval(this.interVal);
         this.interVal = null;
      }
      this.showLog = false;
      this.__init__();
		},
		stopTask1() {
      this.stopTask(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid);
    },
    //选择哪种方式创建
    handleCommand(type) {
			let _this = this;
		  openConsoleWindow(type, 'upgrade', 0, _this.node, '', '');
    },
    //更新
    handleRefresh() {
      this.querySubscriptionInfo().then((res) => {
        this.$confirm
          .confirm({
            msg: this.db.subscriptionObj.message,
            icon: "icon-question",
          })
          .then((res) => {
            this.update().then((res) => {
							this.showLog = true;
							this.interVal = setInterval(() => {
                 	this.queryLog(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid);
							    this.queryStatus(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid);
							}, 3000)
              this.modalType = "log";
            });
          });
      });
		},
		//变更日志
		showChangeLog() {
			let param =  {
				_dc: new Date().getTime(),
				name: this.selectedList[0].Package,
        version: this.selectedList[0].Version,
			 }, _this = this;
			this.queryChangeLog(param)
			    .then(res => {
						_this.changeLogContent = _this.db.changeLogObj;
						_this.showLog = true;
						_this.modalType = 'changeLog'
						_this.$refs[`ace-editor`].$el.style.height = (_this.$el.parentElement.clientHeight - 100) + 'px';
		        window.addEventListener('resize', _this.updateAceEditorHeight, false);
					}).catch(res  => {
						_this.$confirm.confirm({
							msg: res
						})
					})
		},
		updateAceEditorHeight() {
			 let _this = this;
				_this.$refs[`ace-editor`].$el.style.height = (_this.$el.parentElement.clientHeight - 100) + 'px';
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