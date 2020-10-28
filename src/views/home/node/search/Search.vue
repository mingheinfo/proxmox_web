<template>
  <div class="search">
    <div class="search-content">
        <span class="search-input">
          <input class="pv-form-input inline-block"
                 placeholder="搜索"
                 v-model="searchModel"/>
        </span>
    </div>
    <el-table :data="searchTable"
              highlight-current-row
              @row-click="handleRowClick">
      <el-table-column
          prop="type"
          label="类别">
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
          label="描述">
        <template slot-scope="scope">
          <span v-if="scope.row.type === 'pool'">pools</span>
          <span v-if="scope.row.type === 'qemu'">{{scope.row.vmid + `${scope.row.name ? '(' + scope.row.name + ')' : ' '}`}}</span>
          <span v-if="scope.row.type === 'storage'">{{scope.row.storage}}</span>
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
  </div>
</template>

<script>
  import VuexMixins from '@src/mixins/VuexMixins';
  import LineCharts from '@src/components/chart/line/LineCharts';
  import { render_uptime } from '@libs/utils/'
  export default {
    name: "index",
    mixins: [VuexMixins],
    components: {
      'line-charts': LineCharts
    },
    data() {
      return {
        searchModel: '',
        intervalId: null,
        data: []
      }
    },
    computed: {
      searchTable() {
        let _this = this;
        return _this.data.filter(item => {
          if (_this.searchModel && JSON.stringify(item).indexOf(_this.searchModel) > -1) {
            return item;
          }else if(_this.searchModel === ''){
            return item;
          }
        })
      }
    },
    methods: {
      render_uptime,
      handleRowClick(row, columns, event) {
        this.updateSearchObj(row);
      },
      __init__() {
        this.queryResource();
      },
      queryResource() {
        this.$http.get('/json/cluster/resources').then((res) => {
          if (res.data) {
            let last = window.localStorage.getItem("lastsel") || '[]';
            this.data = res.data.filter(item => item.node === (JSON.parse(last).text && JSON.parse(last).text) && item.type !== 'node');
          }
        })
      },
    },
    mounted() {
      this.__init__();
      this.intervalId = setInterval(() => this.__init__(), 3000);
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
    }
    &-input{
      width: 300px;
      display: inline-block;
      padding-bottom: 20px;
    }
  }
</style>
