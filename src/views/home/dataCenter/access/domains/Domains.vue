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
        <m-dropdown-item icon="fa fa-users" command="ad">活动目录服务器(AD)</m-dropdown-item>
        <m-dropdown-item icon="fa fa-user" command="ldap"
          >LDAP服务器</m-dropdown-item
        >
      </m-dropdown>
			<m-button type="info" @on-click="showModal('edit')" icon="el-icon-edit" :disabled="selectedList.length !== 1">编辑</m-button>
      <m-button
        type="danger"
        v-confirm="{
            msg: `你确定你要删除已选择项吗?`,
            ok: () => handleDelete()
				}"
        icon="el-icon-delete"
        :disabled="selectedList.length <= 0 || inTypes()"
        >删除</m-button
      >
			  <m-button
            type="primary"
            icon="el-icon-plus"
						@on-click="showModal('create')"
            >同步</m-button>
    </div>
    <div slot="page-content">
      <el-table
        :data="db.domainsList"
        ref="dataTable"
        @selection-change="handleSelect"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="领域" prop="realm"></el-table-column>
				<el-table-column label="类别" prop="type"></el-table-column>
				<el-table-column label="TFA" prop="tfa"></el-table-column>
        <el-table-column label="备注" prop="comment"></el-table-column>
      </el-table>
      <create-access-domain-modal
        :title="title"
        :isCreate="isCreate"
        :param="param"
        :visible="visible"
        v-if="visible"
        :modalType="modalType"
				:_type="type"
        @close="visible = false; __init__()"
      ></create-access-domain-modal>
    </div>
  </page-template>
</template>
<script>
import DataCenterAccessHttp from "@src/views/home/dataCenter/access/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateAccessDomainModal from './CreateDomainModal';
export default {
  name: "Access",
  mixins: [DataCenterAccessHttp],
  components: {
    PageTemplate,
    MButton,
    CreateAccessDomainModal
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "创建：复制作业",
      selectedList: [],
      isCreate: true,
			param: {},
			realmList: [],
			realm: '',
			modalType: 'create'
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //初始化查找
    __init__() {
      this.queryDomain();
    },
    //是否展示弹框
    showModal(type) {
			this.isCreate = type === "create";
			this.modalType = 'edit'
      this.title = `编辑：${this.selectedList[0].type === 'ad' ? '活动目录服务器（AD）' : this.selectedList[0].type === 'pam' ? "Linux PAM" : this.selectedList[0].type === 'pve' ? "Proxmox VE authentication server" : "LDAP服务器"}`;
      this.param = this.selectedList[0];
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
      this.deleteGroupById();
		},
		handleCommand(command) {
			 this.type = command;
			 this.isCreate = true;
			 this.modalType = 'create'
			 this.visible = true;
		},
		inTypes() {
			return this.selectedList.some(it => ['pve', 'pam'].includes(it.type));
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
