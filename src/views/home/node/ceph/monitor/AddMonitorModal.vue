<template>
  <m-dialog  :title="title"
             :visible="visible"
             :_style="{
                maxHeight: '450px'
             }"
             @confirm="confirm"
             @cancel="close"
             @close="close">
    <div slot="content">
      <m-select prop="nodename"
                v-model="nodename"
                @on-change="(value) => nodename = value"
                vidateEvent
                @validate="validate"
                :show-error="rules['nodename'].error"
                :error-msg="rules['nodename'].message"
                label="主机"
                labelWidth="100px">
        <template v-for="(item, index) in nodeList">
          <m-option :label="item.node"
                    :key="item.node"
                    :value="item.node">
            <div class="table-tr" v-show="index === 0">
              <div class="table-td">名称</div>
              <div class="table-td">使用率</div>
              <div class="table-td">cpu</div>
            </div>
            <div class="table-tr">
              <div class="table-td">{{item.node}}</div>
              <div class="table-td" style="height: 28px; line-height: 28px;">
                <line-charts style="margin: 11px 0px;"
                    :value="
                  Number(
                    (item && item.maxmem && item.mem
                      ? item.mem / item.maxmem
                      : 0) * 100
                  )
                "
                ></line-charts>
              </div>
              <div class="table-td" style="height: 28px; line-height: 28px;">
                <line-charts style="margin: 11px 0px;"
                    :value="
                  Number(
                    (item && item.cpu ? item.cpu : 0) *
                      100
                  )
                "
                ></line-charts>
              </div>
            </div>
          </m-option>
        </template>
      </m-select>
      <m-dialog :visible="showLog">
        <template slot="content">
          <m-tab v-model="tab" @tab-click="handleTabChange">
            <m-tab-panel label="输出" name="log"></m-tab-panel>
            <m-tab-panel label="状态" name="status"></m-tab-panel>
          </m-tab>
          <m-button class="create-btn" type="primary" @on-click="stopTask1" :disabled="db.addClusterStatusObj.status !== 'running'"
          >停止</m-button>
          <el-scrollbar style="height: 100%">
            <div class="taskmodal-content">
              <div class="table" v-if="tab === 'log'">
                <div class="table-tr" v-for="item in db.addClusterLogList" :key="item.n">
                  {{item.t}}
                </div>
              </div>
              <div class="table" v-if="tab === 'status'">
                <template v-for="(item, key) in db.addClusterStatusObj">
                  <div class="table-tr" v-if="!['exitstatus', 'id', 'pstart'].includes(key)" :key="key">
                    <div class="table-td">{{$t(`clusterStatus.${key}`)}}</div>
                    <div class="table-td" v-if="key === 'starttime'">{{dateFormat(new Date(item * 1000), 'yyyy-MM-dd hh:mm')}}</div>
                    <div class="table-td" v-else>{{item}}</div>
                  </div>
                </template>
              </div>
            </div>
          </el-scrollbar>
        </template>
        <template slot="footer">
          <span></span>
        </template>
      </m-dialog>
    </div>
  </m-dialog>
</template>

<script>
  import CephHttp from "@src/views/home/node/ceph/http";
  import { byteToSize, quickSort,dateFormat } from '@libs/utils/index';
  import LineCharts from "@src/components/chart/line/LineCharts";
  export default {
    name: "AddMonitorModal",
    mixins: [CephHttp],
    components: {
      LineCharts
    },
    props: {
      modalType: String,
      title: String,
      visible: Boolean
    },
    data() {
      return {
        nodeList: [],
        nodename:'',
        showLog: false,
        tab: 'log',
        rules: {
          nodename: {
            error: false,
            message: ''
          }
        }
      }
    },
    mounted() {
      this.__init__();
    },
    methods: {
      dateFormat,
      __init__() {
        let _this = this;
        //当为虚拟机是过滤为添加的虚拟机
          //请求存储
          _this.queryNodes()
            .then(res => {
              _this.nodeList = quickSort(this.db.nodeList, 'node', '+');
            })
      },
      //关闭弹框
      close() {
        this.$emit('close')
      },
      //确定添加
      confirm() {
        if(this.modalType === 'mon') {
          //添加监控
          this.createMonitor('mon', this.nodename)
            .then(res => {
              this.showLog = true;
              this.interVal = setInterval(() => {
                this.queryStatus(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid)
              },  3000);
            });
        } else {
          this.validate('nodename');
          if(this.rules.nodename.error) return;
          //更新池
          this.createMonitor('mgr', this.nodename)
            .then(res => {
              this.close();
            });
        }
      },
      //校验
      validate(prop) {
        let value = String(this[prop]).trim();
        this.rules[prop].error = false;
        this.rules[prop].message = '';
        if(/^\s*$/.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = '不能为空!';
          return;
        }
      },
      stopTask1() {
        this.stopTask(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid);
      },
      closeLog() {
        this.showLog = false;
        this.close();
      },
      handleTabChange(value) {
        this.tab = value;
      },
    }
  }
</script>

<style scoped>

</style>
