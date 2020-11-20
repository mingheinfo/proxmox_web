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
        >创建：Thinpool</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="db.nodeDiskLvmThinList"
        ref="dataTable"
      >
        <el-table-column label="名称" prop="lv">
					<template slot-scope="scope">
						<i :class="scope.row && scope.row.leaf === 0 ? 'fa fa-object-group' : 'fa fa-hdd-o'"></i>
						<span>{{scope.row && scope.row.lv}}</span>
					</template>
				</el-table-column>
        <el-table-column label="使用率" prop="used">
          <template slot-scope="scope">
						<LinePercentChart :value="scope.row.lv_size && scope.row.used
                ? ((scope.row.lv_size - scope.row.used) / scope.row.lv_size) * 100
                : 0" :title="scope.row.lv_size && scope.row.used
                ? percentToFixed(((scope.row.lv_size - scope.row.used) / scope.row.size), 3)
                : 0"></LinePercentChart>
          </template>
        </el-table-column>
        <el-table-column label="大小" prop="size">
					<template slot-scope="scope">
						{{scope.row && scope.row.lv_size && byteToSize(scope.row.lv_size)}}
					</template>
				</el-table-column>
        <el-table-column label="已用" prop="used">
						<template slot-scope="scope">
						{{scope.row && scope.row.used && byteToSize(scope.row.used)}}
					</template>
				</el-table-column>
				<el-table-column label="元数据使用率" prop="metadata_used">
					<template slot-scope="scope">
						<LinePercentChart :value="scope.row.metadata_size && scope.row.metadata_used
                ? ((scope.row.metadata_used) / scope.row.metadata_size) * 100
                : 0" :title="scope.row.metadata_size && scope.row.metadata_used
                ? percentToFixed(((scope.row.metadata_used) / scope.row.metadata_size), 3)
                : 0"></LinePercentChart>
          </template>
				</el-table-column>
				<el-table-column label="元数据大小" prop="metadata_size">
					<template slot-scope="scope">
						{{scope.row && scope.row.metadata_size && byteToSize(scope.row.metadata_size)}}
					</template>
				</el-table-column>
				<el-table-column label="已使用的元数据" prop="metadata_used">
					<template slot-scope="scope">
						{{scope.row && scope.row.metadata_used && byteToSize(scope.row.metadata_used)}}
					</template>
				</el-table-column>
      </el-table>
      <create-thin-pool-modal
        :title="title"
        :visible="visible"
				v-if="visible"
        @close="
          visible = false;
          __init__()
        "
      ></create-thin-pool-modal>
    </div>
  </page-template>
</template>
<script>
import LinePercentChart from '@src/components/chart/line/LineCharts';
import NodeDiskLvmThinHttp from "@src/views/home/node/disk/lvmthin/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import { percentToFixed, byteToSize } from '@libs/utils/index';
import CreateThinPoolModal from './CreateThinPoolModal'; 
export default {
  name: "Lvm",
  mixins: [NodeDiskLvmThinHttp],
  components: {
    PageTemplate,
		MButton,
		LinePercentChart,
    CreateThinPoolModal
  },
  data() {
    return {
      visible: false,
      title: "创建：Lvm Thinpool",
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
      this.queryDiskLvmThin();
    },
    //是否展示弹框
    showModal() {
      this.title = "创建：Lvm Thinpool";
      this.visible = true;
    },
    //按钮是否可点击
    inStatus() {
      return this.selectedList.length !== 1;
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