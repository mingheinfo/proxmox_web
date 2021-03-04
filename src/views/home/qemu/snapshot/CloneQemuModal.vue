<template>
  <m-dialog   :visible="visible"
              title="克隆虚拟机"
              @close="close"
              @confirm="confirm">
    <div slot="content">
      <dl>
        <dt></dt>
        <dd>
          <m-select
              prop="nodename"
              label="目标节点"
              labelWidth="100px"
              validateEvent
              @validate="validate"
              :show-error="rules.nodename.error"
              :error-msg="rules.nodename.message"
              required
              @on-change="
                  (value) => {
                    nodename = value;
                    queryTargetStorage();
                  }
                "
              v-model="nodename"
              placeholder="请选择节点"
          >
            <m-option
                v-for="(item, index) in nodeList"
                :key="item.node"
                :label="item.node"
                :value="item.node"
            >
              <div v-if="index === 0" class="table-tr">
                <div class="table-td">节点</div>
                <div class="table-td">内存使用率</div>
                <div class="table-td">CPU使用率</div>
              </div>
              <div class="table-tr">
                    <span class="table-td" :title="item.node">{{
                      item.node
                    }}</span>
                <span
                    class="table-td"
                    :title="percentToFixed(item.mem / item.maxmem, 3)"
                >{{ percentToFixed(item.mem / item.maxmem, 3) }}</span
                >
                <span
                    class="table-td"
                    :title="`${percentToFixed(item.cpu, 3)} of ${
                        item.maxcpu
                      }`"
                >{{
                        `${percentToFixed(item.cpu, 3)} of ${item.maxcpu}`
                      }}</span
                >
              </div>
            </m-option>
          </m-select>

          <m-select
              prop="clonemode"
              label="克隆模式"
              labelWidth="100px"
              :readonly="true"
              @on-change="
                  (value) => {
                    clonemode = value;
                    storage = '';
                  }
                "
              v-model="clonemode"
              placeholder="请选择克隆模式"
          >
            <m-option
                v-for="item in modeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
            </m-option>
          </m-select>

          <m-input  prop="snapshotname"
                    label="快照"
                    labelWidth="100px"
                    :readonly="true"
                    v-model="snapshotname"
                    disabled
                    placeholder="请输入快照名称"></m-input>

          <m-input
              label="VM ID"
              labelWidth="100px"
              prop="vmid"
              v-model="vmid"
              validateEvent
              @validate="validate"
              :show-error="rules['vmid'].error"
              :error-msg="rules['vmid'].message"
          />

          <m-select
              prop="storage"
              label="目标存储"
              labelWidth="100px"
              :readonly="true"
              @on-change="handleTargetStorageSel"
              v-model="storage"
              placeholder="与来源相同"
              :disabled="clonemode && clonemode === 'clone' && !isTemplate"
          >
            <m-option
                v-for="(item, index) in storageList"
                :key="index"
                :label="item.storage"
                :value="item.storage"
            >
              <div v-if="index === 0" class="table-tr">
                <div class="table-td">名称</div>
                <div class="table-td">类别</div>
                <div class="table-td">可用</div>
                <div class="table-td">容量</div>
              </div>
              <div class="table-tr">
                    <span class="table-td" :title="item.storage">{{
                      item.storage
                    }}</span>
                <span class="table-td" :title="item.type">{{
                      item.type
                    }}</span>
                <span class="table-td" :title="byteToSize(item.avail)">{{
                      byteToSize(item.avail)
                    }}</span>
                <span class="table-td" :title="byteToSize(item.total)">{{
                      byteToSize(item.total)
                    }}</span>
              </div>
            </m-option>
          </m-select>

          <m-input
              label="名称"
              labelWidth="100px"
              prop="name"
              v-model="name"
          />

          <m-select
              prop="pool"
              label="资源池"
              labelWidth="100px"
              :readonly="true"
              @on-change="(value) => (pool = value)"
              v-model="pool"
              placeholder="请选择资源池"
          >
            <m-option
                v-for="(item, index) in poolList"
                :key="item.poolid"
                :label="item.poolid"
                :value="item.poolid"
            >
              <div v-if="index === 0" class="table-tr">
                <div class="table-td">资源池</div>
                <div class="table-td">备注</div>
              </div>
              <div class="table-tr">
                    <span class="table-td" :title="item.poolid">{{
                      item.poolid
                    }}</span>
                <span class="table-td" :title="item.comment">{{
                      item.comment
                    }}</span>
              </div>
            </m-option>
          </m-select>

          <m-select
              prop="format"
              label="格式"
              labelWidth="100px"
              @on-change="(value) => (format = value)"
              v-model="format"
              :readonly="false"
              :disabled="!storageType || storageType !== 'dir'"
              placeholder="请选格式"
          >
            <m-option
                v-for="(item, index) in formatList"
                :key="index"
                :value="item.value"
                :label="item.label"
            >
            </m-option>
          </m-select>

        </dd>
      </dl>
      <m-dialog
          :visible="showLog"
          @close="closeLog"
          v-if="showLog"
          :_style="{
          width: '800px',
        }"
          :title="extraTitle"
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
          <el-scrollbar style="height: 100%" id="taskModal">
            <div class="taskmodal-content" ref="taskmodal-content">
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
                      {{
                      dateFormat(new Date(item * 1000), "yyyy-MM-dd hh:mm")
                      }}
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
      </m-dialog>
    </div>
    <div slot="footer">
      <m-button
          type="primary"
          class="create-btn"
          @on-click="confirm"
      >克隆</m-button>
    </div>
  </m-dialog>
</template>

<script>
  import {
    byteToSize,
    percentToFixed,
    stringFormat,
    browserLocalStorageGetItem,
    dateFormat,
    chunkData,
    debounce,
    quickSort
  } from "@libs/utils/index";
  import QemuOrLcxIndexHttp from "@src/views/home/qemu/http";
  import { gettext } from "@src/i18n/local_zhCN.js";
  export default {
    name: "CloneQemuModal",
    mixins: [QemuOrLcxIndexHttp],
    props: {
      visible: Boolean,
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        isTemplate: false,
        modeList: [{ value: "copy", label: gettext("Full Clone") }],
        clonemode: 'copy',
        snapshotList: [],
        snapshotname: '',
        storageList: [],
        name: '',
        storage: '',
        nodename: [],
        nodeList: [],
        storageType: "",
        format: "qcow2",
        vmid: "",
        pool: "",
        poolList: [],
        showLog: false,
        extraTitle: '',
        interval: null,
        tab: "log",
        formatList: [
          {
            label: "Raw磁盘映像（raw）",
            value: "raw",
          },
          {
            label: "VMware映像格式（vmdk）",
            value: "vmdk",
          },
          {
            label: "QEMU映像格式（qcow2）",
            value: "qcow2",
          },
        ],
        rules: {
          nodename: {
            error: false,
            message: "",
          },
          vmid: {
            error: false,
            message: "",
          },
          snapshotname: {
            error: false,
            message: "",
          },
          group: {
            error: false,
            message: "",
          },
          id: {
            error: false,
            message: "",
          },
        },
      }
    },
    mounted() {
      let last = window.localStorage.getItem("lastsel") || "[]";
      this.qemu = (JSON.parse(last) && JSON.parse(last)) || "";
      //初始化请求
      this.__init__();
    },
    methods: {
      percentToFixed,
      byteToSize,
      dateFormat,
      async __init__() {
        let _this = this;
        await this.queryNodeList();
        if (this.qemu.template || false) {
          _this.isTemplate = true;
        }
        if(JSON.stringify(_this.modeList).indexOf('clone') < 0)
          _this.modeList.push({
            value: "clone",
            label: gettext("Linked Clone"),
          });
        _this.$nextTick(() => {
          _this.clonemode = "clone";
        });
        this.queryNextVmid({ _dc: new Date().getTime() });
        this.queryPool();
        if (this.nodeList) {
          this.nodename = this.nodeList && this.nodeList.length > 0 && this.nodeList[0].node || '';
          this.queryTargetStorage();
        }
        if(this.param && this.param.snapshotname) {
          this.snapshotname = this.param.snapshotname;
        }
      },
      confirm() {
        let _this = this, params = { newid: _this.vmid };
        if (_this.snapshotname && _this.snapshotname !== "current") {
          params.snapname = _this.snapshotname;
        }
        if (_this.pool) {
          params.pool = _this.pool;
        }
        if (_this.name) {
          if (_this.qemu.type === "lxc") {
            params.hostname = _this.name;
          } else {
            params.name = _this.name;
          }
        }
        if (_this.nodename) {
          params.target = _this.nodename;
        }
        if (_this.clonemode === "copy") {
          params.full = 1;
          if (_this.storage) {
            params.storage = _this.storage;
            if (_this.format && _this.qemu.type !== "lxc") {
              params.format = _this.format;
            }
          }
        } else {
          params.full = 0;
        }
        _this
          .clone(params)
          .then((res) => {
            _this.extraTitle = "克隆进度";
            _this.showLog = true;
            this.updateTable({
              tableName: "addClusterLogList",
              list: [],
            });
            _this.interval = window.setInterval(() => {
              _this.queryStatus(_this.db.addClusterStatusObj.upid);
              _this.queryLog(
                _this.db.addClusterStatusObj.node,
                _this.db.addClusterStatusObj.upid
              )
            }, 3000);
          })
          .catch((res) => {
            _this.$confirm.confirm({
              msg: res,
              icon: "icon-question",
            });
          });
      },
      close() {
        this.$emit('close');
      },
      validate(prop) {
        let value = String(this[prop]).trim();
        this.rules[prop].message = "";
        this.rules[prop].error = false;
        if (/^\s*$/.test(value)) {
          this.rules[prop].message = "不能为空!";
          this.rules[prop].error = true;
          return;
        }
        if (prop === "nodename") {
          if (this.qemu.type === "qemu" && this.nodename !== this.qemu.node) {
            this.rules[prop].message = `${this.nodename}不允许此操作!`;
            this.rules[prop].error = true;
            return;
          }
        }
      },
      /***
       * 选择存储
       */
      handleTargetStorageSel(val) {
        this.storageType = this.storageList.filter(
          (it) => it.storage === val
        )[0].type;
        if (this.storageType === "dir") {
          this.format = "qcow2";
        } else {
          this.format = "raw";
        }
        this.storage = val;
      },
      /**
       *
       */
      async queryTargetStorage() {
        this.storageList = [];
        this.storage = "";
        let _this = this;
        this.queryStorageList(_this.qemu.node, {
          format: 1,
          content: "images",
          target: _this.nodename,
        }).then((res) => {
          _this.storageList = _this.storageList.filter((item) => {
            return (
              item.content.indexOf(
                _this.qemu.type === "qemu" ? "images" : "rootdir"
              ) > -1
            );
          });
        });
      },
      /**
       * 关闭任务窗口
       */
      closeLog() {
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
          /**
           * 防止异步操作出现的错误
           */
          this.showLog = false;
          this.$nextTick(() => {
            this.close();
          });
        } else {
          this.showLog = false;
          this.close();
        }
     },
      /**
       * 切换tab
       */
      handleTabChange(tab) {
        this.tab = tab;
      },
      /**
       * 取消运行中的任务
       */
      stopTask1() {
        this.stopTask(
          this.db.addClusterStatusObj.node,
          this.db.addClusterStatusObj.upid
        );
      },
    },
    updated() {
      let _this = this;
      if(_this.showLog) {
        this.$nextTick(() => {
          if(this.tab === 'log') {
            document.querySelector('#taskModal >.el-scrollbar__wrap').scrollTop = this.$refs['taskmodal-content'].scrollHeight;
          } else {
            document.querySelector('#taskModal >.el-scrollbar__wrap').scrollTop = 0;
          }
        })
      }
    },
    beforeDestroy() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },
  }
</script>

<style scoped>

</style>
