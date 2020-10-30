<template>
   <div class="pve-login">
      <div class="pve-login_content clearfix">
         <div class="pve-login_content__left"></div>
         <div class="pve-login_content__right">
            <div class="pve-login_content__form">
               <h1 class="pve-login_content__form-title">{{$t("login.title")}}</h1>
               <div class="pve-login_content__form-item">
                  <input :placeholder="$t('login.username.placeholder')"
                         type="text"
                         @blur="validate('username')"
                         @input="validate('username')"
                         :class="{'error-input': emptyusername}"
                         v-model="username"/>
                  <span class="icon icon-user"></span>
                  <div class="error error-msg"
                       v-show="emptyusername">{{$t("login.username.empty")}}</div>
               </div>
               <div class="pve-login_content__form-item">
                  <input :placeholder="$t('login.password.placeholder')"
                         type="password"
                         @blur="validate('password')"
                         @input="validate('password')"
                         :class="{'error-input': emptypassword}"
                         v-model="password"/>
                  <span class="icon icon-password"></span>
                  <div class="error error-msg"
                       v-show="emptypassword">{{$t("login.password.empty")}}</div>
               </div>
               <div class="pve-login_content__form-select">
                  <div class="pv-form-select-wrapper width-12">
                     <select class="pv-form-input" v-model="realm">
                        <option v-for="item of realmList"
                                :key="item.realm"
                                :value="item.realm">{{item.comment}}</option>
                     </select>
                  </div>
               </div>
               <div class="pve-login_content__form-select">
                  <div class="pv-form-select-wrapper width-12">
                     <select class="pv-form-input" v-model="lang" @change="changeLang">
                        <option v-for="item of langList"
                                :key="item.value"
                                :value="item.value">{{item.label}}</option>
                     </select>
                  </div>
               </div>
               <div class="pve-login_content__form-item">
                  <input type="submit" :value="$t('login.title')" @click="login"/>
                  <Loading class="loading" v-show="loading" bgColor="#fff"></Loading>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
   import { setCookie, getEvent, getCookie, debounce, getEventTarget } from '@libs/utils/index.js';
   import Loading from '@src/components/loading/loading';
   import VuexMixins from '@src/mixins/VuexMixins';
   export default {
    name: "Login",
    mixins: [VuexMixins],
    components: {
      Loading
    },
    data() {
      return {
        realm: '',
        lang: getCookie('PVELangCookie') || setCookie('PVELangCookie','zh_CN'),//设置默认展示语言
        loading: false,
        realmList: [],
        //语言选择框
        langList:  [
          {
            value: 'zh_CN',
            label: 'Chinese (Simplified)'
          },
          {
            value: 'en',
            label: 'English'
          }
        ],
        username: '',
        password: '',
        emptyusername: false,
        invalidusername: false,
        emptypassword:  false,
        invalidpassword: false
      }
    },
    methods: {
      validate(name) {
        let input = String(this[name]).trim();
        this[`empty${name}`] = false;
        if(/^\s*$/.test(input)) {
          this[`empty${name}`] = true;
        }
      },
      //登录接口
      login() {
        this.loading = true;
        this.$http.ajax('/json/access/ticket', {
          username: this.username,
          password: this.password,
          realm: this.realm
        },'post',{
          headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        }).then(res => {
          if(res.data) {
            window.localStorage.setItem("CSRFPreventionToken", res.data.CSRFPreventionToken || '');
            setCookie("PVEAuthCookie", res.data.ticket, null, '/', null, false);
            this.updateDB({
              dbName: 'cap',
              obj: res.data.cap
            });
            this.$router.push({path: '/datacenter/overview'});
          }
          this.loading = false;
        }).catch(() => {
          this.loading = false;
        })
      },
      //改变国际化
      changeLang(event) {
        let ev = getEvent(event);
        setCookie('PVELangCookie', getEventTarget(ev).value);
        window.location.href = '/login';
      },
      //查询domain
      queryDomain() {
        this.$http.get('json/access/domains')
            .then(res => {
              if(res.data) {
                 this.realmList = res.data.sort((a,b) => {
                   return a.realm > b.realm
                 });
                 this.realm = res.data[0].realm
              }
            })
      }
    },
     mounted() {
      this.queryDomain();
     }
  }
</script>

<style scoped lang="less">
  @import "~@view/login/login.less";
</style>
