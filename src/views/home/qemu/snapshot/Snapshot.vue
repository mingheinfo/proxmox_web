<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button
        type="primary"
        @on-click="showModal('create')"
        icon="fa fa-save"
        >添加</m-button
      >
			<m-button
        type="primary"
        @on-click="showModal('edit')"
        icon="fa fa-retweet"
				:disabled="inStatus()"
        >编辑</m-button
      >
			<m-button
        type="danger"
        @on-click="handleDelete()"
        icon="el-icon-delete"
				:disabled="inStatus()"
        >删除</m-button
      >
			<m-button
        type="info"
        @on-click="handleRollback"
        icon="el-icon-view"
				:disabled="inStatus()"
        >回滚</m-button
      >
    </div>
    <div slot="page-content">
       <div class="snap-table">
				 <div class="snap-table-header__tr">
					 <div class="snap-table-td">名称</div>
					 <div class="snap-table-td" v-if="node.type !== 'lxc'">内存</div>
					 <div class="snap-table-td">日期/状态</div>
					 <div class="snap-table-td">描述</div>
				 </div>
				 <label class="snap-table-tr" 
				       v-for="(item, index) in snapshotList" :key="item.name"
				       :class="{'is-active': current === item.name}">
					  <input name="snapshot" :id="item.name" type="radio" style="display: none;"  @change="handleSelect"/>
					  <div class="snap-table-td">
							<div :style="{paddingLeft: `${index * 10}px`}">
								<span class="icon"></span>
								<span :class="{'fa fa-history': item.name !== 'current', 'fa fa-desktop': item.name === 'current'}"></span>
								<span class="text">{{item.name === 'current' ? 'Now' : item.name}}</span>
							</div>
						</div>
					  <div class="snap-table-td"  v-if="node.type !== 'lxc'">
							<table-info-state :state="item.vmstate === 1 ? 'actived' : 'unActived'" :content="item.vmstate === 1 ? '是' : '否'"></table-info-state>
						</div>
					  <div class="snap-table-td">{{item.snaptime ? dateFormat(new Date(item.snaptime*1000), 'yyyy-MM-dd hh:mm:ss') : ''}}</div>
						<div class="snap-table-td">{{item.description}}</div>
				 </label>
			 </div>
			<add-snap-shot-modal :visible="visible"
			                      v-if="visible"
														:title="title"
														:param="param"
														:isCreate="isCreate"
														:modalType="modalType"
														@close="visible=false; __init__()"></add-snap-shot-modal>
			<m-dialog :visible="showDeleteLog" @close="closeDeleteLog" title="任务进度">
				<template slot="content">
					 <div class="progress" v-if="!done">
              <div class="progress-inner"></div>
            </div>
            <div v-else>
              <div class="progress">Done!</div>
            </div>
				</template>
					<template slot="footer"><span></span></template>
			</m-dialog>
    </div>
  </page-template>
</template>
<script>
import SnapShotHttp from "@src/views/home/qemu/snapshot/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import Dialog from "@src/components/dialog/Dialog";
import AddSnapShotModal from './AddSnapShotModal'
import { dateFormat, byteToSize, quickSort, isEmpty } from "@libs/utils/index";
export default {
  name: "Snapshot",
  mixins: [SnapShotHttp],
  components: {
    PageTemplate,
    MButton,
		Dialog,
		AddSnapShotModal
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
			current: '',
			interVal: null,
			snapshotList: [],
			showDeleteLog: false,//是否展示进度
			done: true
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
		dateFormat,
    byteToSize,
    //初始化查找
     __init__() {
			let _this = this;
			_this.querySnapShotList({_dc: new Date().getTime()})
			           .then(res => {
									 _this.snapshotList = quickSort(_this.db.snapshotList.filter(item => item.name !== 'current'), 'snaptime', '+');
									 _this.snapshotList.push(_this.db.snapshotList.filter(item => item.name === 'current')[0]);
								 })
		},
    //按钮是否可点击
    inStatus() {
      return isEmpty(this.current) || this.current === 'current';
    },
    //选择
    handleSelect(event) {
      this.current = event.target.id;
		},
		/**
		 * 删除备份任务
		*/
    handleDelete(type) {
      this.$confirm
        .confirm({
          msg: `你确定你要删除改项${this.current}吗？`,
					type: "info",
					icon: 'icon-warning'
        })
        .then(() => {
					this.deleteSnapShot()
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
			this.param = type !== 'create' ? this.db.snapshotList.filter(item => item.name == this.current)[0] : {}
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
						this.title = `创建: 快照`;
						break;
					case 'edit':
						this.title = `编辑： 快照`;
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
		},
		closeDeleteLog() {
			this.showDeleteLog = false;
			this.__init__();
			if(this.interVal) {
				clearInterval(this.interVal);
				this.interVal = null;
			}
		},
		//回滚
		handleRollback() {
			this.$confirm.confirm({
				msg: `确定要回滚${this.current}?`,
				icon: 'icon-question'
			}).then(res => {
				this.rollback(this.current)
				    .catch(res => {
							this.$confirm.info({
								msg: res
							})
						})
			})
		}
	},
	beforeDestroy() {
		if(this.interVal) {
			clearInterval(this.interVal);
			this.interVal = null;
		}
	}
};
</script>

<style lang="less" scoped>
  .snap-table{
		display: table;
		width: 100%;
	}
	.snap-table-tr, .snap-table-header__tr{
		display: table-row;
		height: 35px;
		line-height: 35px;
	}
	.snap-table-td{
    display: table-cell;
	}
 .snap-table-header__tr>.snap-table-td{
	 border-bottom: 1px solid #f5f5f5;
 }
.icon{
	background-image: url(~@images/elbow-end.png);
		height: 15px;
    display: inline-block;
    width: 16px;
    background-repeat: no-repeat;
}
.is-active{
	background:#1989fa;
	color: #fff;
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
</style>