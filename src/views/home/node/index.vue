<template>
   <transition name="transition">
     <div class="content">
       <div class="m-operate">
         <div class="m-operate-left">节点test</div>
         <div class="m-operate-right">
           <m-button icon="fa fa-undo" @on-click="handleReset">重启</m-button>
           <m-button icon="fa fa-power-off" @on-click="handleClose">关机</m-button>
           <dropdown style="width: auto; border: 1px solid #e6e6e6;display: inline-block;" @on-change="handleConsole">
             <m-button icon="fa fa-terminal" slot="label" style="border: none;">
               shell
             </m-button>
             <dropdown-item command="novnc">NoVNC</dropdown-item>
             <dropdown-item command="spice">SPICE</dropdown-item>
             <dropdown-item command="xtermjs">xtermjs</dropdown-item>
           </dropdown>
           <dropdown style="width: auto; border: 1px solid #e6e6e6;display: inline-block;" @on-change="handleMoreOpration">
             <m-button icon="fa fa-fw fa-ellipsis-v" slot="label" style="border: none;">
               批量操作
             </m-button>
             <dropdown-item command="startall">批量启动</dropdown-item>
             <dropdown-item command="stopall">批量停止</dropdown-item>
             <dropdown-item command="xtermjs">批量迁移</dropdown-item>
           </dropdown>
         </div>
       </div>
       <Pv-Menu :data="menuData"></Pv-Menu>
       <m-scrollbar>
         <div class="m-content">
           <router-view/>
         </div>
       </m-scrollbar>
       <node-select-modal 
           :visible="visible"
           v-if="visible"
           :param="nodeModalParam"
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
    mixins: [NodeHttp],
    components: {
      DropdownItem,
      Dropdown,
      MScrollbar,
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
        title: '批量启动'
      }
    },
    computed: {
      ...mapState({
        viewType: state => state.db.selectView
      })
    },
    methods: {
      handleReset() {
        this.$confirm.confirm({
          title: '确定',
          msg: `重启节点\'${this.node}\'？`,
          icon: 'icon-warning',
          yesBtnText: "确定"
        }).then(() => {
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
        }).catch(() => {

        });
      },
      handleClose() {
        this.$confirm.confirm({
          title: '确定',
          msg: `关闭节点\'${this.node}\'？`,
          yesBtnText: "确定"
        }).then(() => {
          this.$http.post(`/json/nodes/${this.node}/status`, {
            command: 'stop'
          }, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
          })
        })
          .catch(() => {
            console.log('cancel')
          });
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
        this.title = operate === 'stopall' ? '批量停止' : operate === 'startall' ? '批量启动' : '批量迁移'
        this.visible = true;
         //this.beatchOperate(operate);
      }
    },
    mounted() {
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
