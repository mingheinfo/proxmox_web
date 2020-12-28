<template>
	 <page-template v-loading="loading"  :element-loading-text="loadingText">
		 <div slot="toolbar-left">
        <m-button type="primary" @on-click="showModal('create')" icon="el-icon-plus">添加</m-button>
				<m-button type="primary" @on-click="showModal('edit')" icon="el-icon-edit" :disabled="selectedList.length !== 1">编辑</m-button>
				<m-button type="danger"  v-confirm="{
                  msg: '确认要删除已选择项?',
                  icon: 'icon-question',
                  ok: () => handleDelete('keep')
                }" icon="el-icon-delete" :disabled="inStatus()">删除</m-button>
				<m-button type="info" @on-click="showModal('log')" icon="el-icon-date" :disabled="inStatus()">日志</m-button>
				<m-button type="primary" @on-click="handleImmidiateSchedule()" icon="el-icon-video-play" :disabled="inStatus()">立即安排</m-button>
		 </div>
		 <div slot="page-content">
			 <el-table :data="nodeReplicationList" ref="dataTable" @selection-change="handleSelect">
				 <el-table-column type="selection" width="55"></el-table-column>
				 <el-table-column label="访客" prop="guest"></el-table-column>
				 <el-table-column label="作业" prop="jobnum"></el-table-column>
				 <el-table-column label="目标" prop="target"></el-table-column>
				  <el-table-column label="状态" prop="error">
					 <template slot-scope="scope">
						 <table-info-state :content="(scope.row.failCount === 0 || !scope.row.error) ? 'OK' : scope.row.remove_job ? '移除已安排'+scope.row.error : scope.row.error"
						                   :state="(scope.row.failCount === 0 || !scope.row.error) ? 'actived' : 'dead'"></table-info-state>
					 </template>
				 </el-table-column>
				<el-table-column label="已启用" prop="disable">
					<template slot-scope="scope">
						<table-info-state :content="scope.row.disable && scope.row.disable === 1 ? '否' : '是' "
						                  :state="scope.row.disable && scope.row.disable === 1 ? 'unActived' : 'actived' "></table-info-state>
					</template>
				</el-table-column>
				<el-table-column label="安排" prop="schedule">
					<template slot-scope="scope">
						<span>{{scope.row.schedule ? scope.row.schedule : '*/15'}}</span>
					</template>
				</el-table-column>
				<el-table-column label="备注" prop="comment"></el-table-column>
			 </el-table>
			 <create-node-replication-modal :title="title"
			                           :isCreate="isCreate"
																 :param="param"
																 v-if="visible"
			                           :visible="visible" :modal-type="type" @close="visible = false;__init__()"></create-node-replication-modal>
		 </div>
	 </page-template>
</template>
<script>
import NodeReplicationHttp from  '@src/views/home/node/replication/http';
import PageTemplate from '@src/components/page/PageTemplate';
import MButton from '@src/components/button/Button';
import CreateNodeReplicationModal from './CreateNodeReplication';
import { dateFormat, byteToSize, quickSort, throttle, format_duration_short } from "@libs/utils/index";
export default {
	name: 'Replication',
	mixins: [NodeReplicationHttp],
	components: {
		PageTemplate,
		MButton,
		CreateNodeReplicationModal,
	},
	data() {
		return {
			type: 'create',
			visible: false,
			title: '创建：复制作业',
			selectedList: [],
			isCreate: true,
			param: {},
			loading: false,
			loadingText: '',
			showLog: false,
			logParam: {},
			interVal: null,
			nodeReplicationList: []
		}
	},
	mounted() {
		this.__init__();
	},
	methods: {
		//初始化查找
		__init__() {
			let _this = this, nodeNum = _this.db.resources && _this.db.resources.filter((item) => item.type === 'node').length || 0;
			if(nodeNum <=1) {
			 _this.loading = true;
			 _this.loadingText = "至少需要两个节点"
			 return;
			}
			_this.loading = false;
			_this.loadingText = ""
			this.queryNodeReplication()
			   .then(res => {
           _this.nodeReplicationList = quickSort(this.db.nodeReplicationList, "guest", '+');
				 });
				_this.interVal = setInterval(() => {
         _this.queryNodeReplication({guest: this.node.vmid}).then(res => {
					 _this.nodeReplicationList = quickSort(this.db.nodeReplicationList, "guest", '+');
					 let isAllOK = _this.db.nodeReplicationList.every((item) => {
							if((String(item.fail_count) && item.fail_count === 0 ) || item.error)
								 return true;
							else return false;
					 })
					 if(isAllOK) {
						 if(_this.interVal) {
							 clearInterval(_this.interVal);
							 _this.interVal = null;

						 }
					 }
				 })
			}, 10000)
		},
		//是否展示弹框
		showModal(type) {
			this.type = type;
			this.isCreate = type === 'create';
			this.title = type === 'create' ? '创建：复制作业' : type === 'edit' ? '编辑：复制作业' : "日志";
			this.param = type === 'create' ? {} : this.selectedList[0]
			this.visible= true;
		},
		//按钮是否可点击
		inStatus() {
      return this.selectedList.length <= 0;
		},
		//选择
		handleSelect(row) {
      this.selectedList = row;
		},
		handleDelete() {
      this.delete();
		},
		//展示日志
		handleShowLog() {
			this.logParam = this.selectedList[0];
			this.showLog = true;
		}
	},
	beforeDestroy() {
	  if(this.interVal) {
	    clearInterval(this.interVal);
	    this.interVal = null;
		}
	}
}
</script>

<style lang="less" scoped>
  .cluster-desc{
		display: flex;
		margin: 10px 0px;
		padding: 10px 0px;
		border-top: 1px solid #c4d6ec;
	  border-bottom: 1px solid #c4d6ec;
		&__item{
			flex: 1 1 auto;
			display: flex;
		}
		&__title{
			flex: 1 1 auto;
			display: inline-flex;
		}
		&__desc{
			flex: 1 1 auto;
			display: inline-flex;
		}
	}
	.toolbar-left{
		flex: 2;
	}
</style>
