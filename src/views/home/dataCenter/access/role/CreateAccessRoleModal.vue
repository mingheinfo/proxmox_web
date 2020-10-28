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
                prop="roleid"
                labelWidth="100px"
                label="名称"
                v-model="roleid"
                validateEvent
                @validate="validate"
                :show-error="rules.roleid.error"
                :error-msg="rules.roleid.message"
                :disabled="modalType !== 'create'"
                placeholder="请输入组"
              />
              <m-select
                prop="privs"
                label="特权"
                labelWidth="100px"
								type="multiple"
                :readonly="false"
                @on-change="handlePrivsSelect"
                v-model="privs"
                placeholder="请选择路径"
              >
                <m-option
                  v-for="item in Object.keys(db.roleObj)"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </m-option>
              </m-select>
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
  name: "CreateAccessRoleModal",
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
      roleid: "",
      privs: [],
      rules: {
        roleid: {
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
      if (this.modalType === "create"){
				 Object.assign(this.$data, this.$options.data());
				 this.queryRoleObjById({roleid: 'Administrator'});
			} else {
				 Object.assign(this.$data, this.$options.data());
				 await this.queryRoleObjById({roleid: this.param.roleid})
				     .then(() => {
               	 this.roleid = this.param.roleid;
				         this.privs = this.db.groupsObj &&  Object.keys(this.db.groupsObj);
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
		handlePrivsSelect(value) {
			this.privs = value;
		},
    validateAll() {
      let props = ["roleid"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    confirm() {
			console.log(this.validateAll());
      if (this.validateAll()) return;
      let param = {
        roleid: this.roleid,
        privs: this.privs.join(','),
			};
      if (this.modalType === "create") {
        this.createRole(param)
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
				this.updateRole(param)
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