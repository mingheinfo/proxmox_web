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
            labelWidth="100px"
          ></m-checkbox>
          <m-input
            type="text"
            prop="portal"
            label="门户"
            labelWidth="100px"
            validateEvent
						:disabled="!isCreate"
            @validate="validate"
            :show-error="rules.portal.error"
            :error-msg="rules.portal.message"
            v-model="portal"
            placeholder="请输入门户"
          />
          <m-select
            labelWidth="100px"
            @on-change="handleSelect"
            prop="iscsiprovider"
            label="iSCSI提供者"
						:disabled="!isCreate"
            validateEvent
            @validate="validate"
            :show-error="rules.iscsiprovider.error"
            :error-msg="rules.iscsiprovider.message"
            v-model="iscsiprovider"
            placeholder="请输入iSCSI提供者"
          >
            <m-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></m-option>
          </m-select>
          <m-input
            type="text"
            prop="pool"
            label="资源池"
						:disabled="!isCreate"
            labelWidth="100px"
            validateEvent
            @validate="validate"
            :show-error="rules.pool.error"
            :error-msg="rules.pool.message"
            v-model="pool"
            placeholder="请输入资源池"
          />
          <m-input
            type="text"
            prop="blocksize"
            label="块尺寸"
            labelWidth="100px"
						:disabled="!isCreate"
            validateEvent
            @validate="validate"
            :show-error="rules.blocksize.error"
            :error-msg="rules.blocksize.message"
            v-model="blocksize"
            placeholder="请输入块尺寸"
          />
          <m-input
            type="text"
            prop="target"
            label="目标"
            labelWidth="100px"
            validateEvent
						:disabled="!isCreate"
            @validate="validate"
            :show-error="rules.target.error"
            :error-msg="rules.target.message"
            v-model="target"
            placeholder="请输入目标"
          />
          <m-checkbox
            label="精简装置"
            v-model="sparse"
						:disabled="['LIO', 'IET'].includes(iscsiprovider)"
            labelWidth="100px"
          ></m-checkbox>
          <m-input
            type="text"
            prop="comstar_tg"
            label="目标群组"
            labelWidth="100px"
						:disabled="iscsiprovider !== 'Comstar' || !isCreate"
            v-model="comstar_tg"
            placeholder="请输入目标群组"
          />
          <m-checkbox
            label="写缓存"
            v-model="writecache"
            labelWidth="100px"
          ></m-checkbox>
          <m-input
            type="text"
            prop="comstar_hg"
            label="主机组"
            labelWidth="100px"
            validateEvent
						:disabled="iscsiprovider !== 'Comstar' || !isCreate"
            v-model="comstar_hg"
            placeholder="请输入主机组"
          />

          <m-input
            type="number"
            prop="lio_tpg"
            label="目标门户组"
            labelWidth="100px"
            validateEvent
            @validate="validate"
            :show-error="rules.lio_tpg.error"
            :error-msg="rules.lio_tpg.message"
            :disabled="iscsiprovider !== 'LIO' || !isCreate"
            v-model="lio_tpg"
            placeholder="请输入目标门户组"
          />
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
                  percentToFixed(scope.row.cpu, 3) + `% of ${scope.row.maxcpu}`
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
      portal: "",
      username: "",
      blocksize: "4k",
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
			writecache: false,
      options: [
        {
          label: "comstar",
          value: "comstar",
        },
        {
          label: "istgt",
          value: "istgt",
        },
        {
          label: "IET",
          value: "IET",
        },
        {
          label: "LIO",
          value: "LIO",
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
        portal: {
          error: false,
          message: "",
        },
        blocksize: {
          error: false,
          message: "",
        },
        target: {
          error: false,
          message: "",
        },
        lio_tpg: {
          error: false,
          message: "",
        },
        iscsiprovider: {
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
      if (!this.isCreate) {
				debugger;
        Object.keys(this.param).forEach((key) => {
          if (["disable", 'shared','sparse', 'krbd', 'pveceph'].includes(key)) {
            this[key] = this.param[key] === 0 ? true : false;
          } else if (key === "nodes" || key === "content") {
            this[key] = this.param[key].split(",");
          } else if(key === 'nowritecache'){
            this['writecache'] = this.param[key] === 0 ? true : false;
					} else {
            this[key] = this.param[key];
          }
				});
					this.disable = this.param.disable ? false : true
      }
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
      this.iscsiprovider = value;
    },
    handleSelectionChange(row) {
			this.nodes = row.map(item => item.node);
		},
    //整体校验
    validateAll() {
			let props = ["storage", "blocksize", "portal", "target", "pool"];
			if(this.iscsiprovider === 'LIO') {
				props.push('lio_tpg');
			}
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
  },
};
</script>