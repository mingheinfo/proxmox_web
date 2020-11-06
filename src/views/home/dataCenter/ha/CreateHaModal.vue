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
                prop="vmid"
                label="VM"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.vmid.error"
                :error-msg="rules.vmid.message"
                :readonly="false"
                @on-change="handleVmidSelect"
                v-model="vmid"
								:disabled="!isCreate"
                placeholder="请选择VM"
              >
                <m-option
                  v-for="(item, index) in vmList"
                  :key="item.vmid"
                  :label="item.vmid"
                  :value="item.vmid"
                >
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">id</span>
                        <span class="table-td">名称</span>
                        <span class="table-td">节点</span>
                        <span class="table-td">状态</span>
                        <span class="table-td">类别</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td">{{ item.vmid }}</span>
                      <span class="table-td">{{ item.name }}</span>
                      <span class="table-td">
                        {{ item.node }}
                      </span>
                      <span class="table-td">
                        <table-info-state
                          :content="item.status"
                          :state="
                            item.status === 'stopped'
                              ? 'unActived'
                              : item.status === 'unknown'
                              ? 'unknown'
                              : 'actived'
                          "
                        ></table-info-state>
                      </span>
                      <span class="table-td"> 虚拟机 </span>
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-select
                prop="group"
                label="组"
                labelWidth="100px"
                @on-change="handleGroupSelect"
                v-model="group"
                :readonly="false"
                placeholder="请选择组"
              >
                <m-option
                  v-for="(item, index) in db.groupsList"
                  :key="item.groupid"
                  :label="item.groupid"
                  :value="item.groupid"
                >
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">组</span>
                        <span class="table-td">备注</span>
                        <span class="table-td">用户</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td">{{ item.group }}</span>
                      <span class="table-td">{{ item.comment }}</span>
                      <span class="table-td">
                        {{ item.users }}
                      </span>
                    </div>
                  </div>
                </m-option>
              </m-select>

              <m-input
                type="number"
                prop="max_restart"
                labelWidth="100px"
                label="最大重启"
                v-model="max_restart"
                validateEvent
                @validate="validate"
                :show-error="rules.max_restart.error"
                :error-msg="rules.max_restart.message"
                placeholder="请输入最大重启"
              />
              <m-select
                prop="state"
                label="请求状态"
                labelWidth="100px"
                @on-change="handleStateSelect"
                v-model="state"
                :readonly="false"
                placeholder="请选择组"
              >
                <m-option
                  v-for="item in stateOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </m-option>
              </m-select>

              <m-input
                type="number"
                prop="max_relocate"
                labelWidth="100px"
                label="最大重定位"
                v-model="max_relocate"
                validateEvent
                @validate="validate"
                :show-error="rules.max_relocate.error"
                :error-msg="rules.max_relocate.message"
                placeholder="请输入最大重定位"
              />
              <m-input
                type="textarea"
                prop="comment"
                labelWidth="100px"
                label="备注"
                v-model="comment"
                placeholder="请输入备注"
              />
              <div
                class="m-alert-info"
                style="margin-bottom: 5px"
                v-show="state === 'disabled'"
              >
                Disabling the resource will stop the guest system. See the
                online help for details.
              </div>
              <div class="m-alert-info">
                At least three quorum votes are recommended for reliable HA
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import HaHttp from "@src/views/home/dataCenter/ha/http";
import { flotToFixed, percentToFixed, byteToSize } from "@libs/utils/index";
export default {
  name: "CreateAccessModal",
  mixins: [HaHttp],
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
      vmid: "",
      group: "",
      max_relocate: 1,
      max_restart: 1,
      state: "started",
      comment: "",
      vmList: [],
      stateOptions: [
        { label: "started", value: "started" },
        { label: "stopped", value: "stopped" },
        { label: "ignored", value: "ignored" },
        { label: "disabled", value: "disabled" },
      ],
      rules: {
        vmid: {
          error: false,
          message: "",
        },
        max_relocate: {
          error: false,
          message: "",
        },
        max_restart: {
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
    async __init__() {
      if (this.isCreate) {
        Object.assign(this.$data, this.$options.data());
        await this.queryResource()
                  .then(() => {
                    this.vmList = this.db.resources.filter(it => it.type === 'qemu')
                  });
        await this.queryGroups();
      } else {
        Object.assign(this.$data, this.$options.data());
        Object.keys(this.param).forEach((it) => {
					if(it === 'sid') this.vmid = this.param[it];
          else this[it] = this.param[it];
        });
      }
    },
    handleVmidSelect(value) {
      this.vmid = value;
    },
    handleGroupSelect(value) {
      this.group = value;
    },
    handleStateSelect(value) {
      this.state = value;
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
      let props = ["vmid", "max_restart", "max_relocate"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    confirm() {
      if (this.validateAll()) return;
      let param = {
        max_restart: this.max_restart,
        max_relocate: this.max_relocate,
        state: this.state,
        comment: this.comment,
        sid: this.vmid,
      };
      if (this.isCreate) {
        this.createHa(param)
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
        this.updateHa(param)
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