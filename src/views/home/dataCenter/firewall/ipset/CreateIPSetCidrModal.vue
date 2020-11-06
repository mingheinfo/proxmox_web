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
              <m-select
                prop="cidr"
                label="IP/CIDR"
                labelWidth="100px"
                validateEvent
                @on-change="handleCidrSelect"
                v-model="cidr"
								:readonly="false"
                @validate="validate('cidr')"
                :show-error="rules['cidr'].error"
                :error-msg="rules['cidr'].message"
                placeholder="请选择安全组"
              >
                <m-option
                  v-for="(item, index) in db.fireWallResfList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                >
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">名称</span>
                        <span class="table-td">备注</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td">{{ item.name }}</span>
                      <span class="table-td">{{ item.comment }}</span>
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-checkbox
                label="启用"
                v-model="nomatch"
                labelWidth="100px"
              ></m-checkbox>
              <m-input
                type="textarea"
                prop="comment"
                labelWidth="100px"
                label="备注"
                v-model="comment"
                placeholder="请输入备注"
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
import FireWallHttp from "@src/views/home/dataCenter/firewall/http";
export default {
  name: "CreateIPSetModal",
  mixins: [FireWallHttp],
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
		name: {
			type: String,
			default: ''
		}
  },
  data() {
    return {
			cidr: "",
			nomatch: false,
      comment: "",
      rules: {
        cidr: {
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
    async __init__() {
      if (this.isCreate) {
				Object.assign(this.$data, this.$options.data());
				this.queryRefsList({type: 'alias'})
      } else {
        Object.assign(this.$data, this.$options.data());
        Object.keys(this.param).forEach((it) => {
					if(it === 'sid') this.vmid = this.param[it];
          else this[it] = this.param[it];
        });
      }
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
			if(prop==="cidr" && !/^[a-zA-Z][a-zA-Z0-9_-]{2,253}$/.test(value)){
				this.rules[prop].error = true;
        this.rules[prop].message = "名称以字母开头，内含字母数字下划线至少2位字符";
        return;
			}
		},
		handleCidrSelect(value) {
			this.cidr = value;
		},
    validateAll() {
      let props = ["cidr"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    confirm() {
      if (this.validateAll()) return;
      let param = {
				cidr: this.cidr,
				nomatch: this.nomatch ? 1 : 0,
        comment: this.comment,
      };
      if (this.isCreate) {
        this.createIPSetCidr(this.name, param)
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
				param['digest'] = this.param.digest;
        this.updateIPSetCidr(this.name, param)
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
    },
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