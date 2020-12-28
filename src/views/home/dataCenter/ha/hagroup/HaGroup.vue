<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" icon="el-icon-plus" @on-click="showModal('create')">创建</m-button>
      <m-button type="primary" icon="el-icon-edit" @on-click="showModal('edit')" :disabled="selectedList.length !== 1">编辑</m-button>
      <m-button
        type="danger"
        v-confirm="{
            msg: '确定要删除已选择项?',
            ok: () => handleDelete(),
            icon:'icon-question'
        }"
        icon="el-icon-delete"
        :disabled="selectedList.length <= 0"
        >删除</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="db.groupsList"
        ref="dataTable"
        @selection-change="handleSelect"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="组" prop="group"></el-table-column>
        <el-table-column label="restricted" prop="restricted"></el-table-column>
        <el-table-column label="nofailback" prop="nofailback"></el-table-column>
        <el-table-column label="节点" prop="nodes"></el-table-column>
        <el-table-column label="备注" prop="comment"></el-table-column>
      </el-table>
      <create-ha-group-modal
        :title="title"
        :isCreate="isCreate"
        :param="param"
        :visible="visible"
        v-if="visible"
        :modal-type="type"
        @close="visible = false; __init__()"
      ></create-ha-group-modal>
    </div>
  </page-template>
</template>
<script>
import HaHttp from "@src/views/home/dataCenter/ha/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateHaGroupModal from './CreateHaGroupModal';
export default {
  name: "HaGroup",
  mixins: [HaHttp],
  components: {
    PageTemplate,
    MButton,
    CreateHaGroupModal
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "创建：复制作业",
      selectedList: [],
      isCreate: true,
      param: {},
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //初始化查找
    __init__() {
      this.queryGroups();
    },
    //是否展示弹框
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "创建：HA Group" : "编辑：HA Group";
      this.param = type === "create" ? {} : this.selectedList[0];
      this.visible = true;
    },
    //按钮是否可点击
    inStatus() {
      return this.selectedList.length <= 0;
    },
    //选择
    handleSelect(row) {
      this.selectedList = row;
    },
    handleDelete() {
      this.deleteHaGroup();
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
