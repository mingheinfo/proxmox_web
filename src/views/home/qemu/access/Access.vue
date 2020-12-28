<template>
  <page-template>
    <div slot="toolbar-left">
      <m-dropdown
        trigger="click"
        icon="fa fa-user"
        @on-change="handleCommand"
         style="
          width: 8rem;
          height: 30px;
          line-height: 30px;
          color: #fff !important;
        "
      >
        <span slot="label">
          <m-button
            type="primary"
            style="position: absolute; left: -1px; top: -1px; right: -1px"
            icon="el-icon-plus"
            >添加</m-button
          >
        </span>
        <m-dropdown-item icon="fa fa-users" command="group">权限组</m-dropdown-item>
        <m-dropdown-item icon="fa fa-user" command="user"
          >用户权限</m-dropdown-item
        >
        <m-dropdown-item icon="fa fa-user-o" command="apiToken"
          >Api Token Permission</m-dropdown-item
        >
      </m-dropdown>
      <m-button
        type="danger"
        @on-click="handleDelete"
        icon="el-icon-delete"
        :disabled="selectedList.length <= 0"
        >删除</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="accessList"
        ref="dataTable"
        @selection-change="handleSelect"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column
          label="用户/组/API ToKen"
          prop="ugid"
        ></el-table-column>
        <el-table-column label="角色" prop="roleid"></el-table-column>
      </el-table>
      <create-access-modal
        :title="title"
        :isCreate="isCreate"
        :param="param"
        :visible="visible"
        v-if="visible"
        :modal-type="type"
        @close="visible = false; __init__()"
      ></create-access-modal>
    </div>
  </page-template>
</template>
<script>
import StorageAccessHttp from "@src/views/home/qemu/access/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateAccessModal from './CreateAccessModal';
export default {
  name: "StorageAccess",
  mixins: [StorageAccessHttp],
  components: {
    PageTemplate,
    MButton,
    CreateAccessModal
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "创建：复制作业",
      selectedList: [],
      isCreate: true,
      param: {},
      accessList: []
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //初始化查找
    __init__() {
      let _this = this;
      _this.queryAccessList()
          .then(() => {
            let last = window.localStorage.getItem("lastsel") || "[]",
                _last = JSON.parse(last);
            if(_last.type === 'pool') {
              _this.accessList = _this.db.accessList.filter(item => item.path.indexOf(_last.pool) >= 0);
            } else {
              _this.accessList = _this.db.accessList.filter(item => item.path.indexOf(_this.vmid) >= 0);
            }
          });
    },
    //是否展示弹框
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "创建：复制作业" : "编辑：复制作业";
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
    handleDelete(type) {
      this.$confirm
        .confirm({
          msg: `你确定你要删除已选择项吗？`,
          type: "info",
        })
        .then(() => {
          this.delete(type).then(res => {
            this.__init__();
          });
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
