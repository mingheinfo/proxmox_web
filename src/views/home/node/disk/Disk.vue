<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="__init__" icon="el-icon-refresh">重载</m-button>
			<m-button type="warning" @on-click="showModal()" icon="el-icon-view"
                :disabled="selectedList.length !== 1">显示S.M.A.R.T.值</m-button>
			<m-button type="primary" @on-click="updateGpt" icon="el-icon-refresh-left" :disabled="inStatus()">使用GPT初始化磁盘</m-button>
    </div>
    <div slot="page-content">
      <el-table
        :data="db.nodeDiskList"
        ref="dataTable"
        @selection-change="handleSelect"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" prop="pos"></el-table-column>
				<el-table-column width="55" prop="pos"></el-table-column>
        <el-table-column label="设备" prop="devpath"></el-table-column>
        <el-table-column
          label="类别"
          prop="type"
        >
				  <template slot-scope="scope">
             {{renderType(scope.row.type)}}
          </template>
				</el-table-column>
        <el-table-column label="使用率" prop="used">
					<template slot-scope="scope">
						{{ renderUsed(scope.row.used) }}
					</template>
				</el-table-column>
        <el-table-column label="大小" prop="size">
					<template slot-scope="scope">
						{{scope.row && scope.row.size && byteToSize(scope.row.size)}}
					</template>
        </el-table-column>
				<el-table-column label="GPT" prop="gpt">
					<template slot-scope="scope">
            <table-info-state
              :content="
                scope.row.gpt && scope.row.gpt === 1 ? '是' : '否'
              "
              :state="
                scope.row.gpt && scope.row.gpt === 1
                  ? 'actived'
                  : 'unActived'
              "
            ></table-info-state>
          </template>
				</el-table-column>
				<el-table-column label="模型" prop="model"></el-table-column>
				<el-table-column label="串行" prop="serial"></el-table-column>
				<el-table-column label="S.M.A.R.T." prop="health"></el-table-column>
				<el-table-column label="Wearout" prop="wearout">
					<template slot-scope="scope">
            {{scope.row && scope.row.wearout && isNumber(scope.row.wearout) ? (100 - scope.row.wearout).toString() + '%' : 'NA'}}
					</template>
				</el-table-column>
      </el-table>
      <display-modal
        :title="title"
        :isCreate="isCreate"
        :param="param"
        :visible="visible"
        v-if="visible"
        :modal-type="type"
        :isGroup="isGroup"
        @close="visible = false; __init__()"
      ></display-modal>
			<Dialog
        :visible="showLog"
        @close="closeLog"
        :_style="{
          width: '800px',
        }"
        title="Task Viewer: 初始化Gpt"
      >
        <template slot="content">
          <m-tab v-model="tab" @tab-click="handleTabChange">
            <m-tab-panel label="输出" name="log"></m-tab-panel>
            <m-tab-panel label="状态" name="status"></m-tab-panel>
          </m-tab>
          <m-button
            class="create-btn m-margin-top-10"
            type="primary"
            @on-click="stopTask1"
            :disabled="db.addClusterStatusObj.status !== 'running'"
            >停止</m-button
          >
         <el-scrollbar style="height: 100%">
          <div class="taskmodal-content">
					  <div class="table">
            <div
              class="table-tr"
              v-for="item in db.addClusterLogList"
              :key="item.n"
            >
              {{ item.t }}
            </div>
          </div>
          <div class="table" v-if="tab === 'status'">
            <template v-for="(item, key) in db.addClusterStatusObj">
              <div
                class="table-tr"
                v-if="!['exitstatus', 'id', 'pstart'].includes(key)"
                :key="key"
              >
                <div class="table-td">{{ $t(`clusterStatus.${key}`) }}</div>
                <div class="table-td" v-if="key === 'starttime'">
                  {{ dateFormat(new Date(item * 1000), "yyyy-MM-dd hh:mm") }}
                </div>
                <div class="table-td" v-else>{{ item }}</div>
              </div>
            </template>
          </div>
				 </div>
         </el-scrollbar>
        </template>
        <template slot="footer">
          <span></span>
        </template>
      </Dialog>
    </div>
  </page-template>
</template>
<script>
import NodeDiskHttp from "@src/views/home/node/disk/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import { byteToSize } from '@libs/utils/index';
import DisplayModal from './DisplayModal';
export default {
  name: "Access",
  mixins: [NodeDiskHttp],
  components: {
    PageTemplate,
    MButton,
    DisplayModal
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "创建：复制作业",
      selectedList: [],
      isCreate: true,
      param: {},
			isGroup: false,
			showLog: false,
			interVal: null,
			tab: 'log',
      loading: false
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
		byteToSize,
    //初始化查找
    __init__() {
      this.queryListNodeDiskList();
		},
		isNumber(value) {
      return typeof value === 'number'
		},
    //是否展示弹框
    showModal(type) {
      this.type = type;
      this.title = 'S.M.A.R.T值';
      this.param = this.selectedList[0];
      this.visible = true;
    },
    //按钮是否可点击
    inStatus() {
      return this.selectedList.length !== 1  ||  (this.selectedList.length == 1 && !!this.selectedList[0].used);
    },
    //选择
    handleSelect(row) {
      this.selectedList = row;
		},
		 handleTabChange(tab) {
			this.tab = tab;
		},
    closeLog() {
      this.showLog = false;
      this.__init__();
		},
		stopTask1() {
      this.stopTask(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid);
		},
		renderUsed(value) {
			  if(!value) return;
		    if (value.osdid >= 0) {
			    let bluestore = '';
			   if (value.bluestore === 1) {
			    bluestore = ' (Bluestore)';
			    }
		     	return "Ceph osd." + value.osdid.toString() + bluestore;
		    }

		    let types = [];
		    if (value.journals > 0) {
		     	types.push('Journal');
		    }

		    if (value.db > 0) {
			    types.push('DB');
		    }

		    if (value.wal > 0) {
			   types.push('WAL');
		    }

		    if (types.length > 0) {
			     return 'Ceph (' + types.join(', ') + ')';
		    }

		    return value || '暂无数据';
		},
		renderType(v) {
		  if (v === 'ssd') {
		    return 'SSD';
		  } else if (v === 'hdd') {
		    return 'Hard Disk';
		  } else if (v === 'usb'){
		    return 'USB';
		  } else {
		    return '未知';
		  }
		},
		updateGpt() {
			this.initGPT()
			    .then(res => {
            	this.showLog = true;
							this.interVal = setInterval(() => {
                 	this.queryLog(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid);
							    this.queryStatus(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid);
							}, 3000)
					})
					.catch(res => {
						this.$confirm.confirm({
							msg: res
						})
					})
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
