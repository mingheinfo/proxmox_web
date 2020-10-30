<template>
  <Dialog
    :visible="visible"
    @cancel="close"
    @confirm="confirm"
    :title="title"
    :_style="{ width: '956px' }"
    @close="$emit('close')"
  >
    <div slot="content" style="max-height: 500px">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>基本信息</dt>
            <dd>
              <m-input
                type="text"
                prop="plugin"
                labelWidth="100px"
                label="Plugin ID"
                v-model="plugin"
                validateEvent
                @validate="validate"
                :show-error="rules.plugin.error"
                :error-msg="rules.plugin.message"
								:disabled="!isCreate"
                placeholder="请输入名称"
              />
          
               <m-input
                type="number"
                prop="validationDelay"
                labelWidth="100px"
                label="Validation Delay"
                v-model="validationDelay"
                validateEvent
                @validate="validate"
                :show-error="rules.validationDelay.error"
                :error-msg="rules.validationDelay.message"
                placeholder="请输入Validation Delay"
              />
                  <m-select
                prop="api"
                label="DNS API"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.api.error"
                :error-msg="rules.api.message"
                :readonly="false"
                @on-change="handleDnsApiSelect"
                v-model="api"
                placeholder="请选择DNS API目录"
              >
                <m-option
                  v-for="item in db.dnsApiList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                </m-option>
              </m-select>
              <m-input
                type="textarea"
                prop="data"
                labelWidth="100px"
                label="API Data"
                v-model="data"
                placeholder="请输入API Data"
              />
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import AcmeHttp from "@src/views/home/dataCenter/acme/http";
import { flotToFixed, percentToFixed, dateFormat } from "@libs/utils/index";
export default {
  name: "CreateAccessModal",
  mixins: [AcmeHttp],
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
    },
    isCreate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      plugin: "",
      validationDelay: 30,
      api: "",
      data: "",
      state: "started",
      tos_url__checked: false,
      showLog: false,
      interVal: null,
      tab: "log",
      rules: {
        plugin: {
          error: false,
          message: "",
        },
        validationDelay: {
          error: false,
          message: "",
        },
        api: {
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
    dateFormat,
    async __init__() {
      if (this.isCreate) {
        Object.assign(this.$data, this.$options.data());
        this.queryDNSApiList()
      } else {
				Object.assign(this.$data, this.$options.data());
				this.queryDNSApiList();
				this.queryAcmePluginById(this.param.plugin)
				    .then(() => {
						  Object.keys(this.db.acmePluginObj).forEach(it => {
								this[it] = this.db.acmePluginObj[it];
							})
							this.validate('api');
						})
      }
    },
    handleDnsApiSelect(value) {
      this.api = value;
    },
    close() {
      this.$emit("close");
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
      let props = ["plugin", "api"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    handleTabChange(value) {
      this.tab = value;
    },
    confirm() {
      if (this.validateAll()) return;
      let param = {
        api: this.api,
				data: this.data,
				id: this.plugin,
				type: 'dns',
      };
      if (this.isCreate) {
        this.createPlugin(param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm
              .info({
                msg: res,
              })
              .then(() => this.close());
          });
      } else {
				param['digist'] = this.db.acmePluginObj.digist;
				let id = param.id;
				delete param.id;
				delete param.type;
        this.updateDnsApiPlugin(id, param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm
              .info({
                msg: res,
              })
              .then(() => this.close());
          });
      }
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

<style lang="less" scoped>
.service-police {
  width: 100%;
  padding: 0px 20px 20px 0px;
  &-label {
    width: 100px;
    display: inline-block;
  }
  &-content {
    display: inline-block;
  }
}
</style>