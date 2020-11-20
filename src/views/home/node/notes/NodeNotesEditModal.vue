<template>
  <Dialog
    :visible="visible"
    @close="close()"
    @cancel="close"
		@confirm="confirm"
    :_style="{
      width: '800px',
      height: '500px'
    }"
    title="编辑备注"
  >
    <div slot="content" ref="content">
				<ace-editor v-model="f_NewsContent"  ref="ace-editor"></ace-editor>
    </div>
  </Dialog>
</template>

<script>
import MButton from "@src/components/button/Button";
import Dialog from "@src/components/dialog/Dialog";
import Base64 from "@libs/utils/base64.js";
import NodeNotesHttp from "./http";
import AceEditor from '@src/components/ace/AceEditor';
export default {
  name: "NodeNotesModal",
  mixins: [NodeNotesHttp],
  components: {
    Dialog,
		MButton,
		AceEditor
  },
  props: {
    visible: {
      type: Boolean,
      default: true,
		},
		param: {
			type: Object,
			default: {}
		}
  },
  data() {
    return {
			f_NewsContent: '',
			editorOption: {}
		};
  },
  mounted() {
    let _this = this;
    _this.f_NewsContent = _this.param.content;
    _this.$refs[`ace-editor`].$el.style.height = (_this.$refs['content'].parentElement.clientHeight - 10) + 'px';
		window.addEventListener('resize', _this.updateAceEditorHeight, false)
	},
  methods: {
    //关闭弹框
    close() {
      this.$emit("close");
    },
    updateAceEditorHeight() {
			 let _this = this;
				_this.$refs[`ace-editor`].$el.style.height = (_this.$refs['content'].parentElement.clientHeight - 10) + 'px';
		},
    confirm() {
			this.addNotes(this.param.node,{
				description:  this.f_NewsContent,
				digest: this.param.digest
			})
			    .then(() => {
            this.close();
					})
					.catch((res) => {
						this.$confirm.error({
							msg: res
						})
					});
		},
  },
  beforeDestroy() {
		window.removeEventListener('resize', this.updateAceEditorHeight, false)
	}
};
</script>

<style lang="less" scoped>
.checkbox {
  margin-bottom: 20px;
  margin-right: 10px;
  display: inline-block;
  vertical-align: -webkit-baseline-middle;
}
.m-button {
  height: 33px;
  line-height: 28px;
}
.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}
.node-editor{
	width: 100%;
	height: 100%;
	&__input{
		position: absolute;
    width: 100%;
    height: 100%;
    overflow: auto;
    z-index: -1;
	}
}
</style>