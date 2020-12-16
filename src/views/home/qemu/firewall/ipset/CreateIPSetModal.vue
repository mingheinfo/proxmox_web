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
                prop="name"
                labelWidth="100px"
                label="名称"
                v-model="name"
                validateEvent
                @validate="validate"
                :show-error="rules.name.error"
                :error-msg="rules.name.message"
                placeholder="请输入名称"
              />
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
import QemuIpSetHttp from "@src/views/home/qemu/firewall/ipset/http";
export default {
  name: "CreateIPSetModal",
  mixins: [QemuIpSetHttp],
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
		}
  },
  data() {
    return {
      name: "",
      comment: "",
      rules: {
        name: {
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
       
      } else {
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
			if(prop==="name" && !/^[a-zA-Z][a-zA-Z0-9_-]{2,253}$/.test(value)){
				this.rules[prop].error = true;
        this.rules[prop].message = "名称以字母开头，内含字母数字下划线至少2位字符";
        return;
			}
    },
    validateAll() {
      let props = ["name"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    confirm() {
      if (this.validateAll()) return;
      let param = {
        name: this.name,
        comment: this.comment,
      };
      if (this.isCreate) {
        this.createIPSet(param)
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
				param['rename'] = this.param.name;
        this.updateIPSet(param)
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