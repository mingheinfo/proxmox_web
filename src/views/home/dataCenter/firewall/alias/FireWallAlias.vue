<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="showModal('create')" icon="el-icon-plus">添加</m-button>
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
        :data="db.fireWallAliasList"
        ref="dataTable"
        @selection-change="handleSelect"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column
          label="名称"
          prop="name"
        ></el-table-column>
        <el-table-column label="IP/CIDR" prop="cidr"></el-table-column>
				<el-table-column label="备注" prop="comment"></el-table-column>
      </el-table>
      <create-wall-alias-modal
        :title="title"
        :isCreate="isCreate"
        :param="param"
        :visible="visible"
        v-if="visible"
        :modal-type="type"
        @close="visible = false; queryAliasList()"
      ></create-wall-alias-modal>
    </div>
  </page-template>
</template>
<script>
import FireWallHttp from "@src/views/home/dataCenter/firewall/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateWallAliasModal from './CreateWallAliasModal';
export default {
  name: "FireWallAlias",
  mixins: [FireWallHttp],
  components: {
    PageTemplate,
    MButton,
    CreateWallAliasModal
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "添加： 别名",
      selectedList: [],
      isCreate: true,
      param: {},
      isGroup: false
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //初始化查找
    __init__() {
      this.queryAliasList();
    },
    //是否展示弹框
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "添加： 别名" : "编辑：别名";
      this.param = type === "create" ? {} : this.selectedList[0];
      this.visible = true;
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
          this.deleteFireWallAlias();
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