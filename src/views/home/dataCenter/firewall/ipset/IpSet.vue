<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button
        type="primary"
        @on-click="showModal('create')"
        icon="el-icon-plus"
        >创建</m-button
      >
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
        :data="db.ipSetList"
        ref="dataTable"
        :row-key="setRowKeys"
        :expand-row-keys="expands"
        @selection-change="handleSelect"
        @expand-change="expandChange"
      >
        <el-table-column type="expand">
          <template slot-scope="parentSlot">
            <page-template>
              <div slot="toolbar-left">
                <m-button
                  type="primary"
                  @on-click="showCidrModal('create')"
                  icon="el-icon-plus"
                  >添加</m-button
                >
                <m-button
                  type="danger"
                  v-confirm="{
                    msg: '确定要删除已选择项?',
                    icon:  'icon-question',
                    ok: () => handleCidrDelete()
                  }"
                  icon="el-icon-delete"
                  :disabled="selectedCidrList.length <= 0"
                  >删除</m-button
                >
                <m-button
                  type="info"
                  icon="el-icon-edit"
                  :disabled="selectedCidrList.length !== 1"
                  @on-click="showCidrModal('edit')"
                  >编辑</m-button
                >
              </div>
              <div slot="page-content">
                <el-table
                  :data="db.ipSetCidrList"
                  @selection-change="handleCidrSelect"
                >
                  <el-table-column
                    type="selection"
                    width="55"
                  ></el-table-column>
                  <el-table-column label="IP/CIDR" prop="cidr"></el-table-column>
                  <el-table-column
                    label="备注"
                    prop="comment"
                  ></el-table-column>
									<el-table-column
                    label="错误信息"
                  >
									   <template slot-scope="scope">
											 <span>{{scope.row.errors && scope.row.errors.cidr && scope.row.errors.cidr}}</span>
										 </template>
									</el-table-column>
										<el-table-column
                    label="匹配"
                  >
									   <template slot-scope="scope">
											 <table-info-state
                        :content="
                          scope.row.nomatch && scope.row.nomatch === 1
                            ? '是'
                            : '否'
                        "
                        :state="
                          scope.row.nomatch && scope.row.nomatch === 1
                            ? 'actived'
                            : 'unActived'
                        "
                      ></table-info-state>
										 </template>
									</el-table-column>
                </el-table>
              </div>
            </page-template>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="IPSet" prop="name"></el-table-column>
        <el-table-column label="备注" prop="comment"></el-table-column>
      </el-table>
      <create-ipset-cidr-modal
        :title="cidrTitle"
        :isCreate="isCidrCreate"
        :param="cidrParam"
        :visible="cidrVisible"
        v-if="cidrVisible"
        :modal-type="cidrType"
        :name="name"
        @close="
          cidrVisible = false;
          queryIpSetCidrList(name);
        "
      ></create-ipset-cidr-modal>
      <create-ipset-modal
        :title="title"
        :isCreate="isCreate"
        :param="param"
        :visible="visible"
        v-if="visible"
        :modal-type="type"
        @close="
          visible = false;
          __init__()
        "
      ></create-ipset-modal>
    </div>
  </page-template>
</template>
<script>
import FireWallHttp from "@src/views/home/dataCenter/firewall/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateIPSetModal from "./CreateIPSetModal";
import CreateIPSetCidrModal from "./CreateIPSetCidrModal";
export default {
  name: "Access",
  mixins: [FireWallHttp],
  components: {
    PageTemplate,
    MButton,
    'create-ipset-modal': CreateIPSetModal,
    'create-ipset-cidr-modal': CreateIPSetCidrModal,
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "创建：IPSet",
      selectedList: [],
      selectedCidrList: [],
      cidrParam: {},
      isCidrCreate: true,
      cidrTitle: "添加：规则",
      cidrType: "create",
      cidrVisible: false,
      isCreate: true,
      param: {},
      name: "",
      expands: [],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //初始化查找
    __init__() {
      this.queryIpSetList();
    },
    //是否展示弹框
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "创建：IPSet" : "编辑：IPSet";
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
      this.deleteIpset().catch((res) => {
        this.$confirm.error({
          msg: res,
          icon: 'icon-error'
        });
      });
    },
    handleCidrDelete() {
      this.deleteIpsetCidr(this.name);
		},
		//保证每一行只能展开一列
    expandChange(row, expandedRows) {
			let that = this;
      if (expandedRows.length) {
        that.expands = [];
        if (row) {
          that.expands.push(row.name);
          this.name = row.name;
          this.queryIpSetCidrList(this.name);
        }
      } else {
        that.expands = [];
      }
    },
    setRowKeys(row) {
      return row.name;
    },
    handleCidrSelect(rows) {
      this.selectedCidrList = rows;
    },
    showCidrModal(type) {
      this.cidrType = type;
      this.isCidrCreate = type === "create";
      this.cidrTitle = type === "create" ? "创建：ip/cidr" : "编辑：ip/cidr";
      this.cidrParam = type === "create" ? {} : this.selectedCidrList[0];
      this.cidrVisible = true;
    },
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
