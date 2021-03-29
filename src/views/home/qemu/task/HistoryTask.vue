<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button
        type="primary"
        @on-click="showModal()"
        icon="el-icon-view"
				:disabled="selectedList.length !== 1"
        >查看</m-button
      >
    </div>
    <div slot="toolbar-right" style="text-align: right">
      <m-input
        type="text"
        prop="user"
        labelWidth="80px"
        label="用户名"
        v-model="user"
        @input="throttle(filter('user'), 1000)"
        placeholder="请输入用户名"
      >
         <i slot="prefix" class="el-icon-search"></i>
      </m-input>
      <m-checkbox
        label="仅错误"
        v-model="error"
        labelWidth="100px"
        @change="filter('error')"
      ></m-checkbox>
    </div>
    <div slot="page-content">
      <el-table
        :data="chunkDataList"
        ref="dataTable"
				:row-key="setRowKeys"
        :expand-row-keys="expands"
				@expand-change="expandChange"
				:row-class-name="setRoleCalssName"
        @selection-change="handleSelect"
        @sort-change="handleSort"
      >
			 <el-table-column type="expand">
          <template slot-scope="props">
            <table-info-state
              :content="props.row.status && props.row.status"
              :state="
                props.row.status &&
                props.row.status &&
                props.row.status === 'OK'
                  ? 'actived'
                  : 'dead'
              "
            ></table-info-state>
          </template>
          </el-table-column>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="开始" prop="starttime" sortable>
          <template slot-scope="scope">
            {{
              dateFormat(
                new Date(scope.row.starttime * 1000),
                "yyyy-MM-dd hh:mm:ss"
              )
            }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" prop="endtime" sortable>
          <template slot-scope="scope">
            {{
              dateFormat(
                new Date(scope.row.endtime * 1000),
                "yyyy-MM-dd hh:mm:ss"
              )
            }}
          </template>
        </el-table-column>
        <el-table-column label="节点" prop="node"></el-table-column>
        <el-table-column label="用户名" prop="user"></el-table-column>
        <el-table-column label="描述" prop="type">
          <template slot-scope="scope">
            {{
             render_upid(scope.row.pid, null, scope.row)
            }}
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="disable" show-overflow-tooltip>
          <template slot-scope="scope">
            <table-info-state
              :content="scope.row.status && scope.row.status"
              :state="
                scope.row.status &&
                scope.row.status &&
                scope.row.status === 'OK'
                  ? 'actived'
                  : 'dead'
              "
            ></table-info-state>
          </template>
        </el-table-column>
      </el-table>
       <el-pagination class="page-table-pagination"
          @size-change="(val) => {pageSize = val; chunks()}"
          @current-change="(val) => {currentPage = val; chunks()}"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40, 50]"
          :page-size="pageSize"
          :total="qemuTaskList.length"
           layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
			<Dialog
        :visible="showLog"
        @close="closeLog"
        :_style="{
          width: '800px',
        }"
        :title="title"
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
					  <div class="table" v-if="tab === 'log'">
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
import QemuTaskHttp from "@src/views/home/qemu/task/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import Dialog from "@src/components/dialog/Dialog";
import { dateFormat, render_upid, quickSort, throttle, chunkData } from "@libs/utils/index";
export default {
  name: "Replication",
  mixins: [QemuTaskHttp],
  components: {
    PageTemplate,
    MButton,
    Dialog
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "创建：复制作业",
      selectedList: [],
      isCreate: true,
			param: {},
			user: '',
			param: {},
      showLog: false,
      interVal: null,
			tab: 'log',
      error: false,
      currentPage: 1,
      pageSize: 10,
      expands: [],
      qemuTaskList: [],
      chunkDataList: []
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
		dateFormat,
    render_upid,
    throttle,
    chunkData,
    //初始化查找
    __init__() {
      let _this = this;
      this.queryTask()
          .then(res => {
           _this.qemuTaskList = quickSort(this.db.nodeTaskList, "starttime");
            _this.chunks();
          });
    },
    //是否展示弹框
    async showModal() {
      if(this.selectedList.length !== 1) return;
			this.title = `查看： ${this.render_upid(null, null, this.selectedList[0])}`;
			this.queryLog(this.selectedList[0].node, this.selectedList[0].upid);
			this.queryStatus(this.selectedList[0].node, this.selectedList[0].upid);
			this.interVal = await setInterval(() => {
          this.queryLog(this.selectedList[0].node, this.selectedList[0].upid);
					this.queryStatus(this.selectedList[0].node, this.selectedList[0].upid);
			}, 3000);
			this.showLog = true;
    },
    //按钮是否可点击
    inStatus() {
      return this.selectedList.length <= 0;
    },
    //选择
    handleSelect(row) {
      if(row)
      this.selectedList = row;
		},
		 handleTabChange(tab) {
			this.tab = tab;
		},
    closeLog() {
			 if (this.interVal) {
         clearInterval(this.interVal);
         this.interVal = null;
      }
      this.showLog = false;
      this.__init__();
		},
		stopTask1() {
      this.stopTask(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid);
    },
    handleDelete(type) {
      this.$confirm
        .confirm({
          msg: `你确定你要删除已选择项吗？`,
          type: "info",
        })
        .then(() => {
          this.delete(type);
        })
        .catch(() => {});
		},
		expandChange(row, expandedRows) {
      var that = this;
      if (expandedRows.length) {
        that.expands = [];
        if (row) {
          that.expands.push(row.upid);
        }
      } else {
        that.expands = [];
      }
    },
    setRowKeys(row) {
      return row.upid;
		},
		//设置row className
		setRoleCalssName({row, rowIndex}) {
      if(row.status !== 'OK') {
				return 'run-error'
			}
		},
    filter(type) {
      if (type === "user") {
				if(this.user){
				this.qemuTaskList = this.db.nodeTaskList.filter((item) => {
          return item.user === this.user;
        });
				} else {
					this.__init__();
				}
      } else if (type === "error") {
        if (this.error) {
          this.qemuTaskList = this.db.nodeTaskList.filter((item) => {
            return item.status !== "OK";
          });
        } else {
          this.__init__();
        }
      }
      this.chunks();
    },
    //排序
    handleSort({colume, prop, order}) {
      let _this = this;
      if(order !== null)
      _this.qemuTaskList = quickSort(_this.db.nodeTaskList, prop, order === 'ascending' ? '+' : '-');
    },
    chunks() {
      this.chunkDataList = chunkData(this.qemuTaskList, this.pageSize)[this.currentPage - 1];
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
/deep/.run-error{
	background: #f3d6d7!important;
	color: #fff!important;
	&:hover{
		color: #606266!important;
	}
}
/deep/.tool-bar-right{
   flex: 2;
}
</style>
