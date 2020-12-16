<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button
        type="primary"
        @on-click="showModal('create')"
        icon="fa fa-retweet"
        >添加</m-button
      >
			<m-button
        type="primary"
        @on-click="showModal('edit')"
        icon="el-icon-edit"
				:disabled="selectedList.length !== 1"
        >编辑</m-button
      >
			<m-button
        type="danger"
        @on-click="handleDelete()"
        icon="el-icon-delete"
				:disabled="selectedList.length !== 1"
        >删除</m-button
      >
			<m-button
        type="info"
        @on-click="showModal('log')"
        icon="el-icon-date"
				:disabled="selectedList.length !== 1"
        >日志</m-button
      >
			<m-button
        type="info"
        @on-click="handleImmidiateSchedule()"
        icon="el-icon-video-play"
				:disabled="selectedList.length !== 1"
        >立即安排</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="qemuReplicationList"
        ref="dataTable"
        @selection-change="handleSelect"
        @sort-change="handleSort"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column type="selection" width="55"></el-table-column>
				 <el-table-column label="访客" prop="guest" sortable></el-table-column>
				 <el-table-column label="作业" prop="jobnum" sortable></el-table-column>
				 <el-table-column label="目标" prop="target" sortable></el-table-column>
				<el-table-column label="已启用" prop="disable">
					<template slot-scope="scope">
						<table-info-state :content="scope.row.disable && scope.row.disable === 1 ? '否' : '是' "
						                  :state="scope.row.disable && scope.row.disable === 1 ? 'unActived' : 'actived' "></table-info-state>
					</template>
				</el-table-column>
				<el-table-column label="上次同步" prop="last_sync" sortable>
					<template slot-scope="scope">
						{{renderSync(scope.row.last_sync, 'last', scope.row)}}
					</template>
				</el-table-column>
				<el-table-column label="持续" prop="duration">
					<template slot-scope="scope">
						{{render_duration(scope.row.duration)}}
					 </template>
				</el-table-column>
				<el-table-column label="下次同步" prop="next_sync" sortable>
					 <template slot-scope="scope">
						{{renderSync(scope.row.next_sync, 'next', scope.row)}}
					 </template>
				</el-table-column>
				<el-table-column label="安排" prop="schedule">
					<template slot-scope="scope">
						<span>{{scope.row.schedule ? scope.row.schedule : '*/15'}}</span>
					</template>
				</el-table-column>
				<el-table-column label="备注" prop="comment" sortable></el-table-column>
      </el-table>
			<replication-create-modal :visible="visible"
			                      v-if="visible"
														:title="title"
														:param="param"
														:isCreate="isCreate"
														:modalType="modalType"
														@close="visible=false; __init__()"></replication-create-modal>
    </div>
  </page-template>
</template>
<script>
import ReplicationHttp from "@src/views/home/qemu/replication/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import Dialog from "@src/components/dialog/Dialog";
import ReplicationCreateModal from './ReplicationCreateModal'
import { dateFormat, byteToSize, quickSort, throttle, format_duration_short } from "@libs/utils/index";
export default {
  name: "QemuBackUp",
  mixins: [ReplicationHttp],
  components: {
    PageTemplate,
    MButton,
		Dialog,
		ReplicationCreateModal
  },
  data() {
    return {
      modalType: "backup",
      visible: false,
      title: "",
      selectedList: [],
      isCreate: true,
			param: {},
			search: '',
			storage: '',
			qemuReplicationList: [],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
		dateFormat,
    byteToSize,
    throttle,
    //初始化查找
    async __init__() {
			let _this = this;
			await _this.queryQemuReplication({guest: this.node.vmid})
			     .then(res =>{
						 _this.qemuReplicationList = quickSort(this.db.qemuReplicationList, "storage", '+');
					 })
		},
    //按钮是否可点击
    inStatus() {
      return this.selectedList.length <= 0;
    },
    //选择
    handleSelect(row) {
      this.selectedList = row;
		},
		/**
		 * 删除备份任务
		*/
    handleDelete(type) {
      this.$confirm
        .confirm({
          msg: `你确定你要删除改项${this.selectedList[0].volid}吗？`,
					type: "info",
					icon: 'icon-warning'
        })
        .then(() => {
					this.delete()
					    .then(res => {
								this.__init__();
							})
					    .catch(res => {
								this.$confirm.confirm({
									msg: res
								})
							});
        })
        .catch(() => {});
		},
    //排序
    handleSort({colume, prop, order}) {
      let _this = this;
      if(order !== null)
      _this.qemuTaskList = quickSort(_this.db.nodeTaskList, prop, order === 'ascending' ? '+' : '-');
		},
		/**
		 * 弹框
		*/
		showModal(type) {
			this.modalType = type;
			this.param = type !== 'create' ? this.selectedList[0] : {}
			this.isCreate = type === 'create';
			this.setTitle(type);
			this.visible = true;
		},
		/**
		 * 设置标题 @param type 'backup', 'config', 'restore'
		*/
		setTitle(type){
        switch(type) {
					case 'create':
						this.title = `创建: 复制作业`;
						break;
					case 'edit':
						this.title = `编辑： 复制作业`;
						break;
					case 'log':
						this.title = `查看: 日志`;
						break;
				}
		},
		/**
		 * render同步
		*/
		renderSync(value, type, recode) {
			if (!value) {
			    return '-';
			}
			if(type === 'last') {
				if (record.data.pid) {
			    return gettext('syncing');
			  }
			} else {
        	let now = new Date(), next = new Date(value*1000);
			    if (next < now) {
			     return gettext('pending');
			   }
			}
			return dateFormat(new Date(value * 1000), 'yyyy-MM-dd hh:mm:ss');
		},
		/**
		 * 持续时间
		*/
		render_duration(value) {
	    if (value === undefined) {
	       return '-';
    	}
	    return format_duration_short(value);
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
/deep/.run-error{
	background: #f3d6d7!important;
	color: #fff!important;
	&:hover{
		color: #606266!important;
	}
}
</style>