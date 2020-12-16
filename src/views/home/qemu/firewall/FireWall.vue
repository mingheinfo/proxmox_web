<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="showModal('create')" icon="el-icon-plus">添加</m-button>
			<m-button type="warning" @on-click="showModal('copy')" icon="el-icon-copy-document"
                :disabled="inStatus() || selectedList && selectedList[0] && selectedList[0].type === 'group'">拷贝</m-button>
			<m-button type="primary" @on-click="showModal('rule')" icon="el-icon-folder-add" :disabled="inStatus()">插入：安全组</m-button>
			<m-button type="danger" @on-click="handleDelete" icon="el-icon-delete" :disabled="selectedList.length <=0 ">删除</m-button>
      <m-button
        type="info"
        icon="el-icon-edit"
        :disabled="selectedList.length !== 1"
        @on-click="showModal('edit')"
        >编辑</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="qemuLxcFireWallRuleList"
        ref="dataTable"
        @selection-change="handleSelect"
      >
        <el-table-column type="selection" width="55" prop="pos"></el-table-column>
				<el-table-column width="55" prop="pos"></el-table-column>
        <el-table-column label="启用" prop="enable">
					<template slot-scope="scope">
            <table-info-state
              :content="
                scope.row.enable && scope.row.enable === 1 ? '是' : '否'
              "
              :state="
                scope.row.enable && scope.row.enable === 1
                  ? 'actived'
                  : 'unActived'
              "
            ></table-info-state>
          </template>
				</el-table-column>
        <el-table-column
          label="类别"
          prop="type"
        ></el-table-column>
        <el-table-column label="操作" prop="action"></el-table-column>
        <el-table-column label="宏" prop="macro">
        </el-table-column>
				<el-table-column label="接口" prop="iface"></el-table-column>
				<el-table-column label="源" prop="source"></el-table-column>
				<el-table-column label="目标" prop="dest"></el-table-column>
				<el-table-column label="协议" prop="proto"></el-table-column>
				<el-table-column label="目标端口" prop="dport"></el-table-column>
				<el-table-column label="源端口" prop="sport"></el-table-column>
				<el-table-column label="Log级别" prop="log"></el-table-column>
				<el-table-column label="备注" prop="comment"></el-table-column>
				<el-table-column >
					<template slot-scope="scope">
						<m-button type="info" :icon="scope.row.enable === 0 ? 'el-icon-video-play' : 'el-icon-video-pause'" @on-click="handleEnable(scope.row)">{{scope.row.enable === 0 ? '启用' : '停用'}}</m-button>
					</template>
				</el-table-column>
      </el-table>
      <create-firewall-Rule-modal
        :title="title"
        :isCreate="isCreate"
        :param="param"
        :visible="visible"
        v-if="visible"
        :modal-type="type"
        :isGroup="isGroup"
        @close="visible = false; __init__()"
      ></create-firewall-Rule-modal>
    </div>
  </page-template>
</template>
<script>
import QemuFireWallHttp from "@src/views/home/qemu/firewall/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateFirewallRuleModal from './CreateFirewallRuleModal';
import { quickSort } from '@libs/utils/index';
export default {
  name: "Access",
  mixins: [QemuFireWallHttp],
  components: {
    PageTemplate,
    MButton,
    CreateFirewallRuleModal
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "创建：复制作业",
      selectedList: [],
      isCreate: true,
      param: {},
      isGroup: false,
      qemuLxcFireWallRuleList: []
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //初始化查找
    __init__() {
      this.queryFireWallList()
          .then(res => {
            this.qemuLxcFireWallRuleList = quickSort(this.db.qemuLxcFireWallRuleList, 'pos', '+');
          });
    },
    //是否展示弹框
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "添加：规则" : type === 'copy' ? "复制：规则" : type === 'edit' ? "编辑：规则" : "添加：安全组";
      this.param = type === "create" ? {} : this.selectedList[0];
      this.visible = true;
      debugger;
      this.isGroup =  this.selectedList[0] && this.selectedList[0].type === 'group';
    },
    //按钮是否可点击
    inStatus() {
      return this.selectedList.length !== 1;
    },
    //选择
    handleSelect(row) {
      this.selectedList = row;
    },
    handleDelete(type) {
      this.$confirm
        .confirm({
          msg: `你确定你要删除已选择项吗？`,
          type: "info",
        })
        .then(() => {
          this.deleteFireWallRule();
        })
        .catch(() => {});
		},
		handleCommand(command) {
			 this.type = command;
			 this.visible = true;
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
</style>