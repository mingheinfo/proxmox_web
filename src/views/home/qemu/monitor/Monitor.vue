<template>
	 <div class="monitor">
		 <div class="monitor_edit">
			 <ace-editor ref="ace-editor"
			             :read-only="true"
									 v-model="monitorContent">
			 </ace-editor>
		 </div>
		 <div class="monitor_textarea">
			 <input @keyup.enter="updateCotnent" v-model="command" placeholder="请输入命令"/>
		 </div>
	 </div>
</template>

<script>
import AceEditor from '@src/components/ace/AceEditor.vue'
export default {
  components: { AceEditor },
	name: 'Monitor',
	data() {
		return {
			theme: "chrome",
			monitorContent: `Type 'help' for help.\n`,
			node: {},
			command: ''
		}
	},
	mounted() {
		let _this = this;
			//获得当前节点对象
    let last = window.localStorage.getItem("lastsel") || "[]";
    _this.node = (JSON.parse(last) && JSON.parse(last)) || "";
		_this.$refs[`ace-editor`].$el.style.height =
    _this.$el.parentElement.clientHeight - 100 + "px";
    window.addEventListener("resize", _this.updateAceEditorHeight, false);
	},
	methods: {
     updateAceEditorHeight() {
      let _this = this;
      _this.$refs[`ace-editor`].$el.style.height =
        _this.$el.parentElement.clientHeight - 100 + "px";
		},
		updateCotnent() {
			this.$http.post(`json/nodes/${this.node.node}/${this.node.id}/monitor`, {
				command: this.command
			}, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=utf8'
				}
			}).then(res =>{
				if(res.data) {
					this.monitorContent += `#${this.command}\n`+ res.data;
					this.command = '';
				}
			})
		}
	},
	beforeDestroy() {
		window.removeEventListener("resize", this.updateAceEditorHeight, false);
	}
}
</script>

<style lang="less" scoped>
 .monitor{
	 &_edit{
		 padding: 20px 20px 0px;
	 }
	 &_textarea{
		 height: 50px;
		 line-height: 50px;
		 position: absolute;
     bottom: 0px;
     width: 100%;
		 input{
			 width: calc(100% - 40px);
			 height: 100%;
			 padding: 10px;
			 border-left: none;
			 border-right: none;
			 border-top-width: 0.5px;
			 margin: 0px 20px;
			 &:focus{
				 border-top: 1px solid #409eff;
			 }
		 }
	 }
 }
</style>