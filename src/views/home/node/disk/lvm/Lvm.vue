<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button
        type="primary"
        @on-click="__init__()"
        icon="el-icon-refresh"
        >重载</m-button
      >
      <m-button
        type="primary"
        @on-click="showModal()"
        icon="el-icon-plus"
        >创建：Volume Group</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="db.nodeDiskLvmObj.children"
        ref="dataTable"
        :row-key="setRowKeys"
        :expand-row-keys="expands"
        v-loading="loading"
				:tree-props="{children: 'children'}">
      >
        <el-table-column label="名称" prop="name">
					<template slot-scope="scope">
						<i :class="scope.row && scope.row.leaf === 0 ? 'fa fa-object-group' : 'fa fa-hdd-o'"></i>
						<span>{{scope.row && scope.row.name}}</span>
					</template>
				</el-table-column>
        <el-table-column label="Lvs数" prop="lvcount"></el-table-column>
        <el-table-column label="使用率" prop="used">
          <template slot-scope="scope">
						<LinePercentChart :value="scope.row.size && scope.row.free
                ? ((scope.row.size - scope.row.free) / scope.row.size) * 100
                : 0" :title="scope.row.size && scope.row.free
                ? percentToFixed(((scope.row.size - scope.row.free) / scope.row.size), 3)
                : 0"></LinePercentChart>
          </template>
        </el-table-column>
        <el-table-column label="大小" prop="size">
					<template slot-scope="scope">
						{{scope.row && scope.row.size && byteToSize(scope.row.size)}}
					</template>
				</el-table-column>
        <el-table-column label="空闲" prop="free">
						<template slot-scope="scope">
						{{scope.row && scope.row.free && byteToSize(scope.row.free)}}
					</template>
				</el-table-column>
      </el-table>
      <create-volume-group-modal
        :title="title"
        :visible="visible"
				v-if="visible"
        @close="
          visible = false;
          __init__()
        "
      ></create-volume-group-modal>
    </div>
  </page-template>
</template>
<script>
import LinePercentChart from '@src/components/chart/line/LineCharts';
import NodeDiskLvmHttp from "@src/views/home/node/disk/lvm/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import { percentToFixed, byteToSize } from '@libs/utils/index';
import CreateVolumeGroupModal from './CreateVolumeModal';
export default {
  name: "Lvm",
  mixins: [NodeDiskLvmHttp],
  components: {
    PageTemplate,
		MButton,
		LinePercentChart,
    CreateVolumeGroupModal
  },
  data() {
    return {
      visible: false,
      title: "创建：Lvm Volume Group",
      selectedList: [],
			expands: [],
      loading: false
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
		percentToFixed,
		byteToSize,
    //初始化查找
    __init__() {
      this.queryDiskLvm({ _dc: new Date().getTime() });
    },
    //是否展示弹框
    showModal() {
      this.title = "创建：Lvm Volume Group";
      this.visible = true;
    },
    //按钮是否可点击
    inStatus() {
      return this.selectedList.length !== 1;
    },
    expandChange(row, expandedRows) {
      var that = this;
      if (expandedRows.length) {
        that.expands = [];
        if (row) {
          that.expands.push(row.name);
        }
      } else {
        that.expands = [];
      }
    },
    setRowKeys(row) {
      return row.name;
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
