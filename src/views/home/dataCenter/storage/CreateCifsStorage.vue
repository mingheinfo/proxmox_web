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
            required
            :show-error="rules.storage.error"
            :error-msg="rules.storage.message"
            v-model="storage"
            placeholder="请输入ID"
            :disabled="!isCreate"
          />
          <m-checkbox
            label="启用"
            v-model="disable"
            labelWidth="100px"
          ></m-checkbox>
          <m-input
            type="text"
            prop="server"
            label="服务器"
            labelWidth="100px"
            validateEvent
            @validate="validate"
            required
            :show-error="rules.server.error"
            :error-msg="rules.server.message"
            v-model="server"
            placeholder="请输入服务器"
            :disabled="!isCreate"
          />
          <m-input
            type="text"
            prop="username"
            label="访客用户"
            labelWidth="100px"
            :disabled="!isCreate"
            validateEvent
            @validate="validate"
            required
            :show-error="rules.username.error"
            :error-msg="rules.username.message"
            v-model="username"
            placeholder="请输入访客用户"
          />
          <m-input v-if="isCreate"
            type="password"
            prop="password"
            label="密码"
            labelWidth="100px"
            validateEvent
            @validate="validate"
            required
            :show-error="rules.password.error"
            :error-msg="rules.password.message"
            :disabled="!username || !isCreate"
            v-model="password"
            placeholder="请输入密码"
          />
          <m-input v-if="!isCreate"
                   type="password"
                   prop="password"
                   label="密码"
                   labelWidth="100px"
                   :disabled="!username || !isCreate"
                   value="******"
          />
          <m-select
            labelWidth="100px"
            @on-change="handleCifsSelect"
            validateEvent
            @validate="validate"
            prop="share"
            v-model="share"
            :readonly="false"
						 :disabled="!isCreate"
            required
            @visible-change="handleExportReq"
            :show-error="rules.share.error"
            :error-msg="rules.share.message"
            label="Share"
          >
            <m-option
              v-for="item in db.cifsList"
              :key="item.share"
              :label="item.share"
              :value="item.share"
            ></m-option>
          </m-select>
          <m-select
            type="multiple"
            labelWidth="100px"
            @on-change="handleSelect"
            validateEvent
            @validate="validate"
            prop="content"
            v-model="content"
            required
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
          <m-input
            type="text"
            prop="domain"
            label="域名"
            labelWidth="100px"
            validateEvent
            @validate="validate"
            required
            :show-error="rules.domain.error"
            :error-msg="rules.domain.message"
            min="0"
            v-model="domain"
            :disabled="!isCreate"
            placeholder="请输入域名"
          />
        </dd>
      </dl>
      <dl v-if="isAdvice">
        <dt>高级</dt>
        <dd>
          <m-select v-model="option"
                    :read-only="true"
                    @on-change="(value) => option = value"
                    label="版本">
            <m-option v-for="item in optionsItems"
                      :value="item.value"
                      :label="item.label"
                      :key="item.value"></m-option>
          </m-select>
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
            <el-table-column type="selection" width="55"> </el-table-column>
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
  name: "CreateCifsStorage",
  mixins: [DataCenterStorageHttp],
  props: {
    isCreate: {
      type: Boolean,
      default: true,
    },
    param: {
      type: Object,
    },
    isAdvice: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      storage: "",
      server: "",
      content: ["images"],
      nodes: [],
      username: "",
      password: "",
      share: "",
      domain: "",
      type: "dir",
      disable: false,
      maxfiles: 1,
      option: '2.0',
      optionsItems: [{
        label: '默认',
        value: '__default__'
      },
        {
          label: '2.0',
          value: '2.0'
        },
        {
          label: '2.1',
          value: '2.1'
        },
        {
          label: '3.0',
          value: '3.0'
        }
      ],
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
        server: {
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
        share: {
          error: false,
          message: "",
        },
        domain: {
          error: false,
          message: "",
        },
        username: {
          error: false,
          message: "",
        },
        password: {
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
      if (this.isCreate) {
        this.storage = "";
        this.server = "";
        this.content = ["images"];
        this.nodes = [];
        this.username = "";
        this.password = "";
        this.share = "";
        this.domain = "";
        this.type = "dir";
        this.disable = false;
        this.maxfiles = 1;
      } else {
        Object.keys(this.param).forEach((key) => {
          if (["disable"].includes(key)) {
            this[key] = this.param[key] === 0 ? true : false;
          } else if (key === "nodes" || key === "content") {
            this[key] = this.param[key].split(",");
          } else if(key === 'options'){
            this.options = this.param.options.replace(/(vers=)/, '');
          }  else {
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
      this.content = value;
    },
    handleSelectionChange(row) {
      this.nodes = row.map((item) => item.node);
    },
    //整体校验
    validateAll() {
      let props = ["storage", "server", "content", "maxfiles", "share"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    //查询导出数据
    handleExportReq() {
      this.validate("server");
      this.queryCifs("", this.server);
    },
    //选择share
    handleCifsSelect(value) {
      this.share = value;
    },
  },
  watch: {
    isAdvice: function(newVal, oldVal) {
      if(newVal !== oldVal) {
        return newVal;
      }
    }
  }
};
</script>
