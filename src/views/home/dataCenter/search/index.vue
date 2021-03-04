<template>
  <page-template>
      <div slot="toolbar-right" style="text-align: right;padding-right: 10px;">
        <span class="search-input">
          <m-input placeholder="搜索"
                   v-model="searchModel"/>
        </span>
      </div>
      <template slot="page-content">
         <el-table :data="chunkData(searchTable, pageSize)[currentPage - 1]"
                highlight-current-row
                @row-click="handleRowClick">
        <el-table-column
            prop="type"
            label="类别">
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
            label="描述">
          <template slot-scope="scope">
            <span v-if="scope.row.type === 'pool'">pools</span>
            <span v-if="scope.row.type === 'qemu' || scope.row.type === 'lxc'">{{scope.row.vmid + `${scope.row.name ? '(' +scope.row.name +')' : ''}`}}</span>
            <span v-if="scope.row.type === 'storage'">{{scope.row.storage}}({{scope.row.node}})</span>
            <span v-if="scope.row.type === 'node'">{{scope.row.node}}</span>
          </template>
        </el-table-column>
        <el-table-column
            prop="node"
            label="磁盘使用率">
          <template slot-scope="scope">
            <line-charts :value="Number((scope && scope.row && scope.row.maxdisk && scope.row.disk ? (scope.row.disk / scope.row.maxdisk) : 0)*100)"></line-charts>
          </template>
        </el-table-column>
        <el-table-column
            prop="pool"
            label="内存使用率">
          <template slot-scope="scope">
            <line-charts :value="Number((scope && scope.row && scope.row.maxmem && scope.row.mem ? (scope.row.mem / scope.row.maxmem) : 0)*100)"></line-charts>
          </template>
        </el-table-column>
        <el-table-column
            prop="pool"
            label="CPU使用率">
          <template slot-scope="scope">
            <line-charts :value="Number((scope && scope.row && scope.row.cpu ? (scope.row.cpu) : 0)*100)"></line-charts>
          </template>
        </el-table-column>
        <el-table-column
            prop="pool"
            label="运行时间">
          <template slot-scope="scope">
             {{scope.row.uptime ? render_uptime(scope.row.uptime) : '-'}}
          </template>
        </el-table-column>
      </el-table>
       <el-pagination  class="page-table-pagination"
          @size-change="(val) => {pageSize = val; __init__()}"
          @current-change="(val) => {currentPage = val; __init__()}"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40, 50]"
          :page-size="pageSize"
          :total="searchTable.length"
          small
          layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
      </template>
  </page-template>
</template>

<script>
  import VuexMixins from '@src/mixins/VuexMixins';
  import LineCharts from '@src/components/chart/line/LineCharts';
  import { render_uptime, quickSort, chunkData} from '@libs/utils/'
  import PageTemplate from "@src/components/page/PageTemplate";
  export default {
    name: "index",
    mixins: [VuexMixins],
    components: {
      'line-charts': LineCharts,
      PageTemplate
    },
    data() {
      return {
        searchModel: '',
        intervalId: null,
        data: [],
        currentPage: 1,
        pageSize: 10,
      }
    },
    computed: {
      searchTable() {
        let _this = this;
        let datas =  _this.data.filter(item => {
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
      render_uptime,
      chunkData,
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
      handleRowClick(row, columns, event) {
        this.updateSearchObj(row);
      },
      __init__() {
        this.queryResource();
      },
      isTemplate(tmpl) {
        if(tmpl && String(tmpl) !== '0') {
          return true;
        } else {
          return false;
        }
      },
      queryResource() {
        this.$http.get('/json/cluster/resources').then((res) => {
          if (res.data) {
            this.data = res.data;
          }
        })
      },
    },
    mounted() {
      this.__init__();
      this.intervalId = setInterval(() => this.__init__(), 10000);
    },
    beforeDestroy() {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
</script>

<style scoped lang="less">
 .search{
   padding: 20px;
   &-content{
     text-align: right;
     height: 45px;
     line-height: 45px;
   }
   &-input{
     width: 300px;
     display: inline-block;
     padding-bottom: 20px;
   }
 }
 /deep/.el-table td{
   padding: 0px;
 }
</style>
