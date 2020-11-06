<template>
  <Dialog
    :visible="visible"
    @close="close()"
		@confirm="confirm"
    :_style="{
      width: '800px',
    }"
    title="集群加入信息"
  >
    <template slot="content">
			<div class="node-editor">
				<ace-editor v-model="f_NewsContent"></ace-editor>
			</div>
    </template>
    <template slot="footer">
      <!-- <m-button @on-click="copy">拷贝信息</m-button> -->
      <template>
        <!-- <div class="label_box">
          <label>
            <input type="checkbox" v-model="isAdvice" />
            <div>高级</div>
          </label>
        </div>
        <m-button class="create-btn" type="primary" @on-click="create"
          >创建</m-button
        >
      </template>
      <template v-if="type === 'join'">
        <m-button class="create-btn" type="primary" @on-click="joinCluster"
          >加入</m-button
        > -->
      </template>
    </template>
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
		this.f_NewsContent = this.param.content;
	},
  methods: {
    //关闭弹框
    close() {
      this.$emit("close");
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