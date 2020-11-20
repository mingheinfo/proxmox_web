<template>
  <div class="header-container">
    <div class="header-container-left">
      <div class="pve-logo"></div>
      <div class="pve-search">
        <label class="inline-block">Virtual Environment 6.0-4</label>
        <span class="inline-block">
           <input class="pv-form-input inline-block"
                  placeholder="搜索"
                  v-model="searchModel"
                  @focus.stop="searchModelFocus"/>
           <div class="pve-search-resource-table"
                tabindex="-1"
                v-show="showSearchTable"
                ref="searchRef"
                @blur="showSearchTable = false">
              <el-table :data="searchTable"
                        highlight-current-row
                        @row-click="handelRowClick">
                  <el-table-column
                      prop="type"
                      label="类别"
                      width="120">
                     <template slot-scope="scope">
                        <span>
                          <i :class="{
                          'fa fa-tags': scope.row.type === 'pool',
                          'fa fa-desktop': scope.row.type === 'qemu',
                          'fa fa-database': scope.row.type === 'storage',
                          'fa fa-building': scope.row.type === 'node'
                          }"></i>
                          <span>{{scope.row.type}}</span>
                        </span>
                     </template>
                   </el-table-column>
                   <el-table-column
                       label="描述"
                       width="120">
                     <template slot-scope="scope">
                        <span v-if="scope.row.type === 'pool'">pools</span>
                        <span v-if="scope.row.type === 'qemu'">{{scope.row.vmid + `${scope.row.name ? '(' + scope.row.name + ')': ''}`}}</span>
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
    <div class="header-container-right">
      <ul class="header-container-content">
        <li class="header-container-content-item"><i class="fa fa-book"></i>文档</li>
        <li class="header-container-content-item" @click="showCreateVm = true"><i class="fa fa-desktop"></i>创建虚拟机</li>
        <li class="header-container-content-item"><i class="fa fa-cube"></i>创建CT</li>
        <li class="header-container-content-item" style="padding: 0 10px;" @click="() => visible = true"><i class="fa fa-list"></i><span>日志</span></li>
        <li class="header-container-content-item" style="background:#409eff;color: #fff;">
          <Dropdown trigger="click" icon="fa fa-user" @on-change="handleCommand"
          style="padding: 0px 10px;border: none;">
            <span slot="label">root@pam</span>
            <DropdownItem icon="fa fa-gear" command="set">设置</DropdownItem>
            <DropdownItem icon="fa fa-fw fa-key" command="psw">密码</DropdownItem>
            <DropdownItem icon="fa fa-fw fa-lock" command="TFA">TFA</DropdownItem>
            <DropdownItem icon="fa fa-fw fa-sign-out" command="layout">注销</DropdownItem>
          </Dropdown>
        </li>
      </ul>
    </div>
    <log-list :visible="visible" @close="visible = false;"></log-list>
  </div>
</template>

<script>
  import { stopEvent } from "@libs/utils";
  import VuexMixins from '@src/mixins/VuexMixins';
  import Dropdown from '@src/components/dropdown/dropdown';
  import DropdownItem from '@src/components/dropdown/dropdownItem';
  import CreateQemuModal from './CreateQemuModal';
  import BaseIcon from '../icon/BaseIcon.vue';
  import LogList from './LogList';

  export default {
    name: "PvHeader",
    mixins: [VuexMixins],
    components: {
      Dropdown,
      DropdownItem,
      CreateQemuModal,
      BaseIcon,
      LogList
    },
    data() {
      return {
        showSearchTable: false,
        searchModel: '',
        showCreateVm: false,
        visible: false
      }
    },
    computed: {
      searchTable() {
        let _this = this;
        return _this.$store.state.db.resources.filter(item => {
          if (_this.searchModel && JSON.stringify(item).indexOf(_this.searchModel) > -1) {
            return item;
          }else if(_this.searchModel === ''){
            return item;
          }
        })
      }
    },
    methods: {
      handleCommand(command) {
        switch (command) {
          case 'set':
            break;
          case 'psw':
            break;
          case 'TFA':
            break;
          case 'layout':
            this.$router.push('/login');
            break;
          default:
            return;
        }
      },
      __init__() {
        this.queryResource();
      },
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
      handelRowClick(row, columns, event) {
        this.updateSearchObj(row);
        this.showSearchTable =  false;
      },
      searchModelFocus(e) {
        stopEvent(e);
        this.showSearchTable = true;
      }
    },
    mounted() {
      this.__init__();
    }
  }
</script>

<style scoped lang="less">
  @import "./pv-header.less";
</style>
