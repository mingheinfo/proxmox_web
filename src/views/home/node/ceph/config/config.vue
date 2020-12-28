<template>
   <div class="ceph-config">
     <div class="ceph-config-right">
       <div class="ceph-config-right_config">
         <overview-card>
           <div slot="title">配置</div>
           <div slot="content" class="card-content">
             <ace-editor v-model="config"
                         style="height: 300px;"
                         :read-only="true"></ace-editor>
           </div>
         </overview-card>
       </div>
       <div class="ceph-config-right_configdb">
         <overview-card>
           <div slot="title">配置数据库</div>
           <div slot="content" class="card-content">
             <el-table :data="configdb">
               <el-table-column label="WHO" prop=""></el-table-column>
               <el-table-column label="OPTION" prop=""></el-table-column>
               <el-table-column label="VALUE" prop=""></el-table-column>
             </el-table>
           </div>
         </overview-card>
       </div>
     </div>
     <div class="ceph-config-left">
       <overview-card>
         <div slot="title">Crush Map</div>
         <div slot="content" class="card-content">
           <ace-editor v-model="crush"
                       ref="left"
                       :read-only="true"></ace-editor>
         </div>
       </overview-card>
     </div>
   </div>
</template>

<script>
  import OverviewCard from '@src/components/card/OverviewCard';
  import CephHttp from '@src/views/home/node/ceph/http';
  import AceEditor from "@src/components/ace/AceEditor";
  import { on, off, throttle} from '@libs/utils/index';
  export default {
    name: "config",
    mixins: [CephHttp],
    components: {
      AceEditor,
      OverviewCard
    },
    data() {
      return {
        config: '',
        crush: '',
        configdb: []
      }
    },
    mounted() {
      this.__init__();
      this.$refs.left.$el.style.height = (this.$el.clientHeight + 60) + 'px';
      on(window, 'resize', this.repointLeft);
    },
    methods: {
      repointLeft() {
        throttle(() => {
          this.$refs.left.$el.style.height = (this.$el.clientHeight + 60) + 'px';
        }, 200)
      },
      __init__() {
        this.queryConfig('config',{_dc: new Date().getTime()})
          .then(res => {
            this.config = res;
          });
        this.queryConfig('crush', {_dc: new Date().getTime()})
          .then(res => {
            this.crush = res;
          });
        this.queryConfig('configdb')
          .then(res => {
            this.configdb = res;
          });
      }
    },
    beforeDestory() {
      off(window, 'resize', this.repointLeft);
    }
  }
</script>

<style scoped lang="less">
  .ceph-config{
    position: relative;
    display: flex;
    flex-grow: 1;
    &-right{
      flex: 1 1 auto;
      width: 0;
      font-size: 0;
      margin-right: 20px;
      &_config{
        height: calc(50% - 20px);
        margin-bottom: 40px;
        font-size: 14px;
      }
      &_configdb{
        height: calc(50% - 20px);
        font-size: 14px;
      }
    }
    &-left{
      flex: 1 1 auto;
      width: 0;
      height: 100%;
    }
  }
  .card{
    width: 100%;
  }
</style>
