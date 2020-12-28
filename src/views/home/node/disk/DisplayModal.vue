<template>
  <Dialog
    :visible="visible"
    @cancel="close"
    @confirm="confirm"
    :title="title"
    :_style="{ width: '956px', maxHeight: '400px' }"
    @close="$emit('close')"
  >
    <div slot="content" style="max-height: 500px" v-if="param.health!== 'OK'">
       <el-table v-loading="loading"
                 :element-loading-text="loadingText">
				 <el-table-column label="ID"></el-table-column>
				 <el-table-column label="属性"></el-table-column>
				 <el-table-column label="值"></el-table-column>
				 <el-table-column label="标准化"></el-table-column>
				 <el-table-column label="阈值"></el-table-column>
				 <el-table-column label="最差"></el-table-column>
				 <el-table-column label="标记"></el-table-column>
				 <el-table-column label="失败"></el-table-column>
			 </el-table>
    </div>
    <div slot="content" style="max-height: 500px" v-if="param.health === 'OK'">
       <ace-editor v-model="smartContent"
                   style="height: 260px"
                   :read-only="true"></ace-editor>
    </div>
    <template slot="footer">
      <m-button class="create-btn" type="danger" @on-click="close"
        >取消</m-button
      >
      <m-button class="create-btn" type="primary" @on-click="confirm"
        >重载</m-button
      >
    </template>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import NodeDiskHttp from "@src/views/home/node/disk/http";
import { flotToFixed, percentToFixed, byteToSize } from "@libs/utils/index";
import AceEditor from "@src/components/ace/AceEditor";
export default {
  name: "DisplayModal",
  mixins: [NodeDiskHttp],
  components: {
    AceEditor,
    Dialog,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    modalType: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    param: {
      type: Object,
      default: () => {
        return {};
      },
    },
    isCreate: {
      type: Boolean,
      default: false,
    },
    isGroup: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
			loading: false,
			loadingText: '',
      smartContent: ''
		}
  },
  mounted() {
    this.__init__();
  },
  methods: {
    byteToSize,
    async __init__() {
			let _this = this;
			_this.querySMartList({disk: this.param.devpath})
        .then(res => {
          _this.smartContent = _this.db.nodeSmartList.text;
        })
			.catch(res => {
         _this.loadingText = res;
			});
		},
		close() {
			this.$emit('close');
		},
		confirm() {
	    let _this = this;
			_this.__init__();
		}
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal) setTimeout(() => this.__init__(), 0);
        return newVal;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}
</style>
