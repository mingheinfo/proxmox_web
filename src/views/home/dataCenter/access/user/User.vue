<template>
  <page-template>
    <div slot="toolbar-left">
     <m-button
            type="primary"
            icon="el-icon-plus"
						@on-click="showModal('create')"
            >添加</m-button>
			<m-button type="info" @on-click="showModal('edit')" icon="el-icon-edit" :disabled="selectedList.length !== 1">编辑</m-button>
			<m-button type="info" @on-click="showModal('modifyPsw')" icon="el-icon-edit" :disabled="selectedList.length !== 1">修改密码</m-button>
      <m-button
        type="danger"
         v-confirm="{
            msg: `你确定你要删除已选择项吗?`,
            ok: () => handleDelete()
				}"
        icon="el-icon-delete"
        :disabled="selectedList.length <= 0"
        >删除</m-button
      >
      <m-button
        type="info"
        @on-click="showModal('tfa')"
        icon="el-icon-edit"
        :disabled="selectedList.length !== 1"
        >TFA</m-button
      >
      <m-button
        type="info"
        @on-click="showModal('permission')"
        icon="el-icon-view"
        :disabled="selectedList.length !== 1"
        >权限</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="db.usersList"
        ref="dataTable"
        @selection-change="handleSelect"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="用户名" prop="userid" sortable>
					<template slot-scope="scope">
						<span>{{scope.row.userid.split('@')[0]}}</span>
					</template>
				</el-table-column>
        <el-table-column label="领域"  prop="userid" sortable>
					<template slot-scope="scope">
						<span>{{scope.row.userid.split('@')[1]}}</span>
					</template>
				</el-table-column>
        <el-table-column label="已启用" prop="enable" sortable>
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
				<el-table-column label="有效期至" prop="expire" sortable>
					<template slot-scope="scope">
						<span>{{scope.row.expire ? dateFormat(new Date(scope.row.expire * 1000), 'yyyy-MM-dd hh:mm:ss') : '永不过期'}}</span>
					</template>
				</el-table-column>
				<el-table-column label="名称" prop="firstname" sortable>
					<template slot-scope="scope">
						<span>{{`${scope.row.firstname ? scope.row.firstname : '' } ${scope.row.lastname ? scope.row.lastname : ''}`}}</span>
					</template>
				</el-table-column>
				<el-table-column label="TFA">
					 <template slot-scope="scope">
            <table-info-state
              :content="
                scope.row.tfa ? '是' : '否'
              "
              :state="
                scope.row.tfa
                  ? 'actived'
                  : 'unActived'
              "
            ></table-info-state>
          </template>
				</el-table-column>
				<el-table-column label="备注" prop="comment" sortable></el-table-column>
      </el-table>
      <create-user-modal
        :title="title"
        :isCreate="isCreate"
        :param="param"
        :visible="visible"
        v-if="visible"
        :modal-type="type"
        @close="visible = false"
      ></create-user-modal>
    </div>
  </page-template>
</template>
<script>
import DataCenterAccessHttp from "@src/views/home/dataCenter/access/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import { dateFormat } from '@libs/utils/index';
import CreateUserModal from './CreateUserModal';
export default {
  name: "Access",
  mixins: [DataCenterAccessHttp],
  components: {
    PageTemplate,
    MButton,
   CreateUserModal
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
		dateFormat,
    //初始化查找
    __init__() {
      this.queryUsersList();
    },
    //是否展示弹框
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "创建: 用户" : type === 'edit' ? "编辑：用户" : type === 'modifyPsw' ? '修改： 密码' : type === 'tfa' ? '二次验证' : '权限';
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
      this.deleteUsers();
    },
    handelEditTfa() {

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