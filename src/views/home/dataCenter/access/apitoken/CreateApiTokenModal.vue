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
                prop="userid"
                label="用户"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.userid.error"
                :error-msg="rules.userid.message"
                :readonly="false"
                @on-change="handleUseridSelect"
                v-model="userid"
                placeholder="请选择用户"
              >
                <m-option
                  v-for="(item, index) in db.usersList"
                  :key="item.userid"
                  :label="item.userid"
                  :value="item.userid"
                >
                  <div v-if="index === 0" class="table-header__tr">
                    <span class="table-td">用户</span>
                    <span class="table-td">名称</span>
                    <span class="table-td">备注</span>
                  </div>
                  <div class="table-tr">
                    <span class="table-td">{{ item.userid }}</span>
                    <span class="table-td">{{
                      `${item.firstname ? item.firstname : ""} ${
                        item.lastname ? item.lastname : ""
                      }`
                    }}</span>
                    <span class="table-td">{{ item.comment }}</span>
                  </div>
                </m-option>
              </m-select>
              <m-checkbox
                label="Privilege Separation"
                v-model="privsep"
                labelWidth="100px"
              ></m-checkbox>
              <m-input
                type="text"
                prop="tokenid"
                labelWidth="100px"
                label="Token ID"
                v-model="tokenid"
                validateEvent
                @validate="validate"
                :show-error="rules.tokenid.error"
                :error-msg="rules.tokenid.message"
                :disabled="modalType !== 'create'"
                placeholder="请输入Token ID"
              />
              <m-input prop="expire" labelWidth="100px" label="选择日期">
                <template slot="other">
                  <el-date-picker
                    v-model="expire"
                    type="date"
                    placeholder="永久有效"
                  >
                  </el-date-picker>
                </template>
              </m-input>
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
import { flotToFixed, percentToFixed, byteToSize } from "@libs/utils/index";
export default {
  name: "CreateAccessModal",
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
      userid: "",
      expire: "",
      comment: "",
      privsep: false,
      tokenid: "",
      rules: {
        userid: {
          error: false,
          message: "",
        },
        tokenid: {
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
    percentToFixed,
    byteToSize,
    async __init__() {
      if (this.modalType === "create")
        await this.queryUsersList({ enabled: 1 }).then(() => {
          this.userid = this.db.usersList[0].userid;
				});
			else {
				 Object.assign(this.$data, this.$options.data());
				 this.userid = this.param.userid;
				 this.tokenid = this.param.tokenid;
				 this.comment = this.param.comment &&  this.param.comment;
				 this.privsep = this.param.privsep ? this.param.privsep === 1 ? true : false : false
			}
    },
    handleUseridSelect(value) {
      this.userid = value;
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
      let props = ["userid", "tokenid"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    confirm() {
      if (this.validateAll()) return;
      let param = {
        userid: this.userid,
        expire: this.expire ? new Date(this.expire).getTime() / 1000 : 0,
        comment: this.comment,
        tokenid: this.tokenid,
			};
			if (this.privsep) param["privsep"] = 1;
      if (this.modalType === "create") {
        this.createTokenApi(param)
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
				this.updateTokenApi(param)
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