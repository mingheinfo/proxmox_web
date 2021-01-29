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
      <div class="m-form__content" v-if="isCreate">
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
                required
                :show-error="rules['name'].error"
                :error-msg="rules['name'].message"
                v-if="modalType === 'create'"
                placeholder="请输入名称"
              />
              <m-input
                type="text"
                prop="domains"
                labelWidth="100px"
                label="名称"
                v-model="domains"
                validateEvent
                @validate="validate"
                required
                :show-error="rules.domains.error"
                :error-msg="rules.domains.message"
                v-if="modalType !== 'create'"
                placeholder="请输入名称"
              />
              <m-select
                prop="directory"
                label="ACME目录"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.directory.error"
                :error-msg="rules.directory.message"
                :readonly="false"
                required
                @on-change="handleDirectorySelect"
                v-model="directory"
                :disabled="!isCreate"
                placeholder="请选择ACME目录"
              >
                <m-option
                  v-for="(item, index) in db.directoriesList"
                  :key="item.url"
                  :label="item.name"
                  :value="item.url"
                >
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">名称</span>
                        <span class="table-td">url</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td" :title="item.name">{{ item.name }}</span>
                      <span class="table-td" :title="item.url">{{ item.url }}</span>
                    </div>
                  </div>
                </m-option>
              </m-select>
              <div class="service-police">
                <div class="service-police-label">服务条款</div>
                <div class="service-police-content">
                  {{ this.tos_url ? this.tos_url : "载入中" }}
                </div>
              </div>
              <m-checkbox
                label="接受Tos"
                v-model="tos_url__checked"
                labelWidth="100px"
              ></m-checkbox>

              <m-input
                type="text"
                prop="contact"
                labelWidth="100px"
                label="E-mail"
                v-model="contact"
                validateEvent
                @validate="validate"
                required
                :show-error="rules.contact.error"
                :error-msg="rules.contact.message"
                placeholder="请输入E-mail"
              />
            </dd>
          </dl>
        </div>
      </div>
      <div class="m-form__content" v-if="!isCreate">
        <div class="m-form__section">
          <div class="service-police">
            <div class="service-police-label">Eamil</div>
            <div class="service-police-content">
              {{ db.acmeAccountObj.account.contact && db.acmeAccountObj.account.contact.join(';') }}
            </div>
          </div>
          <div class="service-police">
            <div class="service-police-label">已创建</div>
            <div class="service-police-content">
              {{ db.acmeAccountObj.account.createdAt && db.acmeAccountObj.account.createdAt }}
            </div>
          </div>
          <div class="service-police">
            <div class="service-police-label">状态</div>
            <div class="service-police-content">
              {{ db.acmeAccountObj.account.status && db.acmeAccountObj.account.status }}
            </div>
          </div>
          <div class="service-police">
            <div class="service-police-label">目录</div>
            <div class="service-police-content">
              <a :href="db.acmeAccountObj.directory && db.acmeAccountObj.directory" target="_blank">{{ db.acmeAccountObj.directory&& db.acmeAccountObj.directory }}</a>
            </div>
          </div>
          <div class="service-police">
            <div class="service-police-label">服务条款</div>
            <div class="service-police-content">
              <a :href="db.acmeAccountObj.tos && db.acmeAccountObj.tos"  target="_blank">{{  db.acmeAccountObj.tos && db.acmeAccountObj.tos }}</a>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        :visible="showLog"
        @close="closeLog"
        :_style="{
          width: '800px',
        }"
        title="Task Viewer: 任务进度"
      >
        <template slot="content">
          <m-tab v-model="tab" @tab-click="handleTabChange">
            <m-tab-panel label="输出" name="log"></m-tab-panel>
            <m-tab-panel label="状态" name="status"></m-tab-panel>
          </m-tab>
          <m-button
            class="create-btn m-margin-top-10"
            type="primary"
            @on-click="stopTask1"
            :disabled="db.addClusterStatusObj.status !== 'running'"
            >停止</m-button
          >
         <el-scrollbar style="height:100%">
            <div class="taskmodal-content">
              <div class="table" v-if="tab === 'log'">
              <div
                class="table-tr"
                v-for="item in db.addClusterLogList"
                :key="item.n"
              >
                {{ item.t }}
              </div>
            </div>
            <div class="table" v-if="tab === 'status'">
              <template v-for="(item, key) in db.addClusterStatusObj">
                <div
                  class="table-tr"
                  v-if="!['exitstatus', 'id', 'pstart'].includes(key)"
                  :key="key"
                >
                  <div class="table-td">{{ $t(`clusterStatus.${key}`) }}</div>
                  <div class="table-td" v-if="key === 'starttime'">
                    {{ dateFormat(new Date(item * 1000), "yyyy-MM-dd hh:mm") }}
                  </div>
                  <div class="table-td" v-else>{{ item }}</div>
                </div>
              </template>
            </div>
            </div>
         </el-scrollbar>
        </template>
        <template slot="footer">
          <span></span>
        </template>
      </Dialog>
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
      name: "",
      directory: "",
      tos_url: "",
      contact: "",
      state: "started",
      tos_url__checked: false,
      showLog: false,
      interVal: null,
      tab: "log",
      domains: "",
      rules: {
        name: {
          error: false,
          message: "",
        },
        contact: {
          error: false,
          message: "",
        },
        tos_url: {
          error: false,
          message: "",
        },
        directory: {
          error: false,
          message: "",
        },
        domains: {
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
        this.queryAcmeDirection().then(() => {
          this.directory = this.db.directoriesList[0].url;
          this.validate("directory");
          this.queryAcmeTos(this.db.directoriesList[0].url);
        });
      } else {
        Object.assign(this.$data, this.$options.data());
        this.queryAcmeAccountById(this.param.name)
      }
    },
    handleDirectorySelect(value) {
      this.directory = value;
      this.queryAcmeTos(this.directory);
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
      if (value && prop === "contact") {
        if (!/^\w+@[a-zA-Z0-9]{2,10}(?:\.[a-z]{2,4}){1,3}$/.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "邮箱格式不正确";
          return;
        }
      }
    },
    validateAll() {
      debugger;
      let props = ["name", "contact"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    handleTabChange(value) {
      this.tab = value;
    },
    confirm() {
      if (this.validateAll()) return;
      let param = {
        name: this.name,
        contact: this.contact,
        directory: this.directory,
        tos_url: this.tos_url,
      };
      if (this.isCreate) {
        this.createAcmeAccount(param)
          .then((res) => {
            this.showLog = true;
            this.interVal = setInterval(
              () => {
                this.queryLog( this.db.addClusterStatusObj.node,
                  this.db.addClusterStatusObj.upid)
                this.queryStatus(
                  this.db.addClusterStatusObj.node,
                  this.db.addClusterStatusObj.upid
                )
              },
              3000
            );
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
    stopTask1() {
      this.stopTask(
        this.db.addClusterStatusObj.node,
        this.db.addClusterStatusObj.upid
      );
    },
    closeLog() {
      this.showLog = false;
      this.close();
    },
  },
  beforeDestroy() {
    if (this.interVal) {
      clearInterval(this.interVal);
      this.interVal = null;
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
