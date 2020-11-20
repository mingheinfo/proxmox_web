<template>
  <m-dialog
    :visible="visible"
    @cancel="close"
    @confirm="confirm"
    title="恢复： VM"
    :_style="{ width: '956px' }"
    @close="$emit('close')"
  >
    <div slot="content" style="max-height: 500px">
      <m-dialog
        :visible="showLog"
        @close="closeLog"
        :_style="{
          width: '800px',
        }"
        title="Task Viewer: 恢复"
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
        </template>
        <template slot="footer">
          <span></span>
        </template>
      </m-dialog>
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>基本信息</dt>
            <dd>
              <m-input
                type="text"
                label="源"
                labelWidth="100px"
                v-model="source"
                :disabled="true"
              />
              <m-select
                prop="storage"
                label="存储"
                labelWidth="100px"
                @on-change="handleStorageSelect"
                v-model="storage"
                validateEvent
                @validate="validate"
                :error-msg="rules['storage'].message"
                :show-error="rules['storage'].error"
                :readonly="false"
                placeholder="请选择磁盘"
              >
                <div class="table">
                  <template v-for="(item, index) in db.storageList">
                    <m-option
                      :key="item.storage"
                      :label="item.storage"
                      :value="item.storage"
                    >
                      <div v-if="index === 0" class="table-header">
                        <div class="table-td">名称</div>
                        <div class="table-td">类别</div>
                        <div class="table-td">可用</div>
                        <div class="table-td">容量</div>
                      </div>
                      <div class="table-row">
                        <div class="table-td">{{ item.storage }}</div>
                        <div class="table-td">{{ item.type }}</div>
                        <div class="table-td">{{ byteToSize(item.avail) }}</div>
                        <div class="table-td">{{ byteToSize(item.total) }}</div>
                      </div>
                    </m-option>
                  </template>
                </div>
              </m-select>
              <m-input
                type="number"
                label="VM ID"
                prop="vmid"
                v-model="vmid"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :error-msg="rules['vmid'].message"
                :show-error="rules['vmid'].error"
                :placeholder="'请输入VM ID'"
              />
              <div class="upload-file">
                <m-input
                  type="number"
                  prop="bwlimit"
                  label="Read Limit"
                  labelWidth="100px"
                  v-model="bwlimit"
                  validateEvent
                  @validate="validate"
                  :error-msg="rules['bwlimit'].message"
                  :show-error="rules['bwlimit'].error"
                  :placeholder="'默认为目标存储恢复限制'"
                />
                <div class="upload-btn">MiB/s</div>
              </div>
              <m-checkbox
                label="唯一"
                v-model="unique"
                labelWidth="100px"
              ></m-checkbox>
              <m-checkbox
                label="start after restore"
                v-model="start"
                labelWidth="100px"
              ></m-checkbox>
              <m-checkbox
                label="Unprivileged container"
                v-model="unprivileged"
                v-if="vmtype === 'lxc'"
                labelWidth="100px"
              ></m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <template slot="footer">
      <m-button class="create-btn" type="primary" @on-click="confirm()"
        >恢复</m-button
      >
    </template>
  </m-dialog>
</template>

<script>
import StorageContentHttp from "@src/views/home/storage/content/http";
import {
  render_storage_content,
  byteToSize,
	format_task_description,
	dateFormat
} from "@libs/utils/index";
import { gettext } from "@src/i18n/local_zhCN.js";
export default {
  name: "CreateVolumeModal",
  mixins: [StorageContentHttp],
  props: {
    visible: {
      type: Boolean,
      default: false,
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
  },
  data() {
    return {
      storage: "",
      bwlimit: "",
      vmid: "",
      source: "",
      unique: false,
      start: false,
      vmtype: "",
      nextid: "",
      interVal: null,
      showLog: false,
      tab: "log",
      unprivileged: false,
      volid: "",
      rules: {
        bwlimit: {
          error: false,
          message: "",
        },
        storage: {
          error: false,
          message: "",
        },
        vmid: {
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
		dateFormat,
    byteToSize,
    // //请求磁盘
    async __init__() {
      let _this = this;
      _this.volid = _this.param.volid;
      _this.vmtype = _this.param.volid.indexOf("qemu") ? "qemu" : "lxc";
      _this.source = render_storage_content(null, null, _this.param);
      _this.queryNextVmId({ _dc: new Date().getTime() }).then(() => {
        _this.vmid = _this.nextid;
      });
      _this.queryStorage({ format: 1, content: "images" });
    },
    //选择磁盘
    handleStorageSelect(value) {
      this.storage = value;
    },
    //关闭弹框
    close() {
      this.$emit("close");
    },
    //校验表单
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "不能为空";
        return;
      }
      if (prop === "vmid") {
        if (value < this.nextid) {
          this.rules[prop].error = true;
          this.rules[prop].message = `id不能小于${this.nextid}`;
          return;
        }
      }
    },
    //整体校验表单
    validateAll() {
      let props = ["vmid"];
      if (this.vmtype === "qemu") props.push("storage");
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    //确定添加
    confirm() {
      let _this = this,
        params = {
          vmid: _this.vmid,
          force: _this.vmid ? 1 : 0,
        };
      debugger;
      if (_this.validateAll()) return;
      if (_this.unique) {
        params.unique = 1;
      }
      if (_this.start) {
        params.start = 1;
      }
      if (_this.storage) {
        params.storage = _this.storage;
      }

      if (_this.bwlimit !== undefined) {
        params.bwlimit = this.bwlimit;
      }

      let url;
      let msg;
      if (_this.vmtype === "lxc") {
        url = "json/nodes/" + this.node + "/lxc";
        params.ostemplate = me.volid;
        params.restore = 1;
        if (_this.unprivileged) {
          params.unprivileged = 1;
        }
        msg = format_task_description("vzrestore", params.vmid);
      } else if (_this.vmtype === "qemu") {
        url = "json/nodes/" + _this.node + "/qemu";
        params.archive = _this.volid;
        msg = format_task_description("qmrestore", params.vmid);
      } else {
        throw "unknown VM type";
      }

      if (_this.vmid) {
        msg += ". " + gettext("This will permanently erase current VM data.");
        this.$confirm.confirm({ msg }).then((res) => {
          this.doRestore(url, params)
            .then((res) => {
              this.showLog = true;
              this.interVal = setInterval(() => {
                this.queryLog(
                  this.db.addClusterStatusObj.node,
                  this.db.addClusterStatusObj.upid
                );
                this.queryStatus(
                  this.db.addClusterStatusObj.node,
                  this.db.addClusterStatusObj.upid
                );
              }, 3000);
            })
            .catch((res) => {
              this.$confirm.info({
                msg: res,
              });
            });
        });
      } else {
        this.doRestore(url, params)
          .then((res) => {
            this.showLog = true;
            this.interVal = setInterval(() => {
              this.queryLog(
                this.db.addClusterStatusObj.node,
                this.db.addClusterStatusObj.upid
              );
              this.queryStatus(
                this.db.addClusterStatusObj.node,
                this.db.addClusterStatusObj.upid
              );
            }, 3000);
          })
          .catch((res) => {
            this.$confirm.info({
              msg: res,
            });
          });
      }
    },
    //切换tab
    handleTabChange(value) {
      this.tab = value;
    },
    stopTask1() {
      this.stopTask(
        this.db.addClusterStatusObj.node,
        this.db.addClusterStatusObj.upid
      );
    },
    closeLog() {
      this.$emit("close");
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
.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}
.upload-file {
  display: inline-flex;
}
.file-input {
  width: 100%;
  height: 100%;
  opacity: 0;
  position: absolute;
  left: 0px;
  top: 0px;
}
.upload-btn {
  position: relative;
  margin-left: -10px;
  border-left: none;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  height: 29px;
  line-height: 29px;
}
</style>