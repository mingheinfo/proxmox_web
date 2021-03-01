<template>
  <ul class="m-sub-tree">
    <li v-for="tree of renderData" :key="tree.data.id" class="m-sub_li">
      <template v-if="tree.data.parentId === parentId">
        <div
          class="m-sub-item"
          :class="tree.data.selected && tree.data.selected ? 'is-selected': ''"
          @click.stop="handleSelect(tree.data)"
          @mouseover.stop="showTip(tree)"
          @mouseout="hiddenTip(tree)"
          @contextmenu="handleContextMenu"
          @mousedown="showContext = false"
        >
          <div class="m-sub-item-content" :ref="`m$sub$item${tree.data.id}`">
            <i :class="tree.data.iconCls" class="m-icon-custom"></i>
            <span>{{tree.data.text}}</span>
          </div>
        </div>
      </template>
      <div class="m-sub_li"></div>
      <template v-if="tree.childNodes && tree.childNodes.length > 0">
        <m-sub-tree :tree-data="tree.childNodes" :parent-id="tree.data.parentId" />
      </template>
    </li>
    <context-menu v-show="showContext" :visible="showContext" :axis="axis" :menuData="menuData" :param="param" @on-click="handleOperate"></context-menu>
    <operate-modal :visible="visible"
                   :title="title"
                   v-if="visible"
                   :modalType="modalType"
                   :isLeft="true"
                   :param="qemu"
                   @close="visible = false; __init__()"></operate-modal>
  </ul>
</template>

<script>
  import ContextMenu from  '@src/components/contextMenu/Index';
  import QemuHttpIndex from '@src/views/home/qemu/http';
  import { hasClass, openConsoleWindow} from "@libs/utils";
  import OperateModal from '@src/views/home/qemu/OperateModal';
  export default {
  name: "MSubTree",
  mixins: [QemuHttpIndex],
  components: {
    'context-menu': ContextMenu,
    OperateModal
  },
  props: {
    treeData: {
      type: Object | Array,
    },
    parentId: {
      type: String,
    },
  },
  data() {
    return {
      renderData: {},
      menuData: [],
      showContext: false,
      qemu: {},
      param: {},
      interval: null,
      visible: false,
      modalType: '',
      title: '',
      axis: {
        x: 0,
        y: 0
      }
    };
  },
  mounted() {
    document.addEventListener('click', this.handleHiddenContext, false)
  },
  methods: {
    handleSelect(node) {
      let loop = (item) => {
        item.forEach((it) => {
          if (it.data.id === node.id) {
            Object.assign(node, { selected: true });
          } else {
            Object.assign(it.data, { selected: false });
          }
          if (it.childNodes && it.childNodes.length > 0) {
            loop(it.childNodes);
          }
        });
      };
      loop(this.renderData);
      this.$forceUpdate();
      this.$emit("reset-select", node);
    },
    showModal(type) {
      if (!['file'].includes(type)) {
        this.modalType = type;
        this.setTitle(type);
        this.visible = true;
      } else {
        if (type === 'file') {
          this.template();
          return;
        }
      }
    },
    template() {
      this.$confirm
        .confirm({
          title: "确定",
          msg: `删除虚拟机\'${this.qemu.name}\'？`,
          icon: "icon-question",
          yesBtnText: "确定",
        }).then(() =>
        this.makeTemplate()
          .catch(res => {
            this.alertConfirm(res);
          })
      )
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
    resetSelect(node) {
      let loop = (item) => {
        item.forEach((it) => {
          if (it.data.id === node.id) {
            Object.assign(node, { selected: true });
          } else {
            Object.assign(it.data, { selected: false });
          }
          if (it.childNodes && it.childNodes.length > 0) {
            loop(it.childNodes);
          }
        });
      };
      loop(this.renderData);
      this.$forceUpdate();
    },
    showTip(tree) {
      let el = document.createDocumentFragment(),
          pos = this.$refs[`m$sub$item${tree.data.id}`][0] && this.$refs[`m$sub$item${tree.data.id}`][0].getBoundingClientRect(),
          con = document.querySelector('.m-tree'),
          dom = document.createElement('div');
          dom.className = 'm-sub-item-tips';
          dom.setAttribute('id', `${tree.data.id.replace(/\//g, '')}`)
          dom.style.left = con.clientWidth + 'px';
          dom.style.top = (pos.top - 15) + 'px';
          dom.style.zIndex = '999';
          dom.style.backgroundColor = '#fff';
          dom.style.padding = "10px 20px";
          dom.style.color =  "#222";
          dom.style.position = 'absolute';
          dom.innerHTML = `<ul>
   <li>名称：${tree.data.text ? tree.data.text : ''}</li>
   <li>状态：${tree.data.status ? tree.data.status : ''}</li>
   ${tree.data.type ===  'storage' ? `
    <li>
    <span style="display: inline-block;margin-right: 3px;">容量:</span>
    <span style="width: calc(100% - 35px); display: inline-block; height: 8px;line-height: 8px;border-radius: 50px;position: relative; background-color: #f5f5f5;">
        <div style="position: absolute;top:0;height: 100%;border-radius: 50px;width:${tree.data.disk && tree.data.maxdisk && tree.data.maxdisk !==0 ? ((tree.data.disk / tree.data.maxdisk) * 100).toFixed(1) : 0}%;
                    background: ${tree.data.disk && tree.data.maxdisk && tree.data.maxdisk !==0 ? (tree.data.disk / tree.data.maxdisk) * 100 < 50 ? 'rgb(33, 191, 75)' : (tree.data.disk / tree.data.maxdisk) * 100 >= 50 && (tree.data.disk / tree.data.maxdisk) * 100 <= 80 ? 'rgb(255, 204, 0)' :
                    (tree.data.disk / tree.data.maxdisk) * 100 >= 80 && (tree.data.disk / tree.data.maxdisk) * 100 <= 100 ? 
                    '#ff0000' : 'transparent' : 'transparent'}">
                    </div>
        <div style="position: absolute; width: 100%;text-align: center;height: 8px; line-height: 8px;">${tree.data.disk && tree.data.maxdisk && tree.data.maxdisk !==0 ? ((tree.data.disk / tree.data.maxdisk) * 100).toFixed(1) : 0}%</div>
     </span>
    </li>` 
   : ''}
</ul>`
debugger;
          el.appendChild(dom);
      document.body.appendChild(el);
      this.param = tree;
      this.qemu = this.param.data;
      this.ele = this.$refs[`m$sub$item${tree.data.id}`][0];
    },
    hiddenTip(tree) {
      let id = document.querySelector(`#${tree.data.id.replace(/\//g, '')}`);
      document.body.removeChild(id);
    },
    handleContextMenu(event) {
      if(event.button === 2) {
        event.preventDefault();
        var x = event.clientX
        var y = event.clientY
        this.axis = {x, y};
        if(!this.getContextMenu()) return;
        this.showContext = true;
      }
    },
    getContextMenu() {
      if(this.param.data.template === 1) {
        this.menuData = [
          {text: this.param.data.name,},
          {text: '迁移', icon: 'fa fa-paper-plane-o', operate: 'migrate'},
          {text: '克隆', icon: 'fa fa-fw fa-clone', operate: 'clone'}
        ]
        return true;
      } else if(this.param.data.type === 'qemu'){
        this.menuData = [
          {text: this.param.data.name},
          {text: '启动', icon: 'fa fa-play', operate:  'start', disabled: (()=> !this.inStatus('stopped', 'paused'))()},
          {text: '关机', icon: 'fa fa-power-off', operate: 'off',disabled: (()=> this.inStatus('stopped'))()},
          {text: '暂停', icon: 'fa fa-pause', operate: 'pause',disabled: (()=> this.inStatus('paused'))()},
          {text: '立即停止', icon: 'fa fa-stop', operate: 'stop',disabled: (()=> this.inStatus('stopped'))()},
          {text: '重置', icon: 'fa fa-bolt', operate: 'reset', disabled: (()=> !this.inStatus('running'))()},
          {text: '转化成模板', icon: 'fa fa-fw fa-file-o', operate: 'file', disabled: (()=> this.inStatus('running'))()},
          {text: '控制台', icon: 'fa fa-terminal', operate: 'novnc'},
          {text: '克隆', icon: 'fa fa-fw fa-clone', operate: 'clone'}
        ]
        return true;
      } else if(this.param.data.type === 'lxc'){
        this.menuData = [
          {text: this.param.data.name},
          {text: '启动', icon: 'fa fa-play', operate:  'start', disabled: (()=> !this.inLxcStatus('stopped', 'paused'))()},
          {text: '重启', icon: 'fa fa-refresh', operate: 'reboot', disabled: (()=>!this.inLxcStatus('running'))()},
          {text: '停止', icon: 'fa fa-stop', operate: 'off', disabled: (()=> this.inLxcStatus('stopped'))()},
          {text: '转化成模板', icon: 'fa fa-fw fa-file-o', operate: 'file', disabled: (()=> this.inStatus('running'))()},
          {text: '控制台', icon: 'fa fa-terminal', operate: 'novnc'},
          {text: '克隆', icon: 'fa fa-fw fa-clone', operate: 'clone'}
        ]
        return true;
      } else {
        return false;
      }
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
      }
    },
    /**
     * 虚拟机开关重启停用等操作
     */
    handleOperate() {
      let ev = event.srcElement || event.target,
          target = ev.parentElement && ev.parentElement.tagName !== 'UL' ? ev.parentElement : ev,
          command = target.id;
      if(hasClass.call(target, 'disabled')) return;
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
          if (this.param.data.type === 'qemu') {
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
        case 'start':
          this.handleReset();
          break;
        case 'migrate':
          this.showModal('migrate');
          break;
        case 'clone':
          this.showModal('clone');
          break;
        case 'file':
          this.showModal('file');
          break;
        case 'novnc':
          this.handleConsole('novnc');
          break;
      }
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
     * 重置虚拟机
     */
    reset() {
      this.$confirm
        .confirm({
          title: "确定",
          msg: `重置虚拟机\'${this.param.data.name && this.param.data.name}\'？`,
          icon: "icon-question",
          yesBtnText: "确定",
        })
        .then(() => {
          this.resetQemu().then(res => {
            if (res.data) {
              this.queryStatus(res.data)
              this.interval = setInterval(() => {
                this.queryStatus(res.data);
                this.getContextMenu();
              }, 3000)
            }
          }).catch(res => {
            this.alertConfirm(res);
          });
        })
        .catch(() => {
        });
    },
    /**
     * 重启虚拟机
     */
    handleReset() {
      let _this = this;
      if (this.param.data.status !== "stopped" && this.param.data.type === 'qemu') {
        let event = _this.createEvent(`action.qemu.resume`, this.param.data.name);
        this.$http
          .post(
            `/json/nodes/${this.param.data.node}/${this.param.data.id}/status/resume`,
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
              this.interval = setInterval(() => {
                this.queryStatus(res.data);
                this.getContextMenu();
              }, 3000)
            }
          })
          .catch((res) => {
            this.incEventFail(event);
            this.alertConfirm(res);
          });
      } else if (this.param.data.status === 'stopped') {
        let event = this.createEvent(`action.qemu.reboot`, this.param.data.name);
        this.$http
          .post(
            `/json/nodes/${this.param.data.node}/${this.param.data.id}/status/start`,
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
              this.interval = setInterval(() => {
                this.queryStatus(res.data);
                this.getContextMenu();
              }, 3000)
            }
          })
          .catch((res) => {
            this.incEventFail(event);
            this.alertConfirm(res);
          });
      }
    },
    /**
     * 初始请求
     */
    __init__() {
      this.queryResource();
      this.queryNodeList();
    },
    /**
     * 克隆模板
     */
    handleClose() {
      this.$confirm
        .confirm({
          title: "确定",
          msg: `关闭虚拟机\'${this.param.data.name && this.param.data.name}\'？`,
          icon: "icon-question",
          yesBtnText: "确定",
        })
        .then(() => {
          this.offQemu().then(res => {
            if(res.data) {
              this.interval = setInterval( () => this.queryStatus(res.data), 3000);
            }
          }).catch(res => {
            this.alertConfirm(res);
          })
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
          msg: `${params ? "挂起" : "暂停"}虚拟机\'${this.param.data.name && this.param.data.name}\'？`,
          icon: "icon-question",
          yesBtnText: "确定",
        })
        .then(() => {
          this.pausedQemu().then(res => {
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
          msg: `停用虚拟机\'${this.param.data.name && this.param.data.name}\'？`,
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
          msg: `重启\'${this.param.data.name && this.param.data.name}\'？`,
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
          msg: `删除虚拟机\'${this.param.data.name && this.param.data.name}\'？`,
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
      return states.some(status => status === this.param.data.status);
    },
    /**
     * 判断lxc容器是否在某个状态下
     */
    inLxcStatus() {
      let states = [];
      for (let arg in arguments) {
        states.push(arguments[arg]);
      }
      return states.some(status => status ===  this.param.data.status);
    },
    handleHiddenContext(event) {
      event.stopPropagation();
      this.showContext = false;
    }
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleHiddenContext, false);
    if(this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  watch: {
    treeData: {
      immediate: true,
      deep: true,
      handler: function (newVal, oldVal) {
        this.renderData = newVal;
      },
    },
  },
}
</script>

<style lang="less">
.m-sub {
  &-item {
    padding: 5px 0px;
    width: 100%;
    position: relative;
    &-content {
      padding-left: 47px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      table-layout: fixed;
      display: inline-block;
    }
    &-tips {
      position: absolute;
      z-index: 1086;
      background: #fff;
      color: #222;
      padding: 5px 20px;
      font-size: 12px;
      text-overflow: normal;
      word-wrap: break-word;
      white-space: normal;
      box-shadow: 1px 1px 12px #ccc;
      transition: all 0.5s ease-in;
      &:before {
        content: "";
        display: block;
        width: 10px;
        height: 10px;
        border-right: 2px solid #f6f6f6;
        border-bottom: 2px solid #f6f6f6;
        -webkit-transform: rotate(135deg);
        position: absolute;
        bottom: -4px;
        text-align: center;
        background: #fff;
        top: 50%;
        transform:translateY(-50%) scale(1) rotate(135deg);
        transition-delay: .5s;
        transition-timing-function: ease-in;
        left: -5px;
      }
    }
    &:hover {
      .m-sub-item-tips {
        display: block;
      }
    }
  }
   &_li{
    position: relative;
    &:after{
      content: '';
      position: absolute;
      height: 1px;
      background: #fff;
      left: -10px;
      right: 0;
      bottom: 0;
    }
  }
}
.is-selected {
  background-image: linear-gradient(180deg,  rgba(64, 158, 255, 0.7),  rgba(64, 158, 255));
  color: #fff;
}
</style>
