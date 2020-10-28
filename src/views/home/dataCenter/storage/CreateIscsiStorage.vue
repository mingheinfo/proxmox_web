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
					<m-checkbox  
					    label="启用"
							v-model="disable"
              labelWidth="100px"></m-checkbox>
					<m-input
            type="text"
            prop="portal"
            label="Portal"
            labelWidth="100px"
            validateEvent
            @validate="validate"
            :show-error="rules.portal.error"
            :error-msg="rules.portal.message"
            v-model="portal"
						 :disabled="!isCreate"
            placeholder="请输入portal"
          />

					<m-select labelWidth="100px"
										@on-change="handleTargetSelect"
										validateEvent
										@validate="validate"
										prop="target"
										v-model="target"
										:readonly="false"
										@visible-change="handleTargetReq"
										:show-error="rules.target.error"
                    :error-msg="rules.target.message"
										 :disabled="!isCreate"
					          label="Target">
						<m-option v-for="item in db.glusterfsList" 
						          :key="item.share"
                      :label="item.share"
                      :value="item.share"></m-option>
					</m-select>
						<m-checkbox  
					    label="直接使用LUN"
							v-model="lun"
              labelWidth="100px"></m-checkbox>
        </dd>
      </dl>
			<dl>
        <dt>节点</dt>
        <dd>
          <el-table :data="db.nodeList"
					          ref="dataTable"
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
								{{scope.row.cpu && scope.row.cpu && scope.row.maxcpu && percentToFixed(scope.row.cpu, 3) + `% of ${scope.row.maxcpu}`}}
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
import { flotToFixed, percentToFixed} from '@libs/utils/index';
export default {
	name: 'CreateCifsStorage',
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
      nodes: [],
			portal: '',
			target: '',
			lun: false,
			type: 'iscsi',
			content: '',
			disable: false,
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
				portal: {
					error: false,
					message: ''
				},
				target: {
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
        this.storage = "";
        this.portal = "";
        this.content = ["images"];
        this.nodes = [];
        this.target = "";
        this.lun = true;
        this.type = "dir";
        this.disable = true;
        this.maxfiles = 1;
      } else {
        Object.keys(this.param).forEach((key) => {
          if (["disable", 'lun'].includes(key)) {
            this[key] = this.param[key] === 0 ? true : false;
          } else if (key === "nodes" || key === "content") {
            this[key] = this.param[key].split(",");
          }else {
            this[key] = this.param[key];
          }
				});
					this.disable = this.param.disable ? false : true
      };
		},
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
			let props = ['storage', 'portal',  'target'];
			props.forEach(prop => this.validate(prop));
			return props.some(prop => this.rules[prop].error === true);
		},
		//查询导出数据
		handleTargetReq() {
			this.validate('portal');
			if(this.isCreate)
			this.queryIscsi('', this.portal)
		},
		//选择share
		handleTargetSelect(value) {
			this.target = value;
		}
	}
}
</script>