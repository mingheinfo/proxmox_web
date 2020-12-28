<template>
  <div class="m-form__content">
    <div class="m-form__section">
      <dl>
        <dt>基本信息</dt>
        <dd>
          <m-input
            type="text"
            prop="storage"
            label="ID"
            labelWidth="100px"
            validateEvent
            @validate="validate"
            :show-error="rules.storage.error"
            :error-msg="rules.storage.message"
            v-model="storage"
						:disabled="!isCreate"
            placeholder="请输入ID"
          />
						<m-select
					          labelWidth="100px"
										prop="pool"
										@on-change="(value) => pool = value"
									  validateEvent
										@validate="validate"
										:show-error="rules.pool.error"
										:error-msg="rules.pool.message"
										v-model="pool"
					          label="内容">
						<m-option v-for="item in cephPoolsList" 
						          :key="item.pool_name"
                      :label="item.pool_name"
                      :value="item.pool_name"></m-option>
					</m-select>
          <m-input
            type="text"
            prop="monhost"
            label="Monitor(s)"
            labelWidth="100px"
            validateEvent
            @validate="validate"
						:disabled="pveceph"
            :show-error="rules.monhost.error"
            :error-msg="rules.monhost.message"
            v-model="monhost"
            placeholder="请输入monitor"
          />
					<m-checkbox  
					    label="启用"
							v-model="disable"
              labelWidth="100px"></m-checkbox>
					<m-input
            type="text"
            prop="username"
            label="用户名"
            labelWidth="100px"
            v-model="username"
						:disabled="!isCreate || pveceph"
            placeholder="请输入用户名"
          />
				  	<m-select type="multiple"
					          labelWidth="100px"
										@on-change="handleSelect"
										validateEvent
										@validate="validate"
										prop="content"
										v-model="content"
										:show-error="rules.content.error"
                    :error-msg="rules.content.message"
					          label="内容">
						<m-option v-for="item in options" 
						          :key="item.value"
                      :label="item.label"
                      :value="item.value"></m-option>
					</m-select>
					<m-input
            type="number"
            prop="maxfiles"
            label="最大备份数"
            labelWidth="100px"
            validateEvent
            @validate="validate"
            :show-error="rules.maxfiles.error"
            :error-msg="rules.maxfiles.message"
						min="0"
						:disabled="content.indexOf('backup') === -1"
            v-model="maxfiles"
            placeholder="请输入最大备份数"
          />
						<m-checkbox  
					    label="KRBD"
							v-model="krbd"
              labelWidth="100px"></m-checkbox>
						<m-checkbox  
					    label=""
							v-model="pveceph"
							:disabled="!pvecephPossible"
							@change="(value) => {
								if(value) {
								   monhost = quickSort(this.db.cephMonList.map(item => item.name), 'name').join(',');
									 username = 'admin';
								} else {
									monhost = '';
									username = '';
								}
							}"
              labelWidth="100px">使用Proxmox VE管理的超融合ceph池</m-checkbox>
        </dd>
      </dl>
			<dl>
        <dt>节点</dt>
        <dd>
          <el-table :data="db.nodeList" 
					         @selection-change="handleSelectionChange">
            <el-table-column
                type="selection"
                width="55">
            </el-table-column>
						<el-table-column label="节点" prop="node" sortable></el-table-column>
						<el-table-column label="内存使用率">
							<template slot-scope="scope">
								{{scope.row.mem && scope.row.maxmem && percentToFixed(scope.row.mem / scope.row.maxmem, 3)}}
							</template>
						</el-table-column>
						<el-table-column label="CPU使用率">
							<template slot-scope="scope">
								{{scope.row.cpu && scope.row.cpu && scope.row.maxcpu && percentToFixed(scope.row.cpu, 3) + ` of ${scope.row.maxcpu}`}}
							</template>
						</el-table-column>
					</el-table>
        </dd>
      </dl>
    </div>
  </div>
</template>
<script>
import DataCenterStorageHttp from "@src/views/home/dataCenter/storage/http";
import { flotToFixed, percentToFixed, quickSort} from '@libs/utils/index';
export default {
	name: 'CreateDirStorage',
	mixins: [DataCenterStorageHttp],
	 props: {
    isCreate: {
      type: Boolean,
      default: true,
    },
    param: {
      type: Object,
    },
  },
	data() {
		return {
			storage: '',
      monhost: '',
      content: ['images'],
			nodes: [],
			username: 'admin',
			pool: '',
      shared: true,
      type: 'dir',
			disable: false,
			maxfiles: 1,
			pveceph: true,
			pvecephPossible: true,
			cephPoolsList: [],
			krbd: false,
			options: [
			  {
					label: '磁盘映像',
					value: 'images'
				},
				{
					label: 'iso镜像',
					value: 'iso'
				},
				{
					label: '容器模板',
					value: "vztmpl"
				},
				{
					label: 'VZDump备份文件',
					value: "backup"
				},
				{
					label: '容器',
					value: 'rootdir'
				},
				{
					label: '片段',
					value: 'snippets'
				}
			],
			rules: {
				storage: {
					error: false,
					message: ''
				},
				monhost: {
					error: false,
					message: ''
				},
				maxfiles: {
					error: false,
					message: ''
				},
				content: {
					error: false,
					message: ''
				},
				pool: {
					error: false,
					message: ''
				}
			}
		}
	},
	mounted() {
		this.__init__();
	},
	methods: {
		flotToFixed,
		percentToFixed,
		__init__() {
			this.queryNode().then(() => {
        this.$nextTick(() => {
          this.db.nodeList.forEach((item) => {
            this.nodes.forEach((node) => {
              if (item.node === node) {
                this.$refs.dataTable.toggleRowSelection(item, true);
              }
            });
          });
        });
      });
      if (this.isCreate) {
      
      } else {
        Object.keys(this.param).forEach((key) => {
          if (["disable", 'shared', 'pveceph', 'krbd'].includes(key)) {
            this[key] = this.param[key] === 1 ? true : false;
          } else if (key === "nodes" || key === "content") {
            this[key] = this.param[key].split(",");
          } else {
            this[key] = this.param[key];
          }
				});
				this.disable = this.param.disable ? false : true;
				this.queryCephPools()
				    .then(res => {
							this.cephPoolsList = quickSort(this.db.cephPoolsList, 'pool_name');
						});
			};
			if(this.isCreate) {
				this.queryCephMon().then(res => {
							this.monhost = quickSort(this.db.cephMonList.map(item => item.name), 'name').join(',');
							if (this.isCreate) {
								this.pvecephPossible = true;
							} else {
								this.pveceph = false;
							}
			  }).catch(res => {
					this.pvecephPossible = false;
					this.pveceph = false;
				});
				this.queryCephPools()
				    .then(res => {
							this.cephPoolsList = quickSort(this.db.cephPoolsList, 'pool_name');
							this.pool = this.cephPoolsList[0].pool_name;
						});
			}
		},
		//单个校验
		validate(prop) {
			let value = String(this[prop]).trim();
			this.rules[prop].error = false;
			this.rules[prop].message = '';
			//校验是否为空
			if(/^\s*$/.test(value)) {
				this.rules[prop].error = true;
				this.rules[prop].message = '不能为空';
				return;
			}
			//校验名称
			if(prop === 'storage' && !/^[A-Z|a-z][\w\-\_\.]{0,}[A-Z|a-z|0-9]$/.test(value)) {
				this.rules[prop].error = true;
				this.rules[prop].message = "ID只能以A-Z|a-z开头，以A-Z|a-z|0-9结尾，至少两个字符允许'A-Z','a-z','0-9','-',_,'.'";
				return;
			}
			if(prop === 'path' && !/^[\/][A-Za-z\\\-\_0-9]{1,}/.test(value))  {
				this.rules[prop].error = true;
				this.rules[prop].message = "路径是以/开头的绝对路径";
				return;
			}
		},
		//选择内容
		handleSelect(value) {
		 this.content = value;
		},
		handleSelectionChange(row) {
			this.nodes = row.map(item => item.node);
		},
		//整体校验
		validateAll() {
			let props = ['storage',  'content',  'maxfiles', 'pool'];
			props.forEach(prop => this.validate(prop));
			return props.some(prop => this.rules[prop].error === true);
		}
	}
}
</script>