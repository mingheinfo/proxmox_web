<template>
  <transition name="transition">
    <div class="content">
      <div class="m-operate">
        <div class="m-operate-left">虚拟机{{db.qemuObj.vmid}}({{db.qemuObj.name}})</div>
        <div class="m-operate-right">
          <m-button
            icon="fa fa-play"
            @on-click="!inStatusRunning(['running']) && handleReset()"
            :class="{'disabled':inStatusRunning(['running'])}"
            :disabled="inStatusRunning(['running'])"
          >{{ !inStatusRunning(['running']) ? '再继续' : '启动'}}</m-button>
          <dropdown
            style="width: auto; border: 1px solid #e6e6e6;display: inline-block;padding:0px 10px;"
            :disabled="inStatus('stopped', 'suspended')"
            @on-change="handleOperate"
          >
            <m-button
              icon="fa fa-power-off"
              slot="label"
              style="border: none;background: tranparent"
            >关机</m-button>
            <dropdown-item command="off" icon="fa fa-power-off" :disabled="inStatus('stopped')">关机</dropdown-item>
            <dropdown-item command="pause" icon="fa fa-pause" :disabled="inStatus('paused')">暂停</dropdown-item>
            <dropdown-item command="hibernate" icon="fa fa-download" :disabled="inStatus('paused')">挂起到磁盘</dropdown-item>
            <dropdown-item command="stop" icon="fa fa-stop" :disabled="inStatus('stopped')">立即停止</dropdown-item>
            <dropdown-item command="reset" icon="fa fa-bolt" :disabled="inStatus('')">重置</dropdown-item>
          </dropdown>
          <dropdown
            style="width: auto; border: 1px solid #e6e6e6;display: inline-block;padding:0px 10px;"
            @on-change="handleConsole"
          >
            <m-button icon="fa fa-terminal" slot="label" style="border: none;">控制台</m-button>
            <dropdown-item command="novnc" name="novnc">NoVNC</dropdown-item>
            <dropdown-item command="spice" name="virt-viewer">SPICE</dropdown-item>
            <dropdown-item command="xtermjs" name="xtermjs">xtermjs</dropdown-item>
          </dropdown>
          <dropdown
            style="width: auto; border: 1px solid #e6e6e6;display: inline-block;padding:0px 10px;"
            @on-change="handleQemu"
          >
            <m-button icon="fa fa-fw fa-ellipsis-v" slot="label" style="border: none;">更多操作</m-button>
            <dropdown-item command="clone" icon="fa fa-fw fa-clone">克隆</dropdown-item>
            <dropdown-item command="file" icon="fa fa-fw fa-file-o">转换成模板</dropdown-item>
            <dropdown-item command="ha" icon="fa fa-heartbeat">管理HA</dropdown-item>
            <dropdown-item command="delete" icon="fa fa-trash-o" :disabled="!inStatus('stopped')">删除</dropdown-item>
          </dropdown>
        </div>
      </div>
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
import { mapState } from "vuex";
import PvMenu from "@src/components/menu/Menu";
import MScrollbar from "@src/components/scroll/Scrollbar";
import MButton from "@src/components/button/Button";
//菜单tree
import { qemuMenuList } from "@src/components/menu/menuList";
import Dropdown from "@src/components/dropdown/dropdown";
import DropdownItem from "@src/components/dropdown/dropdownItem";
import { openConsoleWindow } from "@libs/utils";
import QemuHttpIndex from '@src/views/home/qemu/http';

export default {
  name: "Node",
  mixins: [QemuHttpIndex],
  components: {
    DropdownItem,
    Dropdown,
    MScrollbar,
    PvMenu,
    MButton,
  },
  data() {
    return {
      menuData: qemuMenuList,
      qemu: {},
      interval: null
    };
  },
  computed: {
    ...mapState({
      viewType: (state) => state.db.selectView,
    }),
    inStatusRunning() {
     return (states) => {
        return states.some(status => status === this.db.qemuObj.qmpstatus);
      }
    }
  },
  mounted() {
    this.queryResource();
    this.interval = setInterval(() => this.queryResource(), 3000)
  },
  methods: {
    handleReset() {
      this.$confirm
        .confirm({
          title: "确定",
          msg: `重启虚拟机\'${this.db.qemuObj.name}\'？`,
          yesBtnText: "确定",
        })
        .then(() => {
          if (this.db.qemuObj.qmpstatus !== "stopped") {
            let event = this.createEvent(`action.qemu.resume`, this.qemu.name);
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
              .then(() => {
                this.incEventSuccess(event);
              })
              .catch(() => {
                this.incEventFail(event);
              });
          } else {
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
              .then(() => {
                this.incEventSuccess(event);
              })
              .catch(() => {
                this.incEventFail(event);
              });
          }
        })
        .catch(() => {});
    },
    handleClose() {
      this.$confirm
        .confirm({
          title: "确定",
          msg: `关闭虚拟机\'${this.db.qemuObj.name}\'？`,
          icon: "icon-question",
          yesBtnText: "确定",
        })
        .then(() => {
          this.offQemu()
        })
        .catch(() => {
          console.log("cancel");
        });
    },
    handleConsole(e) {
      let options = {
        cmd: undefined,
        consoleName: undefined,
        nodename: undefined,
        vmid: 0,
      };
      switch (e) {
        case "novnc":
          openConsoleWindow(
            "html5",
            "shell",
            options.vmid,
            this.node,
            options.consoleName,
            options.cmd
          );
          break;
        case "spice":
          openConsoleWindow(
            "vv",
            "shell",
            options.vmid,
            this.node,
            options.consoleName,
            options.cmd
          );
          break;
        case "xtermjs":
          openConsoleWindow(
            "xtermjs",
            "shell",
            options.vmid,
            this.node,
            options.consoleName,
            options.cmd
          );
          break;
      }
    },
    handleOperate(command) {
      switch (command) {
        case "off":
          this.handleClose();
          break;
        case "pause":
          this.paused();
          break;
        case "hibernate":
          this.paused({ todisk: 1 });
          break;
        case "stop":
          this.stop();
          break;
        case "reset":
          this.reset();
          break;
      }
    },
    reset() {
      this.$confirm
        .confirm({
          title: "确定",
          msg: `重置虚拟机\'${this.db.qemuObj.name}\'？`,
          icon: "icon-question",
          yesBtnText: "确定",
        })
        .then(() => {
         this.resetQemu();
        })
        .catch(() => {
          console.log("cancel");
        });
    },
    paused(params) {
      this.$confirm
        .confirm({
          title: "确定",
          msg: `${params ? "挂起" : "暂停"}虚拟机\'${this.db.qemuObj.name}\'？`,
          icon: "icon-question",
          yesBtnText: "确定",
        })
        .then(() => {
         this.pausedQemu();
        })
        .catch(() => {
          console.log("cancel");
        });
    },
    stop() {
      this.$confirm
        .confirm({
          title: "确定",
          msg: `停用虚拟机\'${this.db.qemuObj.name}\'？`,
          icon: "icon-question",
          yesBtnText: "确定",
        })
        .then(() => {
         this.stopQemu();
        })
        .catch(() => {
          console.log("cancel");
        });
    },
    handleQemu(command) {
      switch (command) {
        case "clone":
          break;
        case "ha":
          break;
        case "file":
          break;
        case "delete":
          this.delete();
          break;
      }
    },
    delete() {
        this.$confirm
        .confirm({
          title: "确定",
          msg: `删除虚拟机\'${this.db.qemuObj.name}\'？`,
          icon: "icon-question",
          yesBtnText: "确定",
        }).then(() => this.deleteQemu())
    },
    inStatus() {
      let states =  [];
      for (let arg in arguments) {
        states.push(arguments[arg]);
      }
      return states.some(status => status === this.db.qemuObj.qmpstatus);
    }
  },
  beforeDestroy() {
    if(this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  watch: {
    "$store.state.db.lastSelectObj": function (newVal, oldVal) {
      if (newVal !== oldVal && newVal.type === "qemu") {
        this.queryResource();
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
