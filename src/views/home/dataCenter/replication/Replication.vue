<template>
	 <page-template v-loading="loading"  :element-loading-text="loadingText">
		 <div slot="toolbar-left">
        <m-button type="primary" @on-click="showModal('create')" icon="el-icon-plus">添加</m-button>
				<m-button type="primary" @on-click="showModal('edit')" icon="el-icon-edit" :disabled="selectedList.length !== 1">编辑</m-button>
				<m-button type="danger"
				          v-confirm="{
											msg: `你确定你要删除已选择项吗?`,
											ok: () => handleDelete('keep')
				            }" icon="el-icon-delete" :disabled="inStatus()">删除</m-button>
				<m-button type="danger"
				          v-confirm="{
											msg: `你确定你要强制删除已选择项吗?`,
											ok: () => handleDelete('force')
				            }" icon="el-icon-delete" :disabled="inStatus()">强制删除</m-button>
		 </div>
		 <div slot="page-content">
			 <el-table :data="db.dataCenterReplicationList" ref="dataTable" @selection-change="handleSelect">
				 <el-table-column type="selection" width="55"></el-table-column>
				 <el-table-column label="访客" prop="guest"></el-table-column>
				 <el-table-column label="作业" prop="jobnum"></el-table-column>
				 <el-table-column label="目标" prop="target"></el-table-column>
				<el-table-column label="已启用" prop="disable">
					<template slot-scope="scope">
						<table-info-state :content="scope.row.disable && scope.row.disable === 1 ? '否' : '是' "
						                  :state="scope.row.disable && scope.row.disable === 1 ? 'dead' : 'actived' "></table-info-state>
					</template>
				</el-table-column>
				<el-table-column label="安排" prop="schedule">
					<template slot-scope="scope">
						<span>{{scope.row.schedule ? scope.row.schedule : '*/15'}}</span>
					</template>
				</el-table-column>
				<el-table-column label="备注" prop="comment"></el-table-column>
			 </el-table>
			 <create-replication-modal :title="title"
			                           :isCreate="isCreate"
																 :param="param"
																 v-if="visible"
			                           :visible="visible" :modal-type="type" @close="visible = false; __init__()"></create-replication-modal>
		 </div>
	 </page-template>
</template>
<script>
import DataCenterReplicationHttp from  '@src/views/home/dataCenter/replication/http';
import PageTemplate from '@src/components/page/PageTemplate';
import MButton from '@src/components/button/Button';
import CreateReplicationModal from './CreateReplicationModal';
export default {
	name: 'Replication',
	mixins: [DataCenterReplicationHttp],
	components: {
		PageTemplate,
		MButton,
		CreateReplicationModal
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
			loadingText: ''
		}
	},
	mounted() {
		this.__init__();
	},
	methods: {
		//初始化查找
		__init__() {
			this.queryReplicationList();
		},
		//是否展示弹框
		showModal(type) {
			this.type = type;
			this.isCreate = type === 'create';
			this.title = type === 'create' ? '创建：复制作业' : '编辑：复制作业';
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
		handleDelete(type) {
      this.delete(type);
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
</style>
