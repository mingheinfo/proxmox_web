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
                prop="poolid"
                labelWidth="100px"
                label="组"
                v-model="poolid"
                validateEvent
                @validate="validate"
                required
                :show-error="rules.poolid.error"
                :error-msg="rules.poolid.message"
                :disabled="modalType !== 'create'"
                placeholder="请输入组"
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
import DataCenterAccessHttp from "@src/views/home/dataCenter/access/http";
export default {
  name: "CreateAccessPoolModal",
  mixins: [DataCenterAccessHttp],
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
      poolid: "",
      comment: "",
      rules: {
        poolid: {
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
      if (this.modalType === "create")
        Object.assign(this.$data, this.$options.data());
			else {
				 Object.assign(this.$data, this.$options.data());
				 await this.queryPoolsObj({poolid: this.param.poolid})
				     .then(() => {
               	 this.poolid = this.param.poolid;
				         this.comment = this.db.poolsObj.comment &&  this.db.poolsObj.comment;
						 })
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
    },
    validateAll() {
      let props = ["poolid"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    confirm() {
      if (this.validateAll()) return;
      let param = {
        poolid: this.poolid,
        comment: this.comment,
			};
      if (this.modalType === "create") {
        this.createPool(param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm
              .info({
                msg: res,
                type: "error",
              })
              .then(() => {})
              .catch(() => {});
          });
      } else {
				this.updatePool(param)
				.then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm
              .info({
                msg: res,
                type: "error",
              })
              .then(() => {})
              .catch(() => {});
          });;
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
