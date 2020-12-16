<template>
  <div class="header-container">
    <div class="header-container-left">
      <div class="pve-logo"></div>
      <div class="pve-search">
        <label class="inline-block">Virtual Environment 6.0-4</label>
        <span class="inline-block">
           <m-input
                  placeholder="搜索"
                  v-model="searchModel"
                  ref="search-input"
                  @blur="handleBlur"
                  @focus="searchModelFocus"/>
           <div class="pve-search-resource-table"
                tabindex="-1"
                v-show="showSearchTable"
                ref="searchRef"
               >
              <el-table :data="searchTable"
                        highlight-current-row
                        @row-click="handelRowClick">
                  <el-table-column
                      prop="type"
                      label="类别"
                      width="120">
                     <template slot-scope="scope">
                        <span>
                          <i
                          class="fa"
                          style="width: 15px"
                          :class="{
                          'fa-tags': scope.row.type === 'pool',
                          'fa-desktop': scope.row.type === 'qemu' && !isTemplate(scope.row.template),
                          'fa-file-o qemu': scope.row.type === 'qemu' && isTemplate(scope.row.template),
                          'fa-database': scope.row.type === 'storage',
                          'fa-building': scope.row.type === 'node',
                          'fa-cube': scope.row.type === 'lxc' && !isTemplate(scope.row.template),
                          'fa-file-o lxc': scope.row.type === 'lxc' && isTemplate(scope.row.template),
                          }"></i>
                          <span class="m-icon-custom fa"
                                style="left: -10px; top: -1px;"
                                :class="setStautsCls(scope.row, scope.row.type)"></span>
                          <span>{{scope.row.type}}</span>
                        </span>
                     </template>
                   </el-table-column>
                   <el-table-column
                       label="描述"
                       width="120">
                     <template slot-scope="scope">
                        <span v-if="scope.row.type === 'pool'">pools</span>
                        <span v-if="scope.row.type === 'qemu' || scope.row.type === 'lxc'">{{scope.row.vmid + `${scope.row.name ? '(' + scope.row.name + ')': ''}`}}</span>
                        <span v-if="scope.row.type === 'storage'">{{scope.row.storage}}</span>
                        <span v-if="scope.row.type === 'node'">{{scope.row.node}}</span>
                     </template>
                   </el-table-column>
                   <el-table-column
                       prop="node"
                       label="节点"
                       width="120">
                   </el-table-column>
                   <el-table-column
                       prop="pool"
                       label="资源池"
                       width="120">
                   </el-table-column>
              </el-table>
           </div>
         </span>
      </div>
    </div>
    <template v-show="showCreateVm">
        <CreateQemuModal :showCreateVm="showCreateVm" v-if="showCreateVm" @close="showCreateVm=false"></CreateQemuModal>
    </template>
    <template v-show="visibleLxc">
        <CreateLxcModal :visible="visibleLxc" v-if="visibleLxc" @close="visibleLxc=false"></CreateLxcModal>
    </template>
    <div class="header-container-right">
      <ul class="header-container-content">
        <li class="header-container-content-item"><i class="fa fa-book"></i>文档</li>
        <li class="header-container-content-item" @click="showCreateVm = true"><i class="fa fa-desktop"></i>创建虚拟机</li>
        <li class="header-container-content-item" @click="() => visibleLxc = true"><i class="fa fa-cube"></i>创建CT</li>
        <li class="header-container-content-item" style="padding: 0 10px;" @click="() => visible = true"><i class="fa fa-list"></i><span>日志</span></li>
        <li class="header-container-content-item" style="background:#409eff;color: #fff;">
          <Dropdown trigger="click" icon="fa fa-user" @on-change="handleCommand"
          style="padding: 0px 10px;border: none;">
            <span slot="label">{{userid}}</span>
            <DropdownItem icon="fa fa-fw fa-key" command="psw">密码</DropdownItem>
            <DropdownItem icon="fa fa-fw fa-lock" command="TFA">TFA</DropdownItem>
            <DropdownItem icon="fa fa-fw fa-sign-out" command="layout">注销</DropdownItem>
          </Dropdown>
        </li>
      </ul>
    </div>
    <log-list :visible="visible" v-if="visible" @close="visible = false;"></log-list>
    <modify-psw-modal :visible="visiblePsw" v-if="visiblePsw" @close="visiblePsw = false;"></modify-psw-modal>
    <create-user-modal
        :title="title"
        :isCreate="isCreate"
        :param="param"
        :visible="visibleTfa"
        v-if="visibleTfa"
        :modal-type="type"
        @close="visibleTfa = false"
      ></create-user-modal>
  </div>
</template>

<script>
  import { stopEvent, quickSort } from "@libs/utils";
  import VuexMixins from '@src/mixins/VuexMixins';
  import Dropdown from '@src/components/dropdown/dropdown';
  import DropdownItem from '@src/components/dropdown/dropdownItem';
  import CreateQemuModal from './CreateQemuModal';
  import CreateLxcModal from './CreateLxcModal';
  import BaseIcon from '../icon/BaseIcon.vue';
  import LogList from './LogList';
  import ModifyPswModal from './ModifyPswModal';
  import MInput from '../input/mInput.vue';
  import CreateUserModal from '@src/views/home/dataCenter/access/user/CreateUserModal';

  export default {
    name: "PvHeader",
    mixins: [VuexMixins],
    components: {
      Dropdown,
      DropdownItem,
      CreateQemuModal,
      BaseIcon,
      LogList,
      CreateLxcModal,
      ModifyPswModal,
        MInput,
        CreateUserModal
    },
    data() {
      return {
        showSearchTable: false,
        searchModel: '',
        showCreateVm: false,
        visible: false,
        visibleLxc: false,
        visiblePsw: false,//是否展示修改密码页面
        userid: '',
        title: '',
        isCreate: false,
        type: '',
        param: {},
        visibleTfa: false
      }
    },
    computed: {
      /**
       * 过滤resource数据并根据type排序 升序
      */
      searchTable() {
        let _this = this;
        let datas =  _this.$store.state.db.resources.filter(item => {
          if (_this.searchModel && JSON.stringify(item).indexOf(_this.searchModel) > -1) {
            return item;
          }else if(_this.searchModel === ''){
            return item;
          }
        })
        return quickSort(datas, 'type', '+');
      }
    },
    methods: {
      /**
       * 处理登出 重置密码等
      */
      handleCommand(command) {
        switch (command) {
          case 'psw':
            this.visiblePsw = true;
            break;
          case 'TFA':
            this.type = 'tfa';
            this.isCreate = false;
            this.title = '二次验证';
            this.param = {'userid': this.userid};
            this.visibleTfa = true;
            break;
          case 'layout':
            this.$router.push('/login');
            break;
          default:
            return;
        }
      },
      __init__() {
        let ticket = window.localStorage.getItem('ticket') || "{}";
        this.userid = JSON.parse(ticket).username;
        console.log(this.userid);
        this.queryResource();
      },
      /**
       * 查询资源
      */
      queryResource() {
        this.$http.get('/json/cluster/resources').then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: 'resources',
              list: res.data
            })
          }
        })
      },
        //设置状态class
      setStautsCls(record, type) {
        let status = '';
        let objType = type;
        if (record.template && this.isTemplate(record.template)) {
            // 模板
            objType = 'template';
            status = type;
        } else {
            // 出其他以外的记录
            status = record.status ? record.status + ' ha-' + record.hastate : ' ha-' + record.hastate;
        }
        if (record.lock) {
            status += ' locked lock-' + record.lock;
        }
        return status;
      },
      /**
       * 判断是否为模板如果为undefined或者template为0则不是模板
      */
      isTemplate(tmpl) {
        if(tmpl && String(tmpl) !== '0') {
          return true;
        } else {
          return false;
        }
      },
      handelRowClick(row, columns, event) {
        this.updateSearchObj(row);
        this.showSearchTable =  false;
      },
      /***
       * 聚焦
      */
      searchModelFocus(e) {
        this.showSearchTable = true;
      },
      /**
       * 隐藏搜索
      */
      handleBlur() {
        setTimeout(() => {
          this.showSearchTable = false;
        }, 500)
      }
    },
    mounted() {
      this.__init__();
    }
  }
</script>

<style scoped lang="less">
  @import "./pv-header.less";
  /deep/.prefix-icon::after{
    color: #fff;
  }
</style>
