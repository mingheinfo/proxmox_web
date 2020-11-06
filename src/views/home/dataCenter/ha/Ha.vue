<template>
  <div style="padding: 20px;">
    <overview-card>
      <div slot="title">状态</div>
      <div
        slot="operate"
        :class="{ 'm-tool-collpise': !showStatus }"
        class="m-tool-img"
        @click.stop="handleCollpise('status')"
      ></div>
      <div slot="content" class="card-content" v-if="showStatus">
        <div class="card-item">
          <page-template>
            <div slot="page-content">
              <el-table :data="db.haStatusList" ref="dataTable">
                <el-table-column label="类别" prop="type"></el-table-column>
                <el-table-column label="状态" prop="status"></el-table-column>
              </el-table>
            </div>
          </page-template>
        </div>
      </div>
    </overview-card>
    <overview-card>
      <div slot="title">资源</div>
      <div
        slot="operate"
        :class="{ 'm-tool-collpise': !showResource }"
        class="m-tool-img"
        @click.stop="handleCollpise('resource')"
      ></div>
      <div slot="content" class="card-content" v-if="showResource">
        <div class="card-item">
          <page-template>
            <div slot="toolbar-left" style="padding-top: 10px">
              <m-button
                type="primary"
                @on-click="showModal('create')"
                icon="el-icon-plus"
                >添加</m-button
              >
              <m-button
                type="danger"
                @on-click="showModal('edit')"
                icon="el-icon-edit"
                :disabled="selectedList.length <= 0"
                >编辑</m-button
              >
              <m-button
                type="danger"
                @on-click="handleDelete"
                icon="el-icon-delete"
                :disabled="selectedList.length <= 0"
                >删除</m-button
              >
            </div>
            <div slot="page-content">
              <el-table :data="db.haResourceList" ref="dataTable" @selection-change="handleSelect">
								<el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="ID" prop="sid"></el-table-column>
                <el-table-column label="状态" prop="state"></el-table-column>
                <el-table-column label="节点" prop="node"></el-table-column>
                <el-table-column label="名称" prop="sid"></el-table-column>
                <el-table-column
                  label="最大重启"
                  prop="max_restart"
                ></el-table-column>
                <el-table-column
                  label="最大重定位"
                  prop="max_relocate"
                ></el-table-column>
                <el-table-column label="组" prop="group"></el-table-column>
                <el-table-column label="描述" prop="comment"></el-table-column>
              </el-table>
            </div>
          </page-template>
          <create-ha-modal
            :title="title"
            :isCreate="isCreate"
            :param="param"
            :visible="visible"
            v-if="visible"
            :modal-type="type"
            @close="visible = false"
          ></create-ha-modal>
        </div>
      </div>
    </overview-card>
  </div>
</template>
<script>
import OverviewCard from "@src/components/card/OverviewCard";
import HaHttp from "@src/views/home/dataCenter/ha/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateHaModal from "./CreateHaModal";
export default {
  name: "Ha",
  mixins: [HaHttp],
  components: {
    PageTemplate,
    OverviewCard,
    MButton,
    CreateHaModal,
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "创建：复制作业",
      selectedList: [],
      isCreate: true,
      param: {},
			showStatus: true,
			showResource: true,
			resourceList: []
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //初始化查找
    __init__() {
			this.queryHaStatus();
    },
    //是否展示弹框
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "添加：资源：容器/虚拟机" : "编辑：复制作业";
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
          this.deleteHa();
        })
        .catch(() => {});
    },
    handleCollpise(type) {
      if (type === "status") {
        this.showStatus = !this.showStatus;
      } else {
				this.showResource = !this.showResource;
			}
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
.card {
  width: 100%;
}
.m-tool-img {
  background-image: url("~@images/tool-sprites.png");
  overflow: hidden;
  width: 16px;
  height: 16px;
  margin: 0;
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=80);
  opacity: 0.8;
  background-position-y: -224px;
  display: inline-block;
  transition: transform 0.5s linear;
}
.m-tool-collpise {
  transform: rotate(180deg);
  transition: transform 0.5s linear;
}
/deep/.card{
	min-height: auto!important;
}
</style>