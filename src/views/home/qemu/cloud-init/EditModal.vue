<template>
  <m-dialog :visible="visible"
            :title="title"
            @cancel="close"
            @close="close"
            @confirm="confirm">
      <template slot="content">
        <div class="m-form__content">
          <div class="m-form__section" v-if="modalType === 'editUser'">
            <m-input label="用户" prop="ciuser"
                     v-model="ciuser"
                     labelWidth="110px"/>
          </div>
          <div class="m-form__section" v-if="modalType === 'editPassword'">
            <m-input label="密码" prop="cipassword"
                     v-model="cipassword"
                     labelWidth="110px"/>
          </div>
          <div class="m-form__section" v-if="modalType === 'editDnsDomain'|| modalType === 'editDnsServer'">
            <m-input label="DNS域" prop="searchdomain"
                     v-model="searchdomain"
                     labelWidth="110px"/>
            <m-input label="DNS服务器" prop="nameserver"
                     v-model="nameserver"
                     labelWidth="110px"/>
          </div>
          <div class="m-form__section" v-if="modalType === 'editSsh'">
            <m-input
                style="width: 100%"
                v-model="sshkeys"
                type='textarea'
                prop="sshkeys"
                label="SSH公钥"
                :rows="10"
                labelWidth="100px"
                validateEvent
                :show-error="rules['sshkeys'].error"
                :error-msg="rules['sshkeys'].message"
                @validate="validate"
                :__conStyle="{'width': '300px'}"
                placeholder="请输入ssh公钥"
            />
            <m-button type="primary" style="position: relative;">
              <input type="file" ref="uploadFile" @change="uploadSsh" class="upload-input"/>
              加载SSH秘钥文件
            </m-button>
          </div>
        </div>
      </template>
  </m-dialog>
</template>

<script>
  import VolumeHttp from "@src/views/home/qemu/volume/http";
  import { parseSSHKey } from '@libs/utils/index';
  export default {
    name: "EditModal",
    mixins: [VolumeHttp],
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      modalType:{
        type: String,
        default: ''
      },
      title: {
        type: String,
        default: ''
      },
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        ciuser: '',
        cipassword: '',
        searchdomain: '',
        nameserver: '',
        ipconfig0: '',
        sshkeys: '',
        rules: {
          sshkeys: {
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
      //校验ssh
      validate(prop) {
        let value = String(this[prop]).trim();
        if(value && prop === 'sshkeys') {
          if(!parseSSHKey(this.sshkeys)) {
            this.rules[prop].error = true;
            this.rules[prop].message = `公钥格式不正确!`;
            return;
          }
        }
      },
      validateAll() {
        let props = [];
        if(this.modalType === 'editSsh') {
          props = ['sshkeys'];
        }
        props.forEach(prop => this.validate(prop));
        return props.some(prop => this.rules[prop].error === true);
      },
      /**
       * 上传ssh
       */
      uploadSsh() {
        let file = this.$refs.uploadFile.files[0],
          rs = new FileReader();
        rs.onload = (e) => {
          if(e.target.readyState === 2) {
            this.sshkeys = e.target.result;
          }
        }
        rs.readAsText(file);
      },
      //初始化操作
      __init__() {
        let _this = this;
        _this.queryConfig({ _dc: new Date().getTime() }).then((res) => {
          if(_this.db.qemuConfigObj)
          Object.keys(_this.db.qemuConfigObj).forEach((key) => {
             if(['ciuser', 'cipassword', 'searchdomain', 'nameserver', 'sshkeys'].indexOf(key) > -1) {
               _this[key] = _this.db.qemuConfigObj[key];
             }
          });
        });
      },
      //关闭修改弹框
      close() {
        this.$emit('close')
      },
      //点击确认按钮触发回调
      confirm() {
        if(this.validateAll()) return;
        let param = {
          [this.param.type]:this[this.param.type],
          digest: this.db.qemuConfigObj.digest,
        };
        Object.keys(param).forEach((key) => {
          if (!param[key]) delete param[key];
        });
        this.updateHardWare(param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm.confirm({
              msg: res,
            });
          });
      }
    }
  }
</script>

<style scoped>

</style>
