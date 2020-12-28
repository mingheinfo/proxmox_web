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
            label="共享"
            v-model="shared"
            labelWidth="100px"
          ></m-checkbox>
          <m-select
            type="multiple"
            labelWidth="100px"
            @on-change="handleSelect"
            validateEvent
            @validate="validate"
            prop="content"
            v-model="content"
            :show-error="rules.content.error"
            :error-msg="rules.content.message"
            label="内容"
          >
            <m-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></m-option>
          </m-select>
          <m-checkbox
            label="启用"
            v-model="disable"
            labelWidth="100px"
          ></m-checkbox>
          <m-input
            type="text"
            prop="path"
            label="目录"
            labelWidth="100px"
            validateEvent
            @validate="validate"
            :show-error="rules.path.error"
            :error-msg="rules.path.message"
            v-model="path"
            :disabled="!isCreate"
            placeholder="请输入目录"
          />
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
        </dd>
      </dl>
      <dl>
        <dt>节点</dt>
        <dd>
          <el-table
            :data="db.nodeList"
						ref="dataTable"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" :selectable="selectable"> </el-table-column>
            <el-table-column
              label="节点"
              prop="node"
              sortable
            ></el-table-column>
            <el-table-column label="内存使用率">
              <template slot-scope="scope">
                {{
                  scope.row.mem &&
                  scope.row.maxmem &&
                  percentToFixed(scope.row.mem / scope.row.maxmem, 3)
                }}
              </template>
            </el-table-column>
            <el-table-column label="CPU使用率">
              <template slot-scope="scope">
                {{
                  scope.row.cpu &&
                  scope.row.cpu &&
                  scope.row.maxcpu &&
                  percentToFixed(scope.row.cpu, 3) + ` of ${scope.row.maxcpu}`
                }}
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
import { flotToFixed, percentToFixed } from "@libs/utils/index";
export default {
  name: "CreateDirStorage",
  mixins: [DataCenterStorageHttp],
  props: {
    isCreate: {
      type: Boolean,
      default: true,
		},
		param: {
			type: Object
		}
	},
  data() {
    return {
      storage: "",
      path: "",
      content: ["images"],
      nodes: [],
      shared: true,
      type: "dir",
      disable: false,
      maxfiles: 1,
      options: [
        {
          label: "磁盘映像",
          value: "images",
        },
        {
          label: "iso镜像",
          value: "iso",
        },
        {
          label: "容器模板",
          value: "vztmpl",
        },
        {
          label: "VZDump备份文件",
          value: "backup",
        },
        {
          label: "容器",
          value: "rootdir",
        },
        {
          label: "片段",
          value: "snippets",
        },
      ],
      rules: {
        storage: {
          error: false,
          message: "",
        },
        path: {
          error: false,
          message: "",
        },
        maxfiles: {
          error: false,
          message: "",
        },
        content: {
          error: false,
          message: "",
        },
      },
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    flotToFixed,
    percentToFixed,
    __init__() {
			let _this = this;
      if (this.isCreate) {
        this.storage = "";
        this.path = "";
        this.content = ["images"];
        this.nodes = [];
        this.shared = true;
        this.type = "dir";
        this.disable = false;
        this.maxfiles = 1;
      }else {
				Object.keys(this.param).forEach((key) => {
					if(['disable', 'shared'].includes(key)) {
						_this[key] = _this.param[key] ===  1 ? true : false;
					} else if(key === 'nodes' || key === 'content'){
						_this[key] = _this.param[key].split(',');
					} else {			
				    this[key] = this.param[key]	
					}
						this.disable = this.param.disable ? false : true
			  })
			}
      this.queryNode().then(() => {
				if(!this.isCreate)
					this.$nextTick(()=>{
             _this.db.nodeList.forEach(item => {
              _this.nodes.forEach(node => {
								if(item.node === node) {
                  _this.$refs.dataTable.toggleRowSelection(item, true);
								}
							})
						})
						})
			});;
    },
    //单个校验
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      //校验是否为空
      if (/^\s*$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "不能为空";
        return;
      }
      //校验名称
      if (
        prop === "storage" &&
        !/^[A-Z|a-z][\w\-\_\.]{0,}[A-Z|a-z|0-9]$/.test(value)
      ) {
        this.rules[prop].error = true;
        this.rules[prop].message =
          "ID只能以A-Z|a-z开头，以A-Z|a-z|0-9结尾，至少两个字符允许'A-Z','a-z','0-9','-',_,'.'";
        return;
      }
      if (prop === "path" && !/^[\/][A-Za-z\\\-\_0-9]{1,}/.test(value)) {
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
      this.nodes = row.map((item) => item.node);
    },
    //整体校验
    validateAll() {
      let props = ["storage", "path", "content", "maxfiles"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
		},
		selectable(row, index){
     if(this.isCreate) {
			 return true;
		 }else {
			 return false;
		 }
		}
  },
};
</script>