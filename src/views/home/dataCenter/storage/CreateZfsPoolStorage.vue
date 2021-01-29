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
            required
						:disabled="!isCreate"
            placeholder="请输入ID"
          />
          <m-checkbox
            label="启用"
            v-model="disable"
            labelWidth="100px"
          ></m-checkbox>

          <m-select
            labelWidth="100px"
            @on-change="handleZfsPoolSelect"
            prop="pool"
            label="Zfs池"
            validateEvent
						:disabled="!isCreate"
            @validate="validate"
            required
            :show-error="rules.pool.error"
            :error-msg="rules.pool.message"
            v-model="pool"
            placeholder="请输入iSCSI提供者"
          >
            <m-option
              v-for="item in db.zfsList"
              :key="item.pool"
              :label="item.pool"
              :value="item.pool"
            ></m-option>
          </m-select>
					<m-checkbox
            label="精简装置"
            v-model="sparse"
            labelWidth="100px"
          ></m-checkbox>
          <m-input
            type="text"
            prop="blocksize"
            label="块尺寸"
            labelWidth="100px"
            validateEvent
            @validate="validate"
            required
            :show-error="rules.blocksize.error"
            :error-msg="rules.blocksize.message"
            v-model="blocksize"
            placeholder="8k"
          />
          <m-select type="multiple"
					          labelWidth="100px"
										@on-change="handleContentSelect"
										validateEvent
										@validate="validate"
										prop="content"
										v-model="content"
                    required
										:show-error="rules.content.error"
                    :error-msg="rules.content.message"
					          label="内容">
						<m-option v-for="item in options"
						          :key="item.value"
                      :label="item.label"
                      :value="item.value"></m-option>
          </m-select>
        </dd>
      </dl>
      <dl>
        <dt>节点</dt>
        <dd>
          <el-table
            :data="db.nodeList"
						ref="dataTable"
           @selection-change="handleSelectionChange">
            <el-table-column
                type="selection"
                width="55">
            </el-table-column>
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
  name: "CreateZfsStorage",
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
      storage: "",
      monhost: "",
      content: ["images"],
      nodes: [],
			username: "",
      blocksize: "",
      pool: "",
      target: "",
      comstar_tg: "",
      iscsiprovider: "comstar",
      comstar_hg: "",
      lio_tpg: "",
      shared: true,
      type: "dir",
      disable: false,
      maxfiles: 1,
      pveceph: false,
      krbd: false,
      sparse: false,
      options: [
       {
					label: '磁盘映像',
					value: 'images'
				},
				{
					label: '容器',
					value: 'rootdir'
				}
      ],
      rules: {
        storage: {
          error: false,
          message: "",
        },
        pool: {
          error: false,
          message: "",
        },
        content: {
          error: false,
          message: "",
        },
        blocksize: {
          error: false,
          message: "",
        }
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
			_this.queryNode().then(() => {
        _this.$nextTick(() => {
          _this.db.nodeList.forEach((item) => {
            _this.nodes.forEach((node) => {
              if (item.node === node) {
                _this.$refs.dataTable.toggleRowSelection(item, true);
              }
            });
          });
        });
      });
      if (!_this.isCreate) {
        Object.keys(_this.param).forEach((key) => {
          if (["disable", 'shared','sparse', 'krbd', 'pveceph'].includes(key)) {
            _this[key] = _this.param[key] === 1 ? true : false;
          } else if (key === "nodes" || key === "content") {
            _this[key] = _this.param[key].split(",");
          } else {
            _this[key] = _this.param[key];
          }
				});
					this.disable = this.param.disable ? false : true
      };
			_this.queryZfs();
    },
    //单个校验
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      //校验是否为空
      if (/^\s*$/.test(value) && prop !== 'blocksize') {
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
			if(prop === 'blocksize' && !/^[\d][k|m|t|p|g]$/.test(value)) {
				 this.rules[prop].error = true;
        this.rules[prop].message = "块大小格式不对";
        return;
			}
    },
    //选择内容
    handleContentSelect(value) {
      this.content = value;
    },
    handleSelectionChange(row) {
			this.nodes = row.map(item => item.node);
		},
    //整体校验
    validateAll() {
			let props = ["storage", "blocksize", "content", "pool"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
		},
		handleZfsPoolSelect(value){
      this.pool = value;
		}
  },
};
</script>
