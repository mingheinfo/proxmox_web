<template>
	<page-template>
		<div slot="toolbar-left">
			 <m-button
        type="primary"
        @on-click="updateHost"
        icon="el-icon-edit"
				:disabled="oldContent===hostContent"
        >保存</m-button
      >
			 <m-button
        type="primary"
        @on-click="hostContent = oldContent"
        icon="el-icon-edit"
				:disabled="oldContent===hostContent"
        >还原</m-button
      >
		</div>
			<div slot="toolbar-right" style="text-align: right">
			  <m-select
                prop="theme"
                label="选择主题"
                labelWidth="65px"
                v-model="theme"
								@on-change="(value) => {theme = value;}"
                placeholder="请选择主题"
              >
                <m-option
                  v-for="(item) in themeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >             
                </m-option>
              </m-select>
		</div>
		<div slot="page-content">
				<ace-editor v-model="hostContent"
				            :theme='theme'
				            ref="ace-editor"></ace-editor>
		</div>
	</page-template>
</template>
<script>
import AceEditor from '@src/components/ace/AceEditor';
import NodeSystemHostsHttp from '@view/home/node/system/hosts/http';
import PageTemplate from "@src/components/page/PageTemplate";
export default {
	name: 'NodeSystemHosts',
	mixins: [NodeSystemHostsHttp],
	data() {
		return {
			hostContent:'',
			oldContent: '',
			theme: 'chrome',
			themeOptions: [
				{label: 'tomorrow_night_eighties', value: 'tomorrow_night_eighties'},
				{label: 'tomorrow_night_blue', value: 'tomorrow_night_blue'},
				{label: 'tomorrow_night_bright', value: 'tomorrow_night_bright'},
				{label: 'tomorrow_night', value: 'tomorrow_night'},
				{label: 'chrome', value: 'chrome'},
				{label: 'monokai', value: 'monokai'}
			]
		}
	},
	components: {
		AceEditor,
		PageTemplate
	},
	mounted() {
		let _this = this;
		_this.__init__();
		_this.$refs[`ace-editor`].$el.style.height = (_this.$el.parentElement.clientHeight - 100) + 'px';
		window.addEventListener('resize', _this.updateAceEditorHeight, false)
	},
	methods: {
		__init__(){
			let _this = this;
			_this.queryHosts()
			    .then(res => {
						_this.hostContent = _this.db.systemHostObj.data;
						_this.oldContent = _this.db.systemHostObj.data;
					})
		},
		updateAceEditorHeight() {
			 let _this = this;
				_this.$refs[`ace-editor`].$el.style.height = (_this.$el.parentElement.clientHeight - 100) + 'px';
		},
		updateHost() {
			let _this = this;
			_this.updateHosts({data: _this.hostContent, digest:  _this.db.systemHostObj.digest})
			    .then(res => {
						_this.oldContent = _this.db.systemHostObj.data;
					})
			    .catch(res => {
						_this.$confirm.error({
							msg: res
						})
					})
		}
	},
	beforeDestroy() {
		window.removeEventListener('resize', this.updateAceEditorHeight, false)
	}
}
</script>