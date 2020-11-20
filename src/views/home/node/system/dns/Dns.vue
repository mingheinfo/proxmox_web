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
        :data="dnsList"
        ref="dataTable"
				:show-header="false"
        :default-sort="{ prop: 'label', order: 'ascending' }"
      >
        <el-table-column label="名称" prop="label" sortable></el-table-column>
        <el-table-column label="类别" prop="value" sortable></el-table-column>
      </el-table>
      <edit-dns-modal :visible="visible"
														:title="title"
														:param="param"
														@close="visible = false; __init__()"
														v-if="visible"
			                     ></edit-dns-modal>
    </div>
  </page-template>
</template>
<script>
import NodeSystemDnsHttp from "@src/views/home/node/system/dns/http";
import PageTemplate from "@src/components/page/PageTemplate";
import OverviewCard from '@src/components/card/OverviewCard';
import Dialog from "@src/components/dialog/Dialog";
import MButton from "@src/components/button/Button";
import { dateFormat } from "@libs/utils/index";
import { network_iface_types } from '@libs/enum/enum';
import EditDnsModal from './EditDnsModal';
import { isEmpty }  from '@libs/utils/index';
export default {
  name: "NodeSystemDns",
  mixins: [NodeSystemDnsHttp],
  components: {
    PageTemplate,
    MButton,
    Dialog,
		EditDnsModal,
		OverviewCard
  },
  data() {
    return {
      visible: false,
      title: "创建：复制作业",
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
			dnsList: [],
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
			this.dnsList= [];
			await _this.queryNodeSystemDnsList()
			     .then(res => {
						 debugger
						  for(let dns in _this.db.dnsObj) {
								this.dnsList.push({
									label: dns.indexOf('dns') > -1 ? `DNS服务器${dns.match(/(\d)/g)[0]}` : `${this.$t(dns)}`,
									value: _this.db.dnsObj[dns]
								})
							}
						});
    },
    //是否展示弹框
    showModal(type) {
      this.title = "编辑：dns";
      this.param = this.db.dnsObj;
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