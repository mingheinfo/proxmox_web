<template>
	 <page-template>
		 <div slot="toolbar-left">
				<m-button type="primary" @on-click="showModal('edit')" icon="el-icon-edit">编辑</m-button>
		 </div>
		 <template slot="page-content">
			 <ace-editor v-model="nodeContent"
			              :read-only="true"
				            ref="ace-editor"></ace-editor>
			 <node-notes-edit-modal :title="title"
															v-if="visible"
			                        :visible="visible"
															:param="param"
															@close="visible = false; __init__()"></node-notes-edit-modal>
		 </template>
	 </page-template>
</template>
<script>
import NodeNotesHttp from  '@src/views/home/node/notes/http';
import PageTemplate from '@src/components/page/PageTemplate';
import MButton from '@src/components/button/Button';
import NodeNotesEditModal from './NodeNotesEditModal';
import AceEditor from '@src/components/ace/AceEditor';
export default {
	name: 'Notes',
	mixins: [NodeNotesHttp],
	components: {
		PageTemplate,
		MButton,
		NodeNotesEditModal,
		AceEditor
	},
	data() {
		return {
			type: 'create',
			visible: false,
			title: '创建：复制作业',
			selectedList: [],
			isCreate: true,
			param: {},
			node: '',
			nodeContent: ''
		}
	},
	mounted() {
		let _this = this;
		_this.__init__();
		_this.$refs[`ace-editor`].$el.style.height = (_this.$el.parentElement.clientHeight - 100) + 'px';
		window.addEventListener('resize', _this.updateAceEditorHeight, false)
	},
	methods: {
		//初始化查找
		__init__() {
			let last = window.localStorage.getItem("lastsel") || '[]', _this = this;
			this.node = (JSON.parse(last).node && JSON.parse(last).node) || '';
			_this.queryNotes()
			.then(res => {
				_this.nodeContent = _this.db.nodeNotesObj && _this.db.nodeNotesObj.description ? _this.db.nodeNotesObj.description.replace(/^\s*(.*?)\s*$/, '$1') : ''
			});
		},
		//更新编辑器高度
		updateAceEditorHeight() {
			 let _this = this;
				_this.$refs[`ace-editor`].$el.style.height = (_this.$el.parentElement.clientHeight - 100) + 'px';
		},
		//是否展示弹框
		showModal() {
			this.title = '编辑';
			this.param = {
				node: this.node,
				content: this.db.nodeNotesObj.description ? this.db.nodeNotesObj.description : '',
				digest: this.db.nodeNotesObj.digest ? this.db.nodeNotesObj.digest : ''
			}
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
			this.$confirm.confirm({
				msg: `你确定你要删除已选择项吗？`,
				type: 'info'
			}).then(() => {
         this.delete(type);
			}).catch(() => {})
		}
	},
	beforeDestroy() {
		window.removeEventListener('resize', this.updateAceEditorHeight, false)
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
	.notes-content{
		white-space: pre;
    text-align: left;
    padding: 0px;
    overflow: auto;
    height: 160px;
    left: 0px;
    top: 36px;
    height: 100%;
    vertical-align: top;
	}
</style>