<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button
        type="primary"
        @on-click="refresh"
        icon="el-icon-refresh"
        >重载</m-button
      >
      <m-button
        type="primary"
        @on-click="showModal('create')"
        icon="el-icon-plus"
        >创建：ZFS</m-button
      >
			<m-button
        type="primary"
        @on-click="showModal('detail')"
				:disabled="selectedList.length !== 1"
        icon="el-icon-plus"
        >详情</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="db.nodeDiskZfsList"
        ref="dataTable"
				@selection-change="handleSelect"
				v-loading="loading"
      >
			  <el-table-column type="selection" width="55px"></el-table-column>
        <el-table-column label="名称" prop="name"></el-table-column>
        <el-table-column label="大小" prop="size">
					<template slot-scope="scope">
							{{scope.row.size && byteToSize(scope.row.size)}}
					</template>
				</el-table-column>
        <el-table-column label="空闲" prop="free">
					<template slot-scope="scope">
								{{scope.row.size && byteToSize(scope.row.free)}}
					</template>
				</el-table-column>
        <el-table-column label="已分配" prop="alloc">
					<template slot-scope="scope">
							{{scope.row.size && byteToSize(scope.row.alloc)}}
					</template>
				</el-table-column>
				<el-table-column label="碎片" prop="frag">
						<template slot-scope="scope">
							<LinePercentChart :value="scope.row.frag && scope.row.frag ? scope.row.frag : 0" :title="scope.row.frag && scope.row.frag
                ? percentToFixed(scope.row.frag, 3)
                : 0"></LinePercentChart>
						</template>
				</el-table-column>
				<el-table-column label="健康" prop="health">
					<template slot-scope="scope">
							<table-info-state :content="scope.row.health" :state="scope.row.health && scope.row.health.toLowerCase()"></table-info-state>
					</template>
				</el-table-column>
      </el-table>
      <create-zfs-modal
        :title="title"
        :visible="visible"
				v-if="visible"
				:modal-type="type"
				:param="param"
        @close="
          visible = false;
          __init__()
        "
      ></create-zfs-modal>
    </div>
  </page-template>
</template>
<script>
import LinePercentChart from '@src/components/chart/line/LineCharts';
import NodeDiskZfsHttp from "@src/views/home/node/disk/zfs/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import { percentToFixed, byteToSize, debounce } from '@libs/utils/index';
import CreateZfsModal from './CreateZfsModal';
export default {
  name: "Lvm",
  mixins: [NodeDiskZfsHttp],
  components: {
    PageTemplate,
		MButton,
		LinePercentChart,
    CreateZfsModal
  },
  data() {
    return {
      visible: false,
			title: "创建：Lvm Directory",
			type: '',
			param: {},
			selectedList: [],
			loading: false
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
		percentToFixed,
		byteToSize,
    //刷新zfs存储，利用防抖实现避免多次触发
    refresh: debounce(function() {this.__init__()}, 500),
    //初始化查找
    __init__() {
      this.queryDiskZfs();
		},
		//选择
		handleSelect(row) {
			this.selectedList = row;
		},
    //是否展示弹框
    showModal(type) {
			this.title = type === 'create' ? "创建：Lvm Directory" : "详情";
			this.type = type;
      this.visible = true;
      this.param = type === 'detail' ? this.selectedList[0] : {};//如果是detail时param为当前选中的值，否则为空
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
/deep/.line-desc-content{
	flex: 2 1 auto !important;
}
/deep/.line-desc{
	margin-top: 5px;
	padding: 10px 0px;
	background: #f6f6f6;
	border-bottom: 1px solid #fff;
}
</style>
