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
                     type="password"
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
                required
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
          <div class="m-form__section" v-if="modalType === 'editDriveId'">
            <m-input
                style="width: 100%"
                v-model="ipconfig"
                label="网络设备"
                labelWidth="100px"
                :disabled="true"
            />
            <dl>
              <dt>IPV4</dt>
              <dd>
                <div>
                  <label class="m-input__radio">
                    <input
                        type="radio"
                        value="static"
                        name="ipv4"
                        v-model="ip4type"
                    />
                    <div></div>
                    <span>静态</span>
                  </label>
                  <label class="m-input__radio">
                    <input
                        type="radio"
                        value="dhcp"
                        name="ipv4"
                        v-model="ip4type"
                        @change="() => {
										ip ='';
										gw = '';
									}"
                    />
                    <div></div>
                    <span>DHCP</span>
                  </label>
                </div>
                <m-input v-model="ip"
                         prop="ip"
                         label="IPv4/CIDR"
                         labelWidth="100px"
                         validateEvent
                         @validate="validate"
                         required
                         :show-error="rules['ip'].error"
                         :error-msg="rules['ip'].message"
                         :disabled="ip4type !== 'static'"
                         placeholder="None"/>

                <m-input v-model="gw"
                         prop="gw"
                         label="网关(IPv4)"
                         labelWidth="100px"
                         validateEvent
                         @validate="validate"
                         required
                         placeholder="形如：10.10.10.0"
                         :show-error="rules['gw'].error"
                         :disabled="ip4type !== 'static'"
                         :error-msg="rules['gw'].message"/>
              </dd>
            </dl>

            <dl>
              <dt>IPV6</dt>
              <dd>
                <div>
                  <label class="m-input__radio">
                    <input
                        type="radio"
                        value="static"
                        name="ipv6"
                        v-model="ip6type"
                    />
                    <div></div>
                    <span>静态</span>
                  </label>
                  <label class="m-input__radio">
                    <input
                        type="radio"
                        value="dhcp"
                        name="ipv6"
                        v-model="ip6type"
                        @change="() => {
										ip6 ='';
										gw6 = '';
									}"
                    />
                    <div></div>
                    <span>DHCP</span>
                  </label>
                </div>
                <m-input v-model="ip6"
                         prop="ip6"
                         label="IPv6/CIDR"
                         labelWidth="100px"
                         validateEvent
                         @validate="validate"
                         required
                         :show-error="rules['ip6'].error"
                         :error-msg="rules['ip6'].message"
                         :disabled="ip6type !== 'static'"
                         placeholder="None"/>

                <m-input v-model="gw6"
                         prop="gw6"
                         label="网关(IPv6)"
                         labelWidth="100px"
                         validateEvent
                         @validate="validate"
                         required
                         :show-error="rules['gw6'].error"
                         placeholder="形如：2001:DB8::42"
                         :disabled="ip6type !== 'static'"
                         :error-msg="rules['gw6'].message"/>
              </dd>
            </dl>
          </div>
        </div>
      </template>
  </m-dialog>
</template>

<script>
  import VolumeHttp from "@src/views/home/qemu/volume/http";
  import { parseSSHKey, IP6_cidr_match, IP4_cidr_match, IP4_match, IP6_match } from '@libs/utils/index';
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
        ipconfig: '',
        sshkeys: '',
        ip4type: "static",
        ip6type: "static",
        ip: '',
        gw: '',
        ip6: '',
        gw6: '',
        rules: {
          sshkeys: {
            error: false,
            message: ''
          },
          ip: {
            error: false,
            message: ''
          },
          gw: {
            error: false,
            message: ''
          },
          ip6: {
            error: false,
            message: ''
          },
          gw6: {
            error: false,
            message: ''
          },
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
        this.rules[prop].error = false;
        this.rules[prop].message = ``;
        if(value && prop === 'sshkeys') {
          if(!parseSSHKey(this.sshkeys)) {
            this.rules[prop].error = true;
            this.rules[prop].message = `公钥格式不正确!`;
            return;
          }
        }
        if(value && prop === 'ip') {
          if(!IP4_cidr_match.test(value)) {
            this.rules[prop].error = true;
            this.rules[prop].message = 'IPv4/CIDR格式不正确!';
            return;
          }
        }
        if(value && prop === 'ip6') {
          if(!IP6_cidr_match.test(value)) {
            this.rules[prop].error = true;
            this.rules[prop].message = 'IPv6/CIDR格式不正确! 示例：2001:DB8::42/64';
            return;
          }
        }
        if(value && prop === 'gw') {
          if(!IP4_match.test(value)) {
            this.rules[prop].error = true;
            this.rules[prop].message = '网关格式不正确! 示例： 2001:DB8::42';
            return;
          }
        }
        if(value && prop === 'gw6') {
          if(!IP6_match.test(value)) {
            this.rules[prop].error = true;
            this.rules[prop].message = '网关格式不正确!';
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
             if(this.modalType === 'editDriveId') {
               let keys = Object.keys(_this.db.qemuConfigObj).filter(item => /^(ipconfig)\d$/.test(item));
               this.ipconfig = keys[0] && keys[0].replace('ipconfig', 'net') || 'net0';
               keys.forEach(key => {
                 if(/ip=dhcp/.test(_this.db.qemuConfigObj[key])) {
                   this.ip4type = 'dhcp';
                 }
                 if(/ip6=dhcp/.test(_this.db.qemuConfigObj[key])) {
                   this.ip6type = 'dhcp';
                 }
                 let configs = _this.db.qemuConfigObj[key].split(',');
                 for(let i = 0; i<configs.length; i++) {
                   if(/ip=/.test(configs[i])) {
                     this.ip = configs[i].split('=')[1] === 'dhcp' ? '' : configs[i].split('=')[1];
                   }
                   if(/gw=/.test(configs[i])) {
                     this.gw = configs[i].split('=')[1];
                   }
                   if(/ip6=/.test(configs[i])) {
                     this.ip6 = configs[i].split('=')[1] === 'dhcp' ? '' : configs[i].split('=')[1];
                   }
                   if(/gw6=/.test(configs[i])) {
                     this.gw6 = configs[i].split('=')[1];
                   }
                 }
               })
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
        let param = {};
        if(this.modalType === 'editDriveId') {
          /(\d)/.test(this.ipconfig);
          let ipconfig = '';
          if(this.ip && this.ip4type !== 'dhcp') {
            ipconfig += `ip=${this.ip},`;
          }
          if (this.ip4type === 'dhcp') {
            ipconfig += `ip=dhcp,`;
          }
          if (this.ip6 && this.ip6type !== 'dhcp'){
            ipconfig += `ip6=${this.ip6},`;
          }
          if (this.ip6type === 'dhcp') {
            ipconfig += `ip6=dhcp,`;
          }
          if (this.gw && this.ip4type !== 'dhcp') {
            ipconfig += `gw=${this.gw},`;
          }
          if (this.gw6 && this.ip6type !== 'dhcp') {
            ipconfig += `gw6=${this.gw6},`;
          }
          param[`ipconfig${RegExp.$1}`] = ipconfig.replace(/\,$/, '');
          param['digest'] = this.db.qemuConfigObj.digest;
        } else {
          param = {
            [this.param.type]:this[this.param.type],
            digest: this.db.qemuConfigObj.digest,
          };
          Object.keys(param).forEach((key) => {
            if (!param[key]) delete param[key];
          });
        }
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
