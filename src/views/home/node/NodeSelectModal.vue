<template>
  <Dialog
    :visible="visible"
    @cancel="close"
    @confirm="confirm"
    :title="title"
    :_style="{ width: '956px' }"
    @close="$emit('close')"
  >
    <div slot="content" style="max-height: 500px; padding: 10px 20px;">
			<dl>
				<dd>
					<m-select
                prop="node"
                label="节点"
                labelWidth="110px"
                validateEvent
                @on-change="handleNodeSelect"
                v-model="node"
                @validate="validate('node')"
                :show-error="rules['node'].error"
                :error-msg="rules['node'].message"
                placeholder="请选择节点"
                v-if="modalType === 'migrateall'"
              >
                <m-option
                  v-for="(item, index) in nodeList"
                  :key="item.node"
                  :label="item.node"
                  :value="item.node"
                >
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">节点</span>
                        <span class="table-td">内存使用率</span>
												<span class="table-td">CPU使用率</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td" :title="item.node">{{ item.node }}</span>
                      <span class="table-td" :title="item.mem && item.maxmem && percentToFixed(item.mem / item.maxmem, 3)">{{
                      item.mem && item.maxmem && percentToFixed(item.mem / item.maxmem, 3)
                    }}</span>
                    <span class="table-td" :title="item.cpu && item.maxcpu && `${percentToFixed(item.cpu, 3)} of ${item.maxcpu}`">{{
                      item.cpu && item.maxcpu &&  `${percentToFixed(item.cpu, 3)} of ${item.maxcpu}`
                    }}</span>
                    </div>
                  </div>
                </m-option>
              </m-select>
							 <m-input
                type="number"
                prop="maxworkers"
                label="并行作业"
                labelWidth="110px"
                v-model="maxworkers"
								min="1"
								max="100"
                v-if="modalType === 'migrateall'"
                placeholder="请输入并行作业"
              />
              <m-checkbox
                label="允许本地磁盘迁移"
                v-model="withLocalDisks"
                labelWidth="110px"
                v-if="modalType === 'migrateall'"
              >
							 Note: Migration with local disks might take long.
							</m-checkbox>
				</dd>
			</dl>
      <el-table :data="vmList" ref="dataTable" style="padding-left: 10px;">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column label="ID" prop="vmid"></el-table-column>
				<el-table-column label="节点" prop="node"></el-table-column>
				<el-table-column label="状态" prop="status">
					<template slot-scope="scope">
						 <table-info-state
                        :content="
                          scope.row.status && scope.row.status === 'running'
                            ? '运行中'
                            : '已停止'
                        "
                        :state="
                          scope.row.status && scope.row.status === 'running'
                            ? 'actived'
                            : 'unActived'
                        "
                      ></table-info-state>
					</template>
				</el-table-column>
				<el-table-column label="名称" prop="name"></el-table-column>
				<el-table-column label="资源池" prop="pool"></el-table-column>
				<el-table-column label="类别" prop="type"></el-table-column>
				<el-table-column label="HA状态" prop="hastate">
					<template slot-scope="scope">
						 <table-info-state
                        :content="
                          scope.row.status && scope.row.status === 'started'
                            ? '运行中'
                            : '已停止'
                        "
                        :state="
                          scope.row.status && scope.row.status === 'started'
                            ? 'actived'
                            : 'unActived'
                        "
                      ></table-info-state>
					</template>
				</el-table-column>
			</el-table>
			<Dialog :visible="showLog"
              @close="closeLog"
              :_style="{
      width: '800px',
    }"
    title="Task Viewer: 任务进度">
        <template slot="content">
          <m-tab v-model="tab" @tab-click="handleTabChange">
            <m-tab-panel label="输出" name="log"></m-tab-panel>
             <m-tab-panel label="状态" name="status"></m-tab-panel>
          </m-tab>
          <m-button class="create-btn m-margin-top-10" type="primary" @on-click="stopTask1" :disabled="db.addClusterStatusObj.status !== 'running'"
          >停止</m-button>
          <el-scrollbar style="height: 100%">
             <div class="taskmodal-content">
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
             </div>
          </el-scrollbar>
        </template>
        <template slot="footer">
          <span></span>
        </template>
      </Dialog>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import NodeHttp from "@src/views/home/node/http";
import { dateFormat, percentToFixed, quickSort  } from '@libs/utils/index'
export default {
  name: "CreateIPSetModal",
  mixins: [NodeHttp],
  components: {
    Dialog,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    modalType: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    param: {
      type: Object,
      default: () => {
        return {};
      },
    }
  },
  data() {
    return {
      name: "",
      comment: "",
			selectedList: [],
			vmList: [],
			showLog: false,
			interVal: null,
			tab: 'log',
			node: "",
			maxworkers: 1,
      withLocalDisks: false,
      nodeList: [],
			rules: {
				node: {
					error:false,
					message: ''
				}
			}
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    dateFormat,
    percentToFixed,
    async __init__() {
			  let _this = this;
				_this.queryResource()
				    .then(res => {
							this.vmList = res.filter(it => {
								if(_this.param.operate === 'stopall')
									return ['lcx','qemu'].includes(it.type) && it.node === _this.param.node && it.status === 'running';
								if(_this.param.operate === 'startall')
									return ['lcx','qemu'].includes(it.type) && it.node === _this.param.node && it.status === 'stopped';
								return ['lcx','qemu'].includes(it.type) && it.node === _this.param.node
							})
							this.$refs.dataTable.toggleAllSelection();
							this.selectedList = this.vmList;
						})
				if(_this.param.operate === 'migrateall') {
          _this.queryNodeList()
               .then(res => {
                 let nodeList = _this.db.nodeList.filter(item => item.node !== _this.param.node);
                 _this.nodeList = quickSort(nodeList, 'node', '+');
                 _this.node = _this.nodeList[0].node;
               });
				}
      },
    close() {
			this.$emit("close");
    },
    confirm() {
			if(this.selectedList.length <=0) return;
			let param = {
				vms: this.selectedList.map(it => it.vmid).join(',')
			}
			switch(this.param.operate) {
				case 'stopall':
					 this.betach(this.param.operate, param)
						break;
				case 'startall':
					 param.force = 1;
					 this.betach(this.param.operate, param)
						break;
				case 'migrateall':
					if(this.validateAll()) return;
					Object.assign(param, {target: this.node, maxworkers: this.maxworkers, 'with-local-disks': this.withLocalDisks ? 1 : 0});
					this.betach(this.param.operate, param);
					break;
			}
		},
		 handleTabChange(value) {
      this.tab = value;
		},
		handleNodeSelect(value) {
			this.node = value;
		},
		validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "不能为空";
        return;
      }
    },
    validateAll() {
      let props = ["node"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    betach(operate, param) {
			  let _this = this;
				_this.beatchOperate(operate, _this.param.node, param)
					    .then(res => {
								_this.showLog = true;
                _this.interVal = setInterval(() => {
									_this.queryLog(this.db.addClusterStatusObj.node, _this.db.addClusterStatusObj.upid)
									_this.queryStatus(this.db.addClusterStatusObj.node, _this.db.addClusterStatusObj.upid);
								}, 3000);
							}).catch((res) => {
								_this.$confirm.error({
									msg: res
								})
							});
		},
		stopTask1() {
      this.stopTask(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid);
		},
		closeLog() {
			if(this.interVal){
				clearInterval(this.interVal);
				this.interVal = null;
	  	}
			this.showLog = false;
			this.close();
		}
	},
	beforeDestroy() {
		if(this.interVal){
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