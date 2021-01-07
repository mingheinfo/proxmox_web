<template>
  <transition name="transition">
    <div class="content">
      <div class="m-operate">
        <div class="m-operate-left">{{qemu.type === 'qemu' ? '虚拟机' : "容器"}}{{qemu.vmid}}({{qemu.name}})</div>
        <div class="m-operate-right">
          <m-button
              v-if="qemu.type === 'qemu' && !isTempalte"
              icon="fa fa-play"
              v-confirm="{msg: `启动虚拟机\'${qemu.name}\'？`,
                ok: () => handleReset()
            }"
              :disabled="inStatus('running')"
          >{{ inStatus('running') ? '启动' : '再继续'}}
          </m-button>
          <!--当为lxc容器时，在stopped状态下才可以启动-->
          <m-button
              v-if="qemu.type === 'lxc' && !isTempalte"
              icon="fa fa-play"
              v-confirm="{msg: `启动lxc容器\'${qemu.name}\'？`,
                ok: () => handleReset()
            }"
              :disabled="!inLxcStatus('stopped')"
          >启动
          </m-button>
          <dropdown
              style="width: auto; border: 1px solid #adb0b8;display: inline-block;padding:0px 10px;"
              :disabled="qemu.type === 'qemu' ? inStatus('stopped', 'suspended') : inLxcStatus('stopped')"
              @on-change="handleOperate"
              v-if="!isTempalte"
          >
            <m-button
                icon="fa fa-power-off"
                slot="label"
                style="border: none;background: tranparent;height: 28px;"
            >关机
            </m-button>
            <template v-if="qemu.type === 'qemu'">
              <dropdown-item command="off" icon="fa fa-power-off" :disabled="inStatus('stopped')">关机</dropdown-item>
              <dropdown-item command="pause" icon="fa fa-pause" :disabled="inStatus('paused')">暂停</dropdown-item>
              <dropdown-item command="hibernate" icon="fa fa-download" :disabled="inStatus('paused')">挂起到磁盘
              </dropdown-item>
              <dropdown-item command="stop" icon="fa fa-stop" :disabled="inStatus('stopped')">立即停止</dropdown-item>
              <dropdown-item command="reset" icon="fa fa-bolt" :disabled="inStatus('')">重置</dropdown-item>
            </template>
            <template v-if="qemu.type === 'lxc'">
              <dropdown-item command="reboot" icon="fa fa-refresh" :disabled="!inLxcStatus('running')">重启
              </dropdown-item>
              <dropdown-item command="stop" icon="fa fa-stop" :disabled="inLxcStatus('stopped')">停止</dropdown-item>
            </template>
          </dropdown>
          <m-button
              icon="fa fa-paper-plane-o"
              @on-click="showModal('migrate')"
              :disabled="nodeList.length < 1"
              v-if="nodeList.length >= 1"
          >迁移
          </m-button>
          <dropdown
              style="width: auto; border:  1px solid #adb0b8;display: inline-block;padding:0px 10px;"
              @on-change="handleConsole"
              v-if="!isTempalte"
          >
            <m-button icon="fa fa-terminal" slot="label" style="border: none;height: 28px;">控制台</m-button>
            <dropdown-item command="novnc" name="novnc">NoVNC</dropdown-item>
            <dropdown-item command="spice" name="virt-viewer" :disabled="!qemu.type || qemu.type !== 'lxc'">SPICE
            </dropdown-item>
            <dropdown-item command="xtermjs" name="xtermjs" :disabled="!qemu.type || qemu.type !== 'lxc'">xtermjs
            </dropdown-item>
          </dropdown>
          <dropdown
              style="width: auto; border:  1px solid #adb0b8; display: inline-block;padding:0px 10px;"
              @on-change="showModal"
          >
            <m-button icon="fa fa-fw fa-ellipsis-v" slot="label" style="border: none;height: 28px;">更多操作</m-button>
            <dropdown-item command="clone" icon="fa fa-fw fa-clone">克隆</dropdown-item>
            <dropdown-item command="file" icon="fa fa-fw fa-file-o" :disabled="isTempalte">转换成模板</dropdown-item>
            <dropdown-item command="ha" icon="fa fa-heartbeat">管理HA</dropdown-item>
            <dropdown-item command="delete" icon="fa fa-trash-o"
                           :disabled="qemu.type === 'qemu' ? !inStatus('stopped') : !inLxcStatus('stopped')">删除
            </dropdown-item>
          </dropdown>
        </div>
      </div>
      <operate-modal :visible="visible"
                     :title="title"
                     v-if="visible"
                     :modalType="modalType"
                     @close="visible = false; __init__()"></operate-modal>
      <Pv-Menu :data="menuData"></Pv-Menu>
      <m-scrollbar>
        <div class="m-content">
          <router-view/>
        </div>
      </m-scrollbar>
    </div>
  </transition>
</template>

<script>
  import {mapState} from "vuex";
  import PvMenu from "@src/components/menu/Menu";
  import MScrollbar from "@src/components/scroll/Scrollbar";
  import MButton from "@src/components/button/Button";
  //菜单tree
  import {qemuMenuList} from "@src/components/menu/menuList";
  import Dropdown from "@src/components/dropdown/dropdown";
  import DropdownItem from "@src/components/dropdown/dropdownItem";
  import {openConsoleWindow} from "@libs/utils";
  import QemuHttpIndex from '@src/views/home/qemu/http';
  import OperateModal from './OperateModal';

  export default {
    name: "QEMU",
    mixins: [QemuHttpIndex],
    components: {
      DropdownItem,
      Dropdown,
      MScrollbar,
      PvMenu,
      MButton,
      OperateModal
    },
    data() {
      return {
        menuData: qemuMenuList,
        qemu: {},
        interval: null,
        visible: false,
        title: '',
        modalType: '',
        isTempalte: false,
        nodeList: []
      };
    },
    computed: {
      ...mapState({
        viewType: (state) => state.db.selectView,
      }),
    },
    mounted() {
      this.__init__();
      this.setMenu(this.qemu.type);
    },
    methods: {
      /**
       * 初始请求
       */
      __init__() {
        this.queryResource()
          .then(res => {
            this.isTempalte = this.db.qemuObj && this.db.qemuObj.template && this.db.qemuObj.template === 1 ? true : false;
          });
        this.queryNodeList();
      },
      /**
       * 重启虚拟机
       */
      handleReset() {
        let _this = this;
        if (_this.db.qemuObj.qmpstatus !== "stopped" && _this.qemu.type === 'qemu') {
          let event = _this.createEvent(`action.qemu.resume`, _this.qemu.name);
          this.$http
            .post(
              `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/resume`,
              {},
              {
                headers: {
                  "Content-Type":
                    "application/x-www-form-urlencoded; charset=UTF-8",
                },
              }
            )
            .then((res) => {
              this.incEventSuccess(event);
              if (res.data) {
                this.queryStatus(res.data)
              }
            })
            .catch((res) => {
              this.incEventFail(event);
              this.alertConfirm(res);
            });
        } else if (_this.db.qemuObj.status === 'stopped') {
          let event = this.createEvent(`action.qemu.reboot`, this.qemu.name);
          this.$http
            .post(
              `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/start`,
              {},
              {
                headers: {
                  "Content-Type":
                    "application/x-www-form-urlencoded; charset=UTF-8",
                },
              }
            )
            .then((res) => {
              this.incEventSuccess(event);
              if (res.data) {
                this.queryStatus(res.data)
              }
            })
            .catch((res) => {
              this.incEventFail(event);
              this.alertConfirm(res);
            });
        }
      },
      /**
       * 克隆模板
       */
      handleClose() {
        this.$confirm
          .confirm({
            title: "确定",
            msg: `关闭虚拟机\'${this.qemu.name && this.qemu.name}\'？`,
            icon: "icon-question",
            yesBtnText: "确定",
          })
          .then(() => {
            this.offQemu().then(res => {
              this.__init__();
            }).catch(res => {
              this.alertConfirm(res);
            })
          })
          .catch(() => {

          });
      },
      /**
       * vnc操作
       */
      handleConsole(e) {
        let options = {
          cmd: undefined,
          consoleName: this.qemu.name,
          nodename: undefined,
          vmid: this.qemu.vmid,
        };
        let console = this.qemu.type === 'lxc' ? 'lxc' : 'kvm';
        switch (e) {
          case "novnc":
            openConsoleWindow(
              "html5",
              console,
              options.vmid,
              this.qemu.node,
              options.consoleName,
              options.cmd
            );
            break;
          case "spice":
            openConsoleWindow(
              "vv",
              console,
              options.vmid,
              this.qemu.node,
              options.consoleName,
              options.cmd
            );
            break;
          case "xtermjs":
            openConsoleWindow(
              "xtermjs",
              console,
              options.vmid,
              this.qemu.node,
              options.consoleName,
              options.cmd
            );
            break;
        }
      },
      /**
       * 虚拟机开关重启停用等操作
       */
      handleOperate(command) {
        switch (command) {
          case "off":
            this.handleClose()
            break;
          case "pause":
            this.paused()
            break;
          case "hibernate":
            this.paused({todisk: 1})
            break;
          case "stop":
            let param = {};
            if (this.qemu.type === 'qemu') {
              param = {
                timeout: 30,
              }
            }
            this.stop(param);
            break;
          case "reset":
            this.reset()
            break;
          case 'reboot':
            this.reboot()
            break;
        }
      },
      /**
       * 重置虚拟机
       */
      reset() {
        this.$confirm
          .confirm({
            title: "确定",
            msg: `重置虚拟机\'${this.qemu.name && this.qemu.name}\'？`,
            icon: "icon-question",
            yesBtnText: "确定",
          })
          .then(() => {
            this.resetQemu().then(res => {
              if (res.data) {
                this.queryStatus(res.data)
              }
            }).catch(res => {
              this.alertConfirm(res);
            });
          })
          .catch(() => {
          });
      },
      /**
       * 暂停虚拟机
       */
      paused(params) {
        this.$confirm
          .confirm({
            title: "确定",
            msg: `${params ? "挂起" : "暂停"}虚拟机\'${this.qemu.name && this.qemu.name}\'？`,
            icon: "icon-question",
            yesBtnText: "确定",
          })
          .then(() => {
            this.pausedQemu().then(res => {
              if (res.data) {
                this.queryStatus(res.data)
              }
            }).catch(res => {
              this.alertConfirm(res);
            });
          })
          .catch(() => {
          });
      },
      /**
       * 停用虚拟机
       */
      stop() {
        this.$confirm
          .confirm({
            title: "确定",
            msg: `停用虚拟机\'${this.qemu.name && this.qemu.name}\'？`,
            icon: "icon-question",
            yesBtnText: "确定",
          })
          .then(() => {
            this.stopQemu().then(res => {
              this.__init__();
            }).catch(res => {
              this.alertConfirm(res);
            })
          })
          .catch(() => {

          });
      },
      /**
       * 重启虚拟机
       */
      reboot() {
        this.$confirm
          .confirm({
            title: "确定",
            msg: `重启\'${this.qemu.name && this.qemu.name}\'？`,
            icon: "icon-question",
            yesBtnText: "确定",
          })
          .then(() => {
            this.rebootLxc().then(res => {
              this.__init__();
            }).catch(res => {
              this.alertConfirm(res);
            });
          })
          .catch(() => {

          });
      },
      alertConfirm(msg) {
        this.$confirm.confirm({
          icon: 'icon-warning',
          msg
        })
      },
      /**
       * 删除虚拟机
       */
      delete() {
        this.$confirm
          .confirm({
            title: "确定",
            msg: `删除虚拟机\'${this.qemu.name && this.qemu.name}\'？`,
            icon: "icon-question",
            yesBtnText: "确定",
          }).then(() => {
            this.deleteQemu()
              .catch(res => {
                this.alertConfirm(res);
              })
          }
        )
      },
      /**
       * 判断是否在某个状态下
       */
      inStatus() {
        let states = [];
        for (let arg in arguments) {
          states.push(arguments[arg]);
        }
        return states.some(status => status === this.db.qemuObj.qmpstatus);
      },
      /**
       * 判断lxc容器是否在某个状态下
       */
      inLxcStatus() {
        let states = [];
        for (let arg in arguments) {
          states.push(arguments[arg]);
        }
        return states.some(status => status === this.db.qemuObj.status);
      },
      /**
       * 当为lxc容器时， 与虚拟机菜单略有不同分别做不同过滤
       */
      setMenu(type) {
        if (type === 'lxc') {
          this.menuData = qemuMenuList.filter(item => {
            return !/(monitor|volume|cloud-init)/.test(item.path)
          })
        } else {
          this.menuData = qemuMenuList.filter(item => {
            return !/(lxc)/.test(item.path)
          });
        }
      },
      showModal(type) {
        if (!['file'].includes(type)) {
          this.modalType = type;
          this.setTitle(type);
          this.visible = true;
        } else {
          if (type === 'delete') {
            this.delete();
            return;
          }
          if (type === 'file') {
            this.template();
            return;
          }
        }
      },
      /***
       * 设置弹框标题
       */
      setTitle(type) {
        switch (type) {
          case 'migrate':
            this.title = '迁移';
            break;
          case 'delete':
            this.title = `删除：${this.qemu.id}`;
            break;
          case 'ha':
            this.title = `管理HA： ${this.qemu.id}`;
            break;
          case 'clone':
            this.title = `克隆： ${this.qemu.id}`;
            break;
        }
      },
      template() {
        this.$confirm
          .confirm({
            title: "确定",
            msg: `删除虚拟机\'${this.db.qemuObj.name}\'？`,
            icon: "icon-question",
            yesBtnText: "确定",
          }).then(() =>
          this.makeTemplate()
            .catch(res => {
              this.alertConfirm(res);
            })
        )
      },
    },
    beforeDestroy() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },
    watch: {
      "$store.state.db.lastSelectObj": function (newVal, oldVal) {
        if (newVal !== oldVal && (newVal.type === "qemu" || newVal.type === 'lxc')) {
          this.__init__();
          this.setMenu(newVal.type);
        }
      },
    },
  };
</script>

<style scoped>
  .transition-enter {
    transition: all 0.5s ease-in;
  }

  .content {
    height: 100%;
  }
</style>
