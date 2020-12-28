<template>
  <m-dialog :title="title"
            @close="close"
            @cancel="close"
            :visible="visible">
    <div slot="content">
      <page-template style="overflow-x: hidden;">
        <div slot="toolbar-right" style="flex: 2 1 auto;">
          <m-input prop="expire" labelWidth="60px" label="选择日期" style="vertical-align: top;" :__conStyle="{width: '355px'}">
            <template slot="other">
              <el-date-picker
                  v-model="datetime"
                  type="daterange"
                  format="yyyy-MM-dd hh:mm"
                  value-format="yyyy-MM-dd hh:mm"
                  placeholder="选择日期"
              >
              </el-date-picker>
            </template>
          </m-input>
          <m-button type="primary" style="vertical-align: middle;" @on-click="__init__()" icon="el-icon-refresh">更新</m-button>
        </div>
        <div slot="page-content">
              <ul class="log-content">
                <el-scrollbar style="height: 100%">
                  <li v-for="log in logList" :key="log.n">{{log.t}}</li>
                </el-scrollbar>
              </ul>
        </div>
      </page-template>
      <template slot="footer">
        <div></div>
      </template>
    </div>
  </m-dialog>
</template>

<script>
  import PageTemplate from "@src/components/page/PageTemplate";
  import AceEditor from "@src/components/ace/AceEditor";
  import CephHttp from '@src/views/home/node/ceph/http';
  import { dateFormat } from '@libs/utils/index';
  export default {
    name: "showLog",
    mixins: [CephHttp],
    components: {
      AceEditor,
      PageTemplate
    },
    props: {
      title: String,
      visible: Boolean,
      param: {
        type: Object,
        default: () => {
          return {}
        }
      },
      modalType: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        logList: [],
        interVal: null,
        datetime: [
          dateFormat(
            new Date(new Date().getTime() - 4 * 24 * 60 * 60 * 1000),
            "yyyy-MM-dd hh:mm"
          ),
          dateFormat(new Date(), "yyyy-MM-dd hh:mm"),
        ]
      }
    },
    mounted() {
      this.__init__();
      this.interVal = setInterval(() => {
        this.__init__()
      }, 3000);
    },
    methods: {
      __init__() {
          this.logContent = '';
          this.queryServiceLog(this.param.host, {
            service: `ceph-${this.modalType}@${this.param.name}`,
            _dc: new Date().getTime(),
            start: 0,
            limit: 500,
            since: this.datetime[0],
            until: this.datetime[1]
          }).then(res => {
            this.logList  = res;
          })
      },
      close() {
        this.$emit('close');
      }
    },
    beforeDestroy() {
      if(this.interVal) {
        clearInterval(this.interVal);
        this.interVal = null;
      }
    }
  }
</script>

<style scoped="" lang="less">
  .log-content{
    background: #333;
    color: #fff;
    height: 350px;
    line-height: 20px;
    font-family: "Courier New";
  }
  /deep/.tool-bar-right{
    flex-grow: 9!important;
  }
</style>
