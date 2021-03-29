<template>
   <transition name="transition">
     <div class="content">
       <div class="m-operate">
         <div class="m-operate-left">节点test</div>
         <div class="m-operate-right">
           <m-button icon="fa fa-undo"
                     v-confirm="{msg: `重启节点\'${node}\'？`,
                                  ok: () => handleReset()
                      }">重启</m-button>
           <m-button icon="fa fa-power-off" v-confirm="{msg: `关闭节点\'${node}\'？`,
                                  ok: () => handleClose()
                      }">关机</m-button>
           <dropdown style="width: auto; border: 1px solid #adb0b8;display: inline-block;" @on-change="handleConsole">
             <m-button icon="fa fa-terminal" slot="label" style="border: none;height: 28px;">
               shell
             </m-button>
             <dropdown-item command="novnc" name="novnc">NoVNC</dropdown-item>
             <dropdown-item command="spice" name="virt-viewer">SPICE</dropdown-item>
             <dropdown-item command="xtermjs" name="xtermjs">xtermjs</dropdown-item>
           </dropdown>
           <dropdown style="width: auto; border: 1px solid #adb0b8;display: inline-block;" @on-change="handleMoreOpration">
             <m-button icon="fa fa-fw fa-ellipsis-v" slot="label" style="border: none; height: 28px;">
               批量操作
             </m-button>
             <dropdown-item command="startall" icon="fa el-icon-video-play">批量启动</dropdown-item>
             <dropdown-item command="stopall" icon="fa el-icon-video-pause">批量停止</dropdown-item>
             <dropdown-item command="migrateall" icon="fa fa-paper-plane-o">批量迁移</dropdown-item>
           </dropdown>
         </div>
       </div>
       <Pv-Menu :data="menuData"></Pv-Menu>
       <div class="m-scroll-wrapper  scroll-container">
        <div class="m-scroll-view scroll-view" @scroll="onScroll">
          <div class="m-content">
            <router-view />
          </div>
        </div>
        <div
          class="m-scroll-bar"
          v-show="showScrollbar"
          :style="{ top: scrollTop + 'px', height: scrollLength + 'px' }"
          @mousedown="onScrollBarMouseDown($event)"
        ></div>
      </div>
       <node-select-modal
           :visible="visible"
           v-if="visible"
           :param="nodeModalParam"
           :modalType="type"
           :title="title"
           @close="visible = false"
           ></node-select-modal>
     </div>
   </transition>
</template>

<script>
  import NodeSelectModal from '@view/home/node/NodeSelectModal'
  import { mapState } from 'vuex';
  import PvMenu from '@src/components/menu/Menu';
  import MScrollbar from "@src/components/scroll/Scrollbar";
  import MButton from "@src/components/button/Button";
  //菜单tree
  import { nodeMenuList } from "@src/components/menu/menuList";
  import Dropdown from "@src/components/dropdown/dropdown";
  import DropdownItem from "@src/components/dropdown/dropdownItem";
  import { openConsoleWindow} from "@libs/utils";
  import NodeHttp from './http';

  export default {
    name: "Node",
    mixins: [NodeHttp, MScrollbar],
    components: {
      DropdownItem,
      Dropdown,
      PvMenu,
      MButton,
      NodeSelectModal
    },
    data() {
      return {
        node: '',
        menuData: nodeMenuList,
        nodeModalParam: {},
        visible: false,//是否展示批量操作框，
        title: '批量启动',
        type: ''
      }
    },
    computed: {
      ...mapState({
        viewType: state => state.db.selectView
      })
    },
    methods: {
      handleReset() {
        let event = this.createEvent(`action.node.reboot`, this.node);
        this.$http.post(`/json/nodes/${this.node}/status`, {
          command: 'reboot'
        }, {
          headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        }).then(() => {
          this.incEventSuccess(event);
        }).catch(() => {
          this.incEventFail(event);
        })
      },
      handleClose() {
        this.$http.post(`/json/nodes/${this.node}/status`, {
          command: 'shutdown'
        }, {
          headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        })
      },
      handleConsole(e) {
        let options = {
          cmd: undefined,
          consoleName: undefined,
          nodename: undefined,
          vmid: 0,
        }
        switch (e) {
          case 'novnc':
            openConsoleWindow('html5', 'shell', options.vmid, this.node, options.consoleName, options.cmd);
            break;
          case 'spice':
            openConsoleWindow('vv', 'shell', options.vmid, this.node, options.consoleName, options.cmd);
            break;
          case 'xtermjs':
            openConsoleWindow('xtermjs', 'shell', options.vmid, this.node, options.consoleName, options.cmd);
            break;
        }
      },
      handleMoreOpration(operate) {
        this.nodeModalParam = {
          operate,
          node: this.node
        }
        this.title = operate === 'stopall' ? '批量停止' : operate === 'startall' ? '批量启动' : '批量迁移';
        this.type = operate;
        this.visible = true;
         //this.beatchOperate(operate);
      }
    },
    mounted() {
      this.scrollElementSelector = '.scroll-view';
      this.scrollContainerSelector =  '.scroll-container';
      let last = window.localStorage.getItem("lastsel") || '[]';
      this.node = (JSON.parse(last).node && JSON.parse(last).node) || '';
    }
  }
</script>

<style scoped>
  .transition-enter{
    transition: all .5s ease-in;
  }
  .content{
    height: 100%;
  }
</style>
