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
      <el-table :data="qemuList" height="300"
                @selection-change="handleSelect"
                v-if="modalType === 'qemu'">
        <el-table-column type="selection" width="55px"></el-table-column>
        <el-table-column label="ID" prop="vmid"></el-table-column>
        <el-table-column label="节点" prop="node"></el-table-column>
        <el-table-column label="状态" prop="status"></el-table-column>
        <el-table-column label="名称" prop="name"></el-table-column>
        <el-table-column label="类别" prop="type"></el-table-column>
      </el-table>
      <m-select prop="storage"
                v-model="storage"
                @on-change="(value) => storage = value"
                vidateEvent
                @validate="validate"
                :show-error="rules['storage'].error"
                :error-msg="rules['storage'].message"
                label="存储"
                v-else
                labelWidth="100px">
        <template v-for="(item, index) in storageList">
          <m-option :label="item.storage"
                    :key="item.storage"
                    :value="item.storage">
            <div class="table-tr" v-show="index === 0">
              <div class="table-td">名称</div>
              <div class="table-td">类别</div>
              <div class="table-td">可用</div>
              <div class="table-td">容量</div>
            </div>
            <div class="table-tr">
              <div class="table-td">{{item.storage}}</div>
              <div class="table-td">{{item.type}}</div>
              <div class="table-td">{{byteToSize(item.avail)}}</div>
              <div class="table-td">{{byteToSize(item.total)}}</div>
            </div>
          </m-option>
        </template>
      </m-select>
    </div>
  </m-dialog>
</template>

<script>
  import PoolsHttp from "@src/views/home/pool/http";
  import { byteToSize, quickSort } from '@libs/utils/index';
  export default {
    name: "AddPoolModal",
    mixins: [PoolsHttp],
    props: {
      modalType: String,
      title: String,
      visible: Boolean
    },
    data() {
      return {
        qemuList: [],
        storageList: [],
        selectedList: [],
        storage:'',
        rules: {
          storage: {
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
        let _this = this;
        //当为虚拟机是过滤为添加的虚拟机
        if(_this.modalType === 'qemu') {
          let list = _this.db.poolsObj.members.map(it => {
             return it.name;
          })
          _this.queryResource()
              .then(res => {
                _this.qemuList = _this.db.resources.filter(item => {
                  if((item.type === 'qemu' || item.type === 'lxc' )&& !list.includes(item.name)) {
                    return item;
                  }
                })
              })
        } else {
          //请求存储
          _this.queryStorage({format: 1})
            .then(res => {
              _this.storageList = quickSort(this.db.storageList, 'storage', '+');
            })
        }
      },
      //关闭弹框
      close() {
        this.$emit('close')
      },
      //确定添加
      confirm() {
        if(this.modalType === 'qemu') {
          if(this.selectedList.length <=0) return;
          let param = {
            vms: this.selectedList.map(item => item.vmid).join(',')
          }
          //更新池
          this.updatePool(param)
            .then(res => {
              this.close();
            });
        } else {
          this.validate('storage');
          let param = {
            storage: this.storage
          }
          if(this.rules.storage.error) return;
          //更新池
          this.updatePool(param)
            .then(res => {
              this.close();
            });
        }
      },
      //多选
      handleSelect(row) {
        this.selectedList = row;
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
      }
    }
  }
</script>

<style scoped>

</style>
