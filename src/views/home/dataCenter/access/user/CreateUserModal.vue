<template>
  <Dialog
    :visible="visible"
    :title="title"
    :_style="{ width: '956px' }"
    @close="$emit('close')"
  >
    <div slot="content" style="max-height: 500px">
      <div
        class="m-form__content"
        v-if="['create', 'edit'].includes(modalType)"
      >
        <div class="m-form__section">
          <dl>
            <dt>基本信息</dt>
            <dd>
              <m-input
                type="text"
                prop="username"
                labelWidth="100px"
                label="用户名"
                v-model="username"
                validateEvent
                @validate="validate"
                required
                :show-error="rules.username.error"
                :error-msg="rules.username.message"
                :disabled="modalType !== 'create'"
                placeholder="请输入用户名"
              />
              <m-input
                type="text"
                prop="lastname"
                labelWidth="100px"
                label="名"
                v-model="lastname"
                placeholder="请输入名"
              />
              <m-select
                prop="realm"
                label="领域"
                labelWidth="100px"
                @on-change="handleRealmSelect"
                v-model="realm"
                validateEvent
                @validate="validate"
                required
                :show-error="rules.realm.error"
                :error-msg="rules.realm.message"
                :readonly="false"
                placeholder="请选择领域"
              >
                <m-option
                  v-for="item in realmList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </m-option>
              </m-select>
              <m-input
                type="text"
                prop="firstname"
                labelWidth="100px"
                label="姓"
                v-model="firstname"
                placeholder="请输入姓"
              />
              <m-select
                type="multiple"
                prop="groups"
                label="组"
                labelWidth="100px"
                @on-change="handleGroupSelect"
                v-model="groups"
                validateEvent
                @validate="validate"
                required
                :show-error="rules.groups.error"
                :error-msg="rules.groups.message"
                :readonly="false"
                placeholder="请选择组"
              >
                <m-option
                  v-for="(item, index) in db.groupsList"
                  :key="item.groupid"
                  :label="item.groupid"
                  :value="item.groupid"
                >
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">组</span>
                        <span class="table-td">备注</span>
                        <span class="table-td">用户</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td" :title="item.groupid">{{ item.groupid }}</span>
                      <span class="table-td" :title="item.comment">{{ item.comment }}</span>
                      <span class="table-td" :title="item.users">
                        {{ item.users }}
                      </span>
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-input
                type="text"
                prop="email"
                labelWidth="100px"
                label="E-Mail"
                v-model="email"
                validateEvent
                @validate="validate"
                required
                :show-error="rules.email.error"
                :error-msg="rules.email.message"
                placeholder="请输入Email"
              />
              <m-input prop="comment" labelWidth="100px" :__conStyle="{'width': '202px'}" label="选择日期">
                <template slot="other">
                  <el-date-picker
                    v-model="expire"
                    type="date"
                    placeholder="永久有效"
                  >
                  </el-date-picker>
                </template>
              </m-input>
              <m-input
                type="textarea"
                prop="comment"
                labelWidth="100px"
                label="备注"
                v-model="comment"
                placeholder="请输入备注"
              />
              <m-checkbox
                label="已启用"
                v-model="enable"
                labelWidth="100px"
              ></m-checkbox>
            </dd>
          </dl>
          <dl v-if="isAdvice">
            <dt>高级</dt>
            <dd>
              <m-input
                type="textarea"
                prop="keys"
                labelWidth="100px"
                label="Key IDs"
                v-model="keys"
                placeholder="请输入Key IDs"
              />
            </dd>
          </dl>
        </div>
      </div>
      <div class="m-form_content" v-else-if="modalType === 'modifyPsw'">
        <div class="m-form__section">
          <dl>
            <dt>基本信息</dt>
            <dd>
              <m-input
                type="password"
                prop="password"
                labelWidth="100px"
                label="密码"
                v-model="password"
                validateEvent
                @validate="validate"
                required
                :show-error="rules.password.error"
                :error-msg="rules.password.message"
                placeholder="请输入密码"
              />
              <m-input
                type="password"
                prop="confirmPsw"
                labelWidth="100px"
                label="确认密码"
                v-model="confirmPsw"
                validateEvent
                @validate="validate"
                required
                :show-error="rules.confirmPsw.error"
                :error-msg="rules.confirmPsw.message"
                placeholder="请输入确认密码"
              />
            </dd>
          </dl>
        </div>
      </div>
      <div class="m-form_content" v-else-if="modalType === 'tfa'">
        <m-tab v-model="tfa_type" @tab-click="handleTabChange">
          <m-tab-panel name="totp" label="TOTP">
          </m-tab-panel>
          <m-tab-panel name="uf2" label="UF2"></m-tab-panel>
        </m-tab>
        <div v-show="tfa_type === 'totp'">
            <div class="m-form__section" >
              <dl>
                <dt>基本信息</dt>
                <dd>
                  <m-input
                    type="text"
                    prop="username"
                    labelWidth="100px"
                    label="用户名"
                    v-model="username"
                    :disabled="true"
                    placeholder="请输入用户名"
                  />
                  <m-input
                    type="text"
                    prop="issuer"
                    labelWidth="100px"
                    label="发行者名称"
                    v-model="issuer"
                    placeholder="请输入发行者名称"
                  />
                  <m-input
                    type="text"
                    prop="secret"
                    labelWidth="100px"
                    label="Secret"
                    v-model="secret"
                    validateEvent
                    @validate="validate"
                    :show-error="rules.secret.error"
                    :error-msg="rules.secret.message"
                    placeholder="请输入Secret"
                  />
                  <m-button type="primary" @on-click="randomizeSecret">随机化</m-button>
                  <div id="canvas" style="margin: 0 auto; padding-bottom: 20px;width: 345px;"></div>
                  <m-input
                    type="text"
                    prop="challenge"
                    labelWidth="100px"
                    label="验证码"
                    v-model="challenge"
                    validateEvent
                    @validate="validate"
                    required
                    :show-error="rules.challenge.error"
                    :error-msg="rules.challenge.message"
                    placeholder="请输入验证码"
                  />
                </dd>
              </dl>
            </div>
        </div>
        <div v-show="tfa_type == 'uf2'">
          要注册U2F设备，请连接设备，然后单击按钮并按照说明进行操作。
        </div>
      </div>
      <div class="m-form_content" v-else>
        <el-tree :data="permissionTreeData">
          <span slot-scope="{node, data}" style="display: flex; flex-grow: 1; justify-content: space-between;">
            <div>
              <i :class="data.icon"></i>
              <span>{{node.label}}</span>
            </div>
            <div v-if="data.value">{{data.value === 1 ?  '是' : '否'}}</div>
          </span>
        </el-tree>
      </div>
    </div>
    <template slot="footer">
      <template>
        <div class="label_box" v-if="modalType === 'create'">
          <label>
            <input type="checkbox" v-model="isAdvice" />
            <div>高级</div>
          </label>
        </div>
        <m-button
          v-if="modalType === 'modifyPsw'"
          class="create-btn"
          type="danger"
          @on-click="close"
          >取消</m-button
        >
        <m-button
          v-if="modalType === 'tfa' && tfa_type === 'uf2'"
          class="create-btn"
          type="primary"
          @on-click="registerUf2"
          >注册uf2设备</m-button
        >
         <m-button
          v-if="modalType === 'tfa' && tfa_type === 'totp'"
          class="create-btn"
          type="primary"
          @on-click="apply"
          >应用</m-button
        >
        <m-button class="create-btn" type="primary" v-show="modalType !== 'permission'" @on-click="confirm" :disabled="modalType === 'tfa' && !canDeleteTFA()">{{
          modalType === "create" ? "创建" : modalType === 'tfa' ? "删除" : "确定"
        }}</m-button>
      </template>
    </template>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import DataCenterAccessHttp from "@src/views/home/dataCenter/access/http";
import { flotToFixed, percentToFixed, byteToSize } from "@libs/utils/index";
import QRCode from 'qrcodejs2'
export default {
  name: "CreateAccessModal",
  mixins: [DataCenterAccessHttp],
  components: {
    Dialog,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    modalType: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    param: {
      type: Object,
      default: () => {
        return {};
      },
    },
    isCreate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      username: "",
      email: "",
      comment: "",
      enable: "",
      realmList: [],
      isAdvice: false,
      realm: "",
      keys: "",
      groups: [],
      firstname: "",
      lastname: "",
      expire: "",
      password: "",
      confirmPsw: "",
      challenge: "",
      issuer:"Proxmox Web UI",
      tfa_type: "totp",
      u2f_available: false,
      tfa_required: false,
      secret: "",
      digits: 6,
      step: 30,
      permissionTreeData: [],
      rules: {
        username: {
          error: false,
          message: "",
        },
        groups: {
          error: false,
          message: "",
        },
        email: {
          error: false,
          message: "",
        },
        realm: {
          error: false,
          message: "",
        },
        password: {
          error: false,
          message: "",
        },
        confirmPsw: {
          error: false,
          message: "",
        },
        secret: {
          error: false,
          message: ""
        },
        challenge: {
           error: false,
          message: ""
        }
      },
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    percentToFixed,
    byteToSize,
    __init__() {
      let _this = this;
      if (_this.modalType === "create") {
        Object.assign(_this.$data, _this.$options.data());
        _this.queryGroupsList();
        _this.queryDomain();
      } else if (this.modalType === "edit") {
        _this.queryUsersObj({ id: this.param.userid }).then(() => {
          Object.keys(_this.db.usersObj).forEach((key) => {
            if (key === "enable") _this.enable = _this.db.usersObj[key] === 1;
            else _this[key] = _this.db.usersObj[key];
          });
          _this.username = _this.param.userid;
          _this.realm = _this.param.userid.split("@")[1];
          if (_this.param.expire !== 0)
            _this.expire = new Date(_this.param.expire * 1000);
          else _this.expire = "";
          if (_this.db.usersObj["keys"]) _this.isAdvice = true;
        });
      } else if (_this.modalType === "modifyPsw") {
        Object.assign(_this.$data, _this.$options.data());
      } else if (_this.modalType === "tfa") {
        Object.assign(_this.$data, _this.$options.data());
        if(_this.qrcode) _this.qrcode = null;
        _this.qrcode = new QRCode(document.querySelector('#canvas'), {
		     	 width: 256,
		    	 height: 256,
		    	 correctLevel: 0
		     })
         _this.queryTfa({ userid: _this.param.userid }).then(() => {
         _this.afterLoading(_this.db.tfaObj.realm, _this.db.tfaObj.user);
         _this.username = _this.param.userid;
         _this.updateQrCode();
        });
      } else if (_this.modalType === 'permission') {
        _this.queryUserPermisson({userid: _this.param.userid, _dc: new Date().getTime()})
             .then((res) => {
               let loop = (item) => {
                 return Object.keys(item).map((it) => {
                   if(Object.keys(item[it]).length > 0) {
                    loop(item[it]);
                   }
                   let setChildren = (children) => {
                      if(Object.keys(children).length > 0) {
                         return Object.keys(children).map(child => {
                             return {
                               label: child,
                               icon: 'fa fa-fw fa-unlock',
                               value: children[child]
                             }
                           })
                      }
                   }
                  return {
                       label: it,
                       children: typeof (item[it]) === 'object' ? setChildren(item[it])  : [],
                       icon: 'el-icon-folder-add'
                     }
                 })
               }
               _this.permissionTreeData = loop(_this.db.userPermissionObj);
               _this.permissionTreeData.sort((a, b) => {
                 if(a.label > b.label) return 1;
                 else return -1;
               })
             })
      }
    },
    updateQrCode() {
      let _this = this,
	    algorithm;
	    if (!algorithm) {
	      algorithm = 'SHA1';
       }
       _this.qrcode.clear();
	     _this.qrcode.makeCode(
	     'otpauth://totp/' + encodeURIComponent(_this.param.userid) +
	     '?secret=' + _this.secret +
	     '&period=' + this.step +
	     '&digits=' + this.digits +
	     '&algorithm=' + algorithm +
       '&issuer=' + encodeURIComponent(_this.issuer)
       )
    },
    handlePathSelect(value) {
      this.path = value;
    },
    handleGroupSelect(value) {
      switch (this.modalType) {
        case "user":
          this.users = value;
          break;
        case "group":
          this.groups = value;
          break;
        case "tokens":
          this.tokens = value;
          break;
        default:
          this.groups = value;
      }
    },
    filterTree(pam) {
      console.log(pam);
    },
    handleRoleSelect(value) {
      this.roles = value;
    },
    handleRealmSelect(value) {
      this.realm = value;
    },
    close() {
      this.$emit("close");
    },
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value) && prop !== "email") {
        this.rules[prop].error = true;
        this.rules[prop].message = "不能为空";
        return;
      }
      if (
        value &&
        prop === "email" &&
        !/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(
          value
        )
      ) {
        this.rules[prop].error = true;
        this.rules[prop].message = "邮箱不合法";
        return;
      }
      if (value && ["confirmPsw", "password"].includes(prop)) {
        if (this.confirmPsw !== this.password && prop !== "password") {
          this.rules[prop].error = true;
          this.rules[prop].message = "两次输入密码不一致!";
          return;
        }
      }
      if(value && prop === 'secret' && !/^[A-Z2-7=]+$/.test(value)) {
         this.rules[prop].error = true;
         this.rules[prop].message = "必须是 base32 [A-Z2-7=]";
         return;
      }
    },
    randomizeSecret: function () {
      let _this = this;
      let rnd = new Uint8Array(32);
      window.crypto.getRandomValues(rnd);
      let data = "";
      rnd.forEach(function (b) {
        // secret must be base32, so just use the first 5 bits
        b = b & 0x1f;
        if (b < 26) {
          // A..Z
          data += String.fromCharCode(b + 0x41);
        } else {
          // 2..7
          data += String.fromCharCode(b - 26 + 0x32);
        }
      });
      _this.secret = data;
      _this.updateQrCode();
    },
    afterLoading(realm_tfa_type, user_tfa_type) {
      let _this = this;
      if (user_tfa_type === "oath") {
        user_tfa_type = "totp";
        _this.secret = "";
      }

      // if the user has no tfa, generate a secret for him
      if (!user_tfa_type) {
        _this.randomizeSecret();
      }

      _this.tfa_type = user_tfa_type || 'totp';
      if (!realm_tfa_type) {
        // There's no TFA enforced by the realm, everything works.
        _this.u2f_available = true;
        _this.tfa_required = false;
      } else if (realm_tfa_type === "oath") {
        // The realm explicitly requires TOTP
        if (user_tfa_type !== "totp" && user_tfa_type !== null) {
          // user had a different tfa method, so
          // we have to change back to the totp tab and
          // generate a secret
          _this.tfa_type = 'totp';
          _this.randomizeSecret();
        }
        _this.u2f_available = false;
        _this.tfa_required = true;
      } else {
        _this.$alert(
          `Custom 2nd factor configuration is not supported on realms with '{realm_tfa_type}' TFA.`
        );
      }
    },
    //注册uf2设备
    registerUf2() {
      this.updateTfa({userid: this.param.userid, action:'new'})
          .catch((res) => {
            this.$confirm.confirm({
             msg: res,
             type: 'error'
            }).then(() => {

            }).catch(() => {})
          })
    },
    canDeleteTFA() {
		    return this.tfa_type !== null && this.tfa_required;
	    },
    //应用
    apply() {
      if(this.validateAll()) return;
      let param = {
        userid: this.param.userid,
        action: 'new',
        key: `v2-${this.secret}`,
        config: `digits=${this.digits},step=${this.step},type=oath`,
        response: this.challenge
      }
      this.updateTfa(param)
          .catch((res) => {
            this.$confirm.confirm({
             msg: res,
             type: 'error'
            }).then(() => {

            }).catch(() => {})
          })
    },
    validateAll() {
      let props = [];
      if (["create", "edit"].includes(this.modalType)) {
        props = ["username", "realm", "email", "groups"];
      } else if (this.modalType === "modifyPsw") {
        props = ["password", "confirmPsw"];
      } else if (this.modalType === 'tfa' && this.tfa_type === 'totp') {
        props = ['secret', 'challenge']
      }
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    handleTabChange(name) {
     this.tfa_type = name;
     if(this.tfa_type ===  'totp') {
       this.updateQrCode();
     }
    },
    confirm() {
      if (this.validateAll()) return;
      let param = {
        userid: this.username + "@" + this.realm,
        groups: this.groups.join(","),
        expire: this.expire ? new Date(this.expire).getTime() / 1000 : 0,
        enable: this.enable ? 1 : 0,
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.emial,
        comment: this.comment,
      };
      if (this.isAdvice) param["keys"] = this.keys;
      if (this.modalType === "create") {
        this.createAccessUser(param).then((res) => {
          this.close();
        });
      } else if (this.modalType === "edit") {
        param.userid = this.param.userid;
        this.updateUsers(param).then((res) => {
          this.close();
        });
      } else if (this.modalType === "modifyPsw") {
        let param = {
          password: this.password,
          userid: this.param.userid,
        };
        this.updateUserPsw(param).then((res) => {
          this.close();
        });
      } else if (this.modalType === 'tfa')  {
          let param = {
		        userid: this.param.userid,
		        action: 'delete'
	        };
	       if (this.param.userid !== 'root@pam') {
		       params.password = this.param.password;
         }
        this.updateTfa(param)
          .catch((res) => {
            this.$confirm.confirm({
             msg: res,
             type: 'error'
            }).then(() => {

            }).catch(() => {})
          })
      }
    },
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal) setTimeout(() => this.__init__(), 0);
        return newVal;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}
.m-tree-icon-parent:not(.m-tree-icon-custom):before {
  content: "\f114";
}
.expanded.el-tree-node__expand-icon {
  -webkit-transform: rotate(0deg)!important;
  transform: rotate(0deg)!important;
}
</style>
