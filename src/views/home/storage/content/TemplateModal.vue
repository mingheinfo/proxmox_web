<template>
  <Dialog
    :visible="visible"
    @cancel="close"
    :title="title"
    :_style="{ width: '956px' }"
    @close="$emit('close')"
  >
    <div slot="content" style="max-height: 500px">
			     <Dialog :visible="showLog"
              @close="closeLog"
              :_style="{
      width: '800px',
    }"
    title="Task Viewer: 下载模板">
        <template slot="content">
          <m-tab v-model="tab" @tab-click="handleTabChange">
            <m-tab-panel label="输出" name="log"></m-tab-panel>
             <m-tab-panel label="状态" name="status"></m-tab-panel>
          </m-tab>
          <m-button class="create-btn m-margin-top-10" type="primary" @on-click="stopTask1" :disabled="db.addClusterStatusObj.status !== 'running'"
          >停止</m-button>
          <div class="table" v-if="tab === 'log'">
            <div class="table-tr" v-for="item in db.addClusterLogList" :key="item.n">
              {{item.t}}
            </div>
          </div>
          <div class="table" v-if="tab === 'status'">
              <template v-for="(item, key) in db.addClusterStatusObj">
                <div class="table-tr" v-if="!['exitstatus', 'id', 'pstart'].includes(key)" :key="key">
                  <div class="table-td">{{$t(`clusterStatus.${key}`)}}</div>
                  <div class="table-td" v-if="key === 'starttime'">{{dateFormat(new Date(item * 1000), 'yyyy-MM-dd hh:mm')}}</div>
                  <div class="table-td" v-else>{{item}}</div>
                </div>
              </template>
          </div>
        </template>
        <template slot="footer">
          <span></span>
        </template>
      </Dialog> 
      <page-template>
        <div slot="toolbar-right">
          <m-input
            type="text"
            prop="searchText"
            labelWidth="80px"
            label="搜索"
            v-model="searchText"
            @input="search()"
            placeholder="请输入软件包名称"
          />
        </div>
        <div slot="page-content">
          <el-table
            :data="templateList"
            highlight-current-row
            @row-click="handleSelect"
          >
            <el-table-column width="55px">
              <template slot-scope="scope">
                <el-radio :label="scope.row.template" v-model="currentPkg"
                  >&nbsp;</el-radio
                >
              </template>
            </el-table-column>
            <el-table-column label="类别" prop="type"></el-table-column>
            <el-table-column label="软件包" prop="package"></el-table-column>
            <el-table-column label="版本" prop="version"></el-table-column>
            <el-table-column label="描述" prop="description" width="250px">
              <template slot-scope="scope">
                <span style="font-size: 12px">{{
                  scope.row.description && scope.row.description.split("-")[0]
                }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </page-template>
    </div>
    <template slot="footer">
      <m-button class="create-btn" type="primary" @on-click="downLoad()"
        >下载</m-button
      >
    </template>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import StorageContentHttp from "@src/views/home/storage/content/http";
import { byteToSize, uplodFile, throttle, dateFormat } from "@libs/utils/index";
import LinePercentChart from "@src/components/chart/line/LineCharts";
import PageTemplate from "@src/components/page/PageTemplate";
import { PORTOCOLIST } from "@libs/enum/enum";
import { gettext } from "@src/i18n/local_zhCN.js";
export default {
  name: "CreateVolumeModal",
  mixins: [StorageContentHttp],
  components: {
    Dialog,
    LinePercentChart,
    PageTemplate,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      searchText: "",
      currentPkg: "",
			templateList: [],
			interVal: null,
			showLog: false,
			tab: 'log'
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
		dateFormat,
    // //请求磁盘
    __init__() {
      let _this = this;
      _this.getTemplate().then(() => {
        this.templateList = _this.db.storageTemplateList;
      });
    },
    //选择磁盘
    handleSelect(row) {
      this.currentPkg = row.template;
    },
    //关闭弹框
    close() {
      this.$emit("close");
		},
		closeLog() {
			this.$emit("close");
		},
		//节流搜索
    search() {
      throttle(
        this.filterData(),
        500,
        false
      );
		},
		filterData() {
			 this.templateList = this.db.storageTemplateList.filter((item) => {
          if (item.package.indexOf(this.searchText) >= 0) return item;
        });
		},
		downLoad() {
			this.downLoadTemplate({
				storage: this.storage,
				template: this.currentPkg
			})
			this.showLog = true;
      this.interVal = setInterval(() => {
				this.queryLog(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid);
				this.queryStatus(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid)
			}, 3000);
		},
		//切换tab
		handleTabChange(value) {
			this.tab = value;
		},
		stopTask1() {
      this.stopTask(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid);
    },
	},
	beforeDestroy() {
    if (this.interVal) {
      clearInterval(this.interVal);
      this.interVal = null;
    }
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal) setTimeout(() => this.__init__(), 0);
        return newVal;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}
.upload-file {
  display: inline-flex;
}
.file-input {
  width: 100%;
  height: 100%;
  opacity: 0;
  position: absolute;
  left: 0px;
  top: 0px;
}
.upload-btn {
  position: relative;
  margin-left: -10px;
  border-left: none;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  height: 29px;
  line-height: 29px;
}
</style>