<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button
        type="primary"
        @on-click="showModal('edit')"
        icon="el-icon-edit"
        >编辑</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="timeList"
        ref="dataTable"
				:show-header="false"
        :default-sort="{ prop: 'label', order: 'ascending' }"
      >
        <el-table-column label="名称" prop="label" sortable></el-table-column>
        <el-table-column label="类别" prop="value" sortable></el-table-column>
      </el-table>
      <edit-time-modal :visible="visible"
														:title="title"
														:param="param"
														@close="visible = false; __init__()"
														v-if="visible"
			                     ></edit-time-modal>
    </div>
  </page-template>
</template>
<script>
import NodeSystemTimeHttp from "@src/views/home/node/system/time/http";
import PageTemplate from "@src/components/page/PageTemplate";
import OverviewCard from '@src/components/card/OverviewCard';
import Dialog from "@src/components/dialog/Dialog";
import MButton from "@src/components/button/Button";
import { dateFormat } from "@libs/utils/index";
import { network_iface_types } from '@libs/enum/enum';
import EditTimeModal from './EditTimeModal';
import { isEmpty }  from '@libs/utils/index';
export default {
  name: "NodeSystemTimeZone",
  mixins: [NodeSystemTimeHttp],
  components: {
    PageTemplate,
    MButton,
    Dialog,
		EditTimeModal,
		OverviewCard
  },
  data() {
    return {
      visible: false,
      title: "编辑时区",
      selectedList: [],
      isCreate: true,
      param: {},
      showLog: false,
			interVal: null,
			menu_items: [],
			visible: false,
			isCreate: false,
			iftype: '',
			title: '',
			changes: "",
			timeList: [],
      datetime: [
        dateFormat(
          new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd hh:mm:ss"
        ),
        dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss"),
      ],
      text: "",
      done: false,
      modalType: "progress",
      beginRefresh: false,
      types: ["bridge", "bond", "vlan", "ovs"],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //初始化查找
    async __init__() {
			let _this = this;
			this.timeList= [];
			await _this.queryTime()
			     .then(res => {
						  for(let time in _this.db.timeZoneObj) {
								this.timeList.push({
									label: `${this.$t(`times.${time}`)}`,
									value: time === 'timezone' ? _this.db.timeZoneObj[time] : dateFormat(new Date(_this.db.timeZoneObj[time]*1000), 'yyyy-MM-dd hh:mm')
								})
							}
						});
    },
    //是否展示弹框
    showModal(type) {
      this.title = "编辑：时区";
      this.param = this.db.timeZoneObj;
      this.visible = true;
    }
  },
  beforeDestroy() {
    if (this.interVal) {
      clearInterval(this.interVal);
      this.interVal = null;
    }
  },
};
</script>