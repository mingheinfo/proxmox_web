<template>
  <m-dialog :visible="visible"
            @cancel="close"
            :title="title"
            @close="close">
    <template slot="content">
       <div class="m-form__content">
         <div class="m-form__section">
           <m-select v-model="dev"
                     labelWidth="100px"
                     prop="dev"
                     label="磁盘"
                     @on-change="value => dev = value"
                     validateEvent
                     @validate="validate"
                     :show-error="rules['dev'].error"
                     :error-msg="rules['dev'].message">
             <template v-for="(item, index) in unusedStorageList">
               <m-option :key="item.devpath"
                         :label="item.devpath"
                         :value="item.devpath">
                 <div v-if="index === 0" class="table-tr">
                   <div class="table-td">设备</div>
                   <div class="table-td">大小</div>
                   <div class="table-td">串行</div>
                 </div>
                 <div class="table-tr">
                   <div class="table-td">{{item.devpath}}</div>
                   <div class="table-td">{{byteToSize(item.size)}}</div>
                   <div class="table-td">{{item.serial}}</div>
                 </div>
               </m-option>
             </template>
           </m-select>

           <m-select v-model="db_dev"
                     labelWidth="100px"
                     prop="db_dev"
                     label="数据库磁盘"
                     @on-change="value => db_dev = value">
             <template v-for="(item, index) in journalStorageList">
               <m-option :key="item.devpath"
                         :label="item.devpath"
                         :value="item.devpath">
                 <div v-if="index === 0" class="table-tr">
                   <div class="table-td">设备</div>
                   <div class="table-td">大小</div>
                   <div class="table-td">串行</div>
                 </div>
                 <div class="table-tr">
                   <div class="table-td">{{item.devpath}}</div>
                   <div class="table-td">{{byteToSize(item.size)}}</div>
                   <div class="table-td">{{item.serial}}</div>
                 </div>
               </m-option>
             </template>
           </m-select>

           <m-input  v-model="db_size"
                     type="number"
                     labelWidth="100px"
                     prop="db_size"
                     label="数据库大小（Gib）"
                     min="0"
                     :disabled="!db_dev"/>

           <template v-if="isAdvice">
             <m-checkbox labelWidth="100px" label="加密OSD" v-model="encrypted"></m-checkbox>

             <m-select v-model="wal_dev"
                       labelWidth="100px"
                       porp="wal_dev"
                       label="WAL磁盘"
                       @on-change="value => wal_dev = value">
               <template v-for="(item, index) in journalStorageList">
                 <m-option :key="item.devpath"
                           :label="item.devpath"
                           :value="item.devpath">
                   <div v-if="index === 0" class="table-tr">
                     <div class="table-td">设备</div>
                     <div class="table-td">大小</div>
                     <div class="table-td">串行</div>
                   </div>
                   <div class="table-tr">
                     <div class="table-td">{{item.devpath}}</div>
                     <div class="table-td">{{byteToSize(item.size)}}</div>
                     <div class="table-td">{{item.serial}}</div>
                   </div>
                 </m-option>
               </template>
             </m-select>

             <m-input  v-model="wal_size"
                       type="number"
                       labelWidth="100px"
                       porp="wal_size"
                       label="WAL磁盘大小（Gib）"
                       min="0"
                       :disabled="!wal_dev"/>
           </template>
         </div>
       </div>
    </template>
    <template slot="footer">
      <div class="label_box">
        <label>
          <input type="checkbox" v-model="isAdvice" />
          <div>高级</div>
        </label>
      </div>
      <m-button class="create-btn" type="primary" @on-click="confirm"
      >创建</m-button
      >
    </template>
  </m-dialog>
</template>

<script>
  import CephHttp from '@src/views/home/node/ceph/http';
  import { quickSort, byteToSize } from '@libs/utils/index';
  export default {
    name: "CreateOsd",
    mixins: [CephHttp],
    props: {
      visible: {
        type: Boolean,
      },
      title: {
        type: String,
      }
    },
    data() {
      return {
        unusedStorageList: [],
        journalStorageList: [],
        dev: '',
        db_dev: '',
        db_size: '',
        encrypted: false,
        wal_dev: '',
        wal_size: '',
        isAdvice: '',
        rules: {
          dev: {
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
      byteToSize,
      __init__() {
        this.queryDisk({type: 'unused'})
            .then(res => {
              this.unusedStorageList = quickSort(res, 'devpath', '+');
           })
        this.queryDisk({type: 'journal_disks'})
          .then(res => {
            this.journalStorageList = quickSort(res, 'devpath', '+');
          })
      },
      validate(prop) {
        let value = String(this[prop]).trim();
        this.rules[prop].error = false;
        this.rules[prop].message =  '';
        if(/^\s*$/.test(value) && prop === 'dev') {
          this.rules[prop].error = true;
          this.rules[prop].message =  '不能为空!';
          return;
        }
      },
      //整体校验
      validateAll() {
        let props = ['dev'];
        props.forEach(prop => this.validate(prop));
        return props.some(prop => this.rules[prop].error === true);
      },
      close() {
        this.$emit('close');
      },
      confirm() {
         if(this.validateAll()) return;
         let param = {
           dev: this.dev,
           db_dev: this.db_dev,
           db_size: this.db_size
         }
         if(this.isAdvice) {
           param = Object.assign(param, {encrypted: this.encrypted ? 1 : 0, wal_dev: this.wal_dev, wal_size: this.wal_size})
         }
         this.createOsd(param)
           .then(res => {
             this.close();
           })
      }
    }
  }
</script>

<style scoped>

</style>
