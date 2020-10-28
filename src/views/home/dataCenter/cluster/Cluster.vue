<template>
	 <page-template>
		 <div slot="toolbar-left">
        <m-button type="primary" @on-click="showModal('create')" :disabled="inStatus()">创建集群</m-button>
				<m-button type="primary" @on-click="showModal('info')" :disabled="!inStatus()">加入信息</m-button>
				<m-button type="primary" @on-click="showModal('join')" :disabled="inStatus()">加入集群</m-button>
		 </div>
		 <div slot="page-content">
			 <div class="cluster-desc">
				 <div class="cluster-desc__item">
					 <span class="cluster-desc__title">集群名称：</span>
					 <span class="cluster-desc__desc">{{db.clusterObj && db.clusterObj.totem && db.clusterObj.totem.cluster_name}}</span>
				 </div>
				 <div class="cluster-desc__item">
					 <span class="cluster-desc__title">配置版本</span>
					 <span class="cluster-desc__desc">{{db.clusterObj && db.clusterObj.totem && db.clusterObj.totem.config_version}}</span>
				 </div>
				 <div class="cluster-desc__item">
					<span class="cluster-desc__title">节点数：</span>
					 <span class="cluster-desc__desc">{{db.nodeList.length}}</span>
				 </div>
			 </div>
			 <el-table :data="db.nodeList">
				 <el-table-column label="节点名称" prop="name"></el-table-column>
				 <el-table-column label="ID" prop="nodeid"></el-table-column>
				 <el-table-column label="表决" prop="quorum_votes"></el-table-column>
				 <el-table-column label="Link0" prop="ring0_addr"></el-table-column>
				<el-table-column label="Link1" prop="ring1_addr"></el-table-column>
			 </el-table>
			 <cluster-modal v-if="visible" :visible="visible" :type="type" @close="visible = false"></cluster-modal>
		 </div>
	 </page-template>
</template>
<script>
import ClusterHttp from  '@src/views/home/dataCenter/cluster/http';
import PageTemplate from '@src/components/page/PageTemplate';
import MButton from '@src/components/button/Button';
import ClusterModal from './ClusterModal';
export default {
	name: 'Cluster',
	mixins: [ClusterHttp],
	components: {
		PageTemplate,
		MButton,
		ClusterModal
	},
	data() {
		return {
			type: '',
			visible: false
		}
	},
	mounted() {
		this.__init__();
	},
	methods: {
		//初始化查找
		__init__() {
			this.queryClusterList();
			this.queryClusterNode();
		},
		//是否展示弹框
		showModal(type) {
			this.type = type;
			this.visible= true;
		},
		//按钮是否可点击
		inStatus() {
      return this.db.clusterObj && this.db.clusterObj.totem && this.db.clusterObj.totem.cluster_name ? true : false
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