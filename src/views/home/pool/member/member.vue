<template>
  <page-template>
    <div slot="toolbar-left">
      <m-dropdown   trigger="click"
                    icon="fa fa-user"
                    @on-change="handleCommand"
                    style="
                      width: 8rem;
                      height: 30px;
                      line-height: 30px;
                      color: #fff !important;">
        <span slot="label">
          <m-button
              type="primary"
              style="position: absolute; left: -1px; top: -1px; right: -1px"
              icon="el-icon-plus"
          >添加</m-button
          >
        </span>
        <m-dropdown-item command="qemu" icon="fa fa-desktop">虚拟机</m-dropdown-item>
        <m-dropdown-item command="storage" icon="fa fa-database">存储</m-dropdown-item>
      </m-dropdown>
      <m-button
          type="danger"
          icon="el-icon-delete"
          :disabled="selectedList.length <=0"
          v-confirm="{
            msg: '确定要删除所选择项吗?',
            icon: 'icon-warning',
            ok: deleteResourceToPool
          }"
      >删除</m-button
      >
    </div>
    <div slot="page-content">
      <el-table :data="members"
                @selection-change="handleSelect"
                @sort-change="handleSort">
        <el-table-column type="selection" width="55px"></el-table-column>
        <el-table-column label="类别" sortable prop="type">
          <template slot-scope="scope">
            <i :class="setCls(scope.row)" class="m-icon-custom"></i>
            <span>{{scope.row.type}}</span>
          </template>
        </el-table-column>
        <el-table-column label="描述" prop="name">
          <template slot-scope="scope">
            {{(scope.row.type === 'qemu' || scope.row.type === 'lxc') ? `${scope.row.vmid}(${scope.row.name})` : `${scope.row.storage}(${scope.row.node})`}}
          </template>
        </el-table-column>
        <el-table-column label="磁盘使用率">
          <template slot-scope="scope">
            <line-charts
                :value="
                  Number(
                    (scope && scope.row && scope.row.maxdisk && scope.row.disk
                      ? scope.row.disk / scope.row.maxdisk
                      : 0) * 100
                  )
                "
            ></line-charts>
          </template>
        </el-table-column>
        <el-table-column label="内存使用率">
          <template slot-scope="scope">
            <line-charts
                :value="
                  Number(
                    (scope && scope.row && scope.row.maxmem && scope.row.mem
                      ? scope.row.mem / scope.row.maxmem
                      : 0) * 100
                  )
                "
            ></line-charts>
          </template>
        </el-table-column>
        <el-table-column label="Cpu使用率">
          <template slot-scope="scope">
            <line-charts
                :value="
                  Number(
                    (scope && scope.row && scope.row.cpu ? scope.row.cpu : 0) *
                      100
                  )
                "
            ></line-charts>
          </template>
        </el-table-column>
        <el-table-column label="运行时间">
          <template slot-scope="scope">
              <span style="font-size: 12px">{{
                scope.row.uptime ? render_uptime(scope.row.uptime) : "-"
              }}</span>
          </template>
        </el-table-column>
      </el-table>
      <add-pool-modal v-if="visible"
                      :visible="visible"
                      :title="title"
                      @close="visible = false;__init__()"
                      :modalType="modalType"></add-pool-modal>
    </div>
  </page-template>
</template>

<script>
  import LineCharts from "@src/components/chart/line/LineCharts";
  import PageTemplate from "@src/components/page/PageTemplate";
  import { quickSort, render_uptime, setIconCls } from '@libs/utils/index';
  import PoolsHttp from "@src/views/home/pool/http";
  import AddPoolModal from './AddPoolModal';
  export default {
    name: "member",
    mixins: [PoolsHttp],//混入请求
    components: {
      PageTemplate,
      "line-charts": LineCharts,
      AddPoolModal
    },
    mounted() {
      //初始化请求
      this.__init__();
    },
    data() {
      return {
        members: [],
        selectedList: [],
        visible: false,
        modalType: '',
        typeDefaults: {
          node: {
            iconCls: "fa fa-building",
          },
          pool: {
            iconCls: "fa fa-tags",
          },
          storage: {
            iconCls: "fa fa-database",
          },
          qemu: {
            iconCls: "fa fa-desktop",
          },
          lxc: {
            //iconCls: 'x-tree-node-lxc',
            iconCls: "fa fa-cube",
          },
          template: {
            iconCls: "fa fa-file-o",
          },
        }
      }
    },
    methods: {
      render_uptime,
      //初始化操作查看资源池成员
      __init__() {
        this.queryPoolList()
            .then(() => {
               this.members = quickSort(this.db.poolsObj.members, 'type', '+');
            })
      },
      //排序
      handleSort({sort, prop}) {
        if(!prop) return;
        this.members = quickSort(this.db.poolsObj.members, prop, sort==='decreasing' ? '-' : '+');
      },
      //多选
      handleSelect(row) {
        this.selectedList = row;
      },
      //资源池中添加资源
      handleCommand(command) {
         switch (command) {
           case 'qemu':
             this.visible = true;
             this.modalType = command;
             this.title = '虚拟机';
             break;
           case 'storage':
             this.visible = true;
             this.modalType = command;
             this.title = '存储';
             break;
         }
      },
      setCls(row){
        return setIconCls(row, this.typeDefaults).iconCls
      }
    }
  }
</script>

<style scoped>

</style>
