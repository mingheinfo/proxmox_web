<template>
	 <page-template>
		 <div slot="toolbar-left">
        <m-button type="primary" icon="el-icon-plus" @on-click="showModal('create')">添加</m-button>
				<m-button type="danger" icon="el-icon-delete" 
				           v-confirm="{
                     msg: `确定要删除已选项吗?`,
										 ok: () => deleteBackUp()
				           }" :disabled="selectedList.length <= 0">删除</m-button>
				<m-button type="primary" icon="el-icon-edit" @on-click="showModal('edit')" :disabled="selectedList.length !== 1">编辑</m-button>
					<m-button type="info" icon="el-icon-video-play" 
					          v-confirm="{
                     msg: `你确定你要启动已选择的备份作业吗?`,
										 ok: () => runNow()
				           }" :disabled="selectedList.length <= 0 ">现在运行</m-button>
		 </div>
		 <div slot="page-content">
			 <el-table :data="db.backUpList" ref="dataTable" @selection-change="handleSelect">
				 <el-table-column type="selection" width="55"></el-table-column>
				 <el-table-column label="节点" prop="node"></el-table-column>
				 <el-table-column label="星期几" prop="dow">
					 <template slot-scope="scope">
						 {{setDay(scope.row.dow)}}
					 </template>
				 </el-table-column>
				 <el-table-column label="开始时间" prop="starttime"></el-table-column>
				<el-table-column label="已启用" prop="enabled">
					<template slot-scope="scope">
						<table-info-state :content="scope.row.enabled && scope.row.enabled === '1' ? '是' : '否' "
						                  :state="scope.row.enabled && scope.row.enabled === '1' ? 'actived' : 'unActived' "></table-info-state>
					</template>
				</el-table-column>
				<el-table-column label="存储" prop="storage"></el-table-column>
				<el-table-column label="选择" prop="vmid">
					<template slot-scope="scope">
						<span v-show="scope.row.exclude">{{scope.row.exclude}}以外的所有</span>
						<span v-show="scope.row.all && !scope.row.exclude">--所有--</span>
						<span v-show="scope.row.vmid">{{scope.row.vmid}}</span>
						<span v-show="scope.row.pool">Pool'{{scope.row.pool}}'</span>
					</template>
				</el-table-column>
			 </el-table>
			 <CreateBackUpModal :visible="visible" 
			                    @close="visible = false"
													:param="editParam"
													v-if="visible"
													:type="type"
													:title="title"></CreateBackUpModal>
		 </div>
	 </page-template>
</template>
<script>
import CreateBackUpModal from '@src/views/home/dataCenter/backup/CreateBackUpModal';
import BackUpHttp from  '@src/views/home/dataCenter/backup/http';
import PageTemplate from '@src/components/page/PageTemplate';
import MButton from '@src/components/button/Button';
export default {
	name: 'Cluster',
	mixins: [BackUpHttp],
	components: {
		PageTemplate,
		MButton,
		CreateBackUpModal
	},
	data() {
		return {
			type: 'create',
			visible: false,
			selectedList: [],
			title: '',
			editParam: {}
		}
	},
	mounted() {
		this.__init__();
	},
	methods: {
		//初始化查找
		__init__() {
			this.queryBackUpList()
			.then(res => {
				//this.handelDefaultSel();
			})
		},
		//是否展示弹框
		showModal(type) {
			this.type = type;
			this.title = type === 'create' ? '创建备份' : '编辑备份'
			if(type !== 'create') this.editParam = this.selectedList[0]
			this.visible= true;
		},
		//按钮是否可点击
		inStatus() {
      return this.db.clusterObj && this.db.clusterObj.totem && this.db.clusterObj.totem.cluster_name ? true : false
		},
		handelDefaultSel() {
      this.db.backUpList.forEach(row => {
				  if(row.enabled)
          this.$refs.dataTable.toggleRowSelection(row, row.enabled === '1');
      });
		},
		setDay(day) {
			if(!day) return;
			let days = day.split(',');
			return days.map(item => {
				return this.$t(`day.${item}`);
			}).join(',')
		},
		deleteBackUp() {
      this.delete();
		},
		//选择
		handleSelect(rows) {
     this.selectedList = rows;
		},
		//现在运行
		runNow() {
      this.run();
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