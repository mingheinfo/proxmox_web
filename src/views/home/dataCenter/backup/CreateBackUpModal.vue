<template>
  <Dialog :visible="visible" 
          v-if="visible" 
          @cancel="close"
          @confirm="confirm"
          :title="title"
          :_style="{ width: '956px' }" @close="$emit('close')">
    <div slot="content" style="max-height: 500px">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>基本信息</dt>
            <dd>
              <m-select
                type="text"
                prop="node"
                label="节点"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.node.error"
                :error-msg="rules.node.message"
                :readonly="false"
                @on-change="handleNodeSelect"
                v-model="node"
                placeholder="--所有--"
              >
							  <m-option
                  v-for="item in db.nodeList"
                  :key="item.node"
                  :label="item.node"
                  :value="item.node"
                >
								  <div class="table-tr">
                    <span class="table-td">{{item.node}}</span>
                    <span class="table-td">{{percentToFixed(item.mem / item.maxmem, 3)}}</span>
                    <span class="table-td">{{`${percentToFixed(item.cpu, 3)} of ${item.maxcpu}`}}</span>
                  </div>
								</m-option>
              </m-select>
              <m-input
                type="text"
                prop="mailto"
                label="发送邮箱至"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.mailto.error"
                :error-msg="rules.mailto.message"
                v-model="mailto"
                placeholder="请输入邮箱"
              />
              <m-select
                type="text"
                prop="storage"
                label="存储"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.storage.error"
                :error-msg="rules.storage.message"
                 @on-change="handleStorageSelect"
                v-model="storage"
                placeholder="请输入存储"
              >
							<m-option
                  v-for="item in db.storageList"
                  :key="item.storage"
                  :label="item.storage"
                  :value="item.storage"
                >
								 <div class="table-tr">
                    <span class="table-td">{{item.storage}}(名称)</span>
                    <span class="table-td">{{item.type}}(类别)</span>
                    <span class="table-td">{{byteToSize(item.avail)}}(可用)</span>
                    <span class="table-td">{{byteToSize(item.total)}}(总量)</span>
                  </div>
								</m-option>
              </m-select>
              <m-select
                type="text"
                prop="mailnotification"
                label="Email通知"
                labelWidth="100px"
                v-model="mailnotification"
                @on-change="handleNotificationChange"
                placeholder="请输入访客用户"
              >
              <m-option
                  v-for="item in mailnotificationList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></m-option>
              </m-select>
              <m-select
                type="multiple"
                prop="dow"
                label="星期几"
                labelWidth="100px"
                validateEvent
                v-model="dow"
                @on-change="handleDowSelect"
                placeholder="请选择星期几"
              >
              <m-option
                  v-for="item in dowList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></m-option>
              </m-select>
              <m-select
                labelWidth="100px"
                @on-change="handleCompressSelect"
                prop="compress"
                v-model="compress"
                label="压缩"
              >
                <m-option
                  v-for="item in compressList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></m-option>
              </m-select>
              <m-select
                labelWidth="100px"
                @on-change="handleStartTimeSelect"
                prop="starttime"
                v-model="starttime"
                :readonly="false"
                label="开始时间"
                validateEvent
                @validate="validate"
                :show-error="rules.starttime.error"
                :error-msg="rules.starttime.message"
              >
                <m-option
                  v-for="item in starttimeoptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></m-option>
              </m-select>
              <m-select
                type="number"
                prop="mode"
                label="模式"
                labelWidth="100px"
                validateEvent
                min="0"
                v-model="mode"
                @on-change="handleModeSelect"
                placeholder="请选择模式"
              >
               <m-option v-for="item in modeList"
                         :label="item.label"
                         :value="item.value" 
                         :key="item.value"></m-option>
              </m-select>
              <m-select
                type="text"
                prop="selMode"
                label="选择模式"
                labelWidth="100px"
                v-model="selMode"
                @on-change="handleSelMode"
                placeholder="请选择"
              >
              <m-option v-for="item in selModeList"
                         :label="item.label"
                         :value="item.value" 
                         :key="item.value"></m-option>
              </m-select>
               <m-select
                type="text"
                prop="pool"
                label="Pool to backUp"
                labelWidth="100px"
                v-model="pool"
                @on-change="handleSelPool"
                v-show="selMode === 'pool'"
                placeholder="请选择"
              >
              <m-option v-for="item in db.poolList"
                         :label="item.poolid"
                         :value="item.poolid" 
                         :key="item.poolid">
                            <div class="table-tr">
                              <span class="table-td">{{item.poolid}}(名称)</span>
                              <span class="table-td">{{item.comment}}(备注)</span>
                            </div>
                         </m-option>
              </m-select>
              <m-checkbox
                label="启用"
                v-model="enabled"
                labelWidth="100px"
              ></m-checkbox>
            </dd>
          </dl>
          <dl>
            <dt>虚拟机</dt>
            <dd>
             <el-table :data="db.vmList" ref="dataTable" @selection-change="handleSelectChange">
               <el-table-column type="selection" width="55px" :selectable="selectable"></el-table-column>
               <el-table-column label="ID" prop="vmid"></el-table-column>
               <el-table-column label="节点" prop="node"></el-table-column>
               <el-table-column label="状态" prop="status">
                 <template slot-scope="scope">
                   <table-info-state :content="scope.row.status === 'running' ? '运行中' : '已停止'" :state="scope.row.status === 'running' ? 'actived' : 'unActived'"></table-info-state>
                 </template>
               </el-table-column>
               <el-table-column label="名称" prop="node"></el-table-column>
               <el-table-column label="类别" prop="type"></el-table-column>
             </el-table>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import DataCenterBackUpHttp from "@src/views/home/dataCenter/backup/http";
import { flotToFixed, percentToFixed, byteToSize} from '@libs/utils/index';
export default {
  name: "CreateBackUpModal",
  mixins: [DataCenterBackUpHttp],
  components: {
    Dialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: ''
    },
    param: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      node: "",
      storage: "",
      dow: ["sat"],
      starttime: "00:00",
      mailto: "",
      mailnotification: "always",
      compress: "0",
      mode: "snapshot",
      pool: '',
      enabled: true,
      selMode: "include",
      exclude: "",
      vmid: [],
      selModeList: [
        {value: 'include', label: "包括选中的VMs"},
		    {value: 'all', label: '所有'},
		    {value: 'exclude', label: '不包括选中的虚拟机'},
	    	{value: 'pool', label: 'Pool based'}
      ],
      modeList: [
         {value: 'snapshot', label: '快照'},
         {value: 'suspend', label: '挂起'},
         {value:  'stop', label:'停止'}
      ],
      compressList:  [{
          value: '0', label: '无'
        },
        {value: 'lzo', label: 'LZO (快速)'},
        {value: 'gzip', label: 'GZIP (很好)'}
      ],
      starttimeoptions: [],
      mailnotificationList: [
        {
          label: '总是',
          value: 'always'
        },
        {
          label: '失败时',
          value: 'failure'
        }
      ],
      dowList: [
        {
          label: '星期一',
          value: 'mon'
        },
        {
          label: '星期二',
          value: 'tue'
        },
        {
          label: '星期三',
          value: 'wed'
        },
        {
          label: '星期四',
          value: 'thu'
        },
        {
          label: '星期五',
          value: 'fri'
        },
        {
          label: '星期六',
          value: 'sat'
        },
        {
          label: '星期天',
          value: 'sun'
        }
      ],
			rules: {
         node: {
					 error: false,
					 message: ''
				 },
        storage: {
					 error: false,
					 message: ''
				 },
				 mailto: {
					 error: false,
					 message: ''
         },
         starttime: {
           error: false,
					 message: ''
         }
			}
    };
	},
	mounted() {
		for(let i=0; i<24; i++) {
			for(let j = 0; j<= 45; j = j + 15) {
				this.starttimeoptions.push({
          label: (String(i).length < 2 ? `0${i}` : i) + ":" + (String(j).length < 2 ? `0${j}` : j),
          value: (String(i).length < 2 ? `0${i}` : i) + ":" + (String(j).length < 2 ? `0${j}` : j)
        });
			}
		}
    this.__init__();
	},
  methods: {
    percentToFixed,
    byteToSize,
     async __init__() {
      let _this = this;
      await _this.queryNodeList();
      await _this.queryResource();
      await _this.queryStorageList(_this.node ? _this.node : 'localhost').then(() => {
        if(_this.type === 'create' && _this.db.storageList && _this.db.storageList.length > 0)
        _this.storage = _this.db.storageList[0].storage;
        _this.validate('storage');
      });
      await _this.queryPoolList().then(() => {
         if(_this.type === 'create' && _this.db.poolList && _this.db.poolList.length > 0)
         _this.pool = _this.db.poolList[0].poolid;
      })
      if(_this.type === 'create') {
         _this.node = "";
         _this.storage = "";
         _this.dow = ['sat'];
         _this.starttime = "00:00";
         _this.mailto = "";
         _this.mailnotification = "always";
         _this.compress = "0";
         _this.mode = "snapshot";
         _this.pool = '';
         _this.enabled = true;
         _this.selMode = "include";
         _this.exclude = "";
      } else {
        Object.keys(_this.param).forEach((it) => {
          if(it === 'dow') {
            _this.dow = this.param[it].split(',')
          } else if( ['vmid', 'exclude'].includes(it)) {
             _this.selMode = it=== 'vmid' ? 'include' : it;
             _this.db.vmList.forEach(row => {
               _this.param[it].split(',').forEach((param) => {
                 if(String(row.vmid) === param){
                 _this.$refs &&  _this.$refs.dataTable.toggleRowSelection(row, true);
                   _this.vmid.concat(row.vmid);
                 }
               })
             });
          } else if (it === 'all') {
              _this.selMode = it;
              _this.db.vmList.forEach(row => {
                _this.$refs.dataTable.toggleRowSelection(row, true);
                _this.vmid.concat(row.vmid);
              });
          } else if (it === 'pool') {
            _this.selMode = it;
            _this.db.vmList.forEach(row => {
             if(row.pool === this.param[it])
             _this.$refs.dataTable.toggleRowSelection(row, true);
             _this.vmid.concat(row.vmid);
            });
            this.pool = this.param[it];
          } else if(it === 'enabled'){
             _this.enabled = _this.param[it] === '1' ? true : false
          } else {
            _this[it] = _this.param[it];
             if(it === 'storage') this.validate('storage');
           }
        })
      }
		},
		handleCompressSelect(value) {
      this.compress = value;
		},
		handleStartTimeSelect(value) {
     this.starttime = value;
    },
    handleDowSelect(value) {
      this.dow = value;
    },
		validate() {

    },
    handleNodeSelect(value) {
      this.node = value;
      this.queryStorageList(value);
    },
    handleStorageSelect(value) {
      this.storage = value;
    },
    handleNotificationChange(value) {
      this.mailnotification = value;
    },
    handleModeSelect(value) {
      this.mode = value;
    },
    handleSelMode(value) {
      this.selMode = value;
      switch(value) {
        case 'all':
          this.db.vmList.forEach(row => {
            this.$refs.dataTable.toggleRowSelection(row, true);
            this.vmid.concat(row.vmid);
          });
        break;
        case 'pool':
          this.db.vmList.forEach(row => {
            if(row.pool === this.pool)
            this.$refs.dataTable.toggleRowSelection(row, true);
            this.vmid.concat(row.vmid);
          });
          break;
        default:
          this.db.vmList.forEach(row => {
            this.$refs.dataTable.toggleRowSelection(row, false);
          });
      }
    },
    handleSelPool(value) {
      this.pool = value;
    },
    selectable: function(row, index) {
      if(this.selMode === 'all' || this.selMode === 'pool') {
        return false;
      } else {
        return true;
      }
    },
    close() {
      this.$emit('close');
    },
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message= '';
      if(/^\s*$/.test(value) && ['starttime', 'storage'].includes(prop)) {
        this.rules[prop].error = true;
        this.rules[prop].message= '不能为空';
         return;
      }
      if(prop === 'emailto') {
        if(!/(^[0-9A-Za-z|\u4e00-\u9fa5])@(0-9A-Za-z|\u4e00-\u9fa5).(a-zA-Z)/.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message= '邮箱格式不正确!';
          return;
        }
      }
    },
    validateAll() {
      let props = ['starttime', 'storage', 'mailto'];
      props.forEach(prop => this.validate(prop));
      return props.some(prop => this.rules[prop].error === true);
    },
    handleSelectChange(rows) {
      this.vmid = rows.map(row => row.vmid)
    },
    confirm() {
      if(this.validateAll()) return;
      let params = {
        starttime: this.starttime,
        mode: this.mode,
        compress: this.compress,
        dow: this.dow.join(','),
        enabled: this.enabled ? 1 : 0,
        storage: this.storage,
        mailnotification: this.mailnotification,
        mailto: this.mailto
      }
      if(this.selMode === 'all')params['all'] = 1;
      if(this.selMode === 'include') params['vmid'] = this.vmid.join(',');
      if(this.selMode === 'exclude') params['exclude'] = this.vmid.join(',');
      if(this.selMode === 'pool') params['pool'] = this.pool;
      this.node ? params['node'] = this.node : params['delete'] = 'node';
      if(this.type === 'create')
      this.createBackUp(params)
          .then(() => {
            this.close();
          });
      if(this.type !== 'create') {
         params['id'] = this.param.id;
         this.updateBackUp(params)
          .then(() => {
            this.close();
          });
      }
    }
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
         if(newVal) setTimeout(() => this.__init__(), 0);
        return newVal;
      }
    },
  },
};
</script>
<style lang="less" scoped>
.table {
  &-tr {
    display: table;
    height: 35px;
    line-height: 35px;
    min-width: 300px;
    border-bottom: 1px solid #ebeef5;
    cursor: pointer;
  }
  &-td {
    display: table-cell;
    height: 35px;
    line-height: 35px;
    max-width: 100px;
  }
  &-radio {
    width: 50px;
    padding-right: 20px;
  }
}
</style>