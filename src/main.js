import Vue from 'vue';
import App from './App';
import { http } from '@libs/http/index';
import store from './store/index';
import router  from  './route/index';
import '@src/style/font-awasome.less';
import '@src/style/common.less';
import i18n from '@src/i18n/index.js';
import Element from '@src/element/index';
import confirm from '@src/components/confirm/';
import VueMixins from '@src/mixins/VuexMixins';
import VueLazyload from 'vue-lazyload';
import directives from '@src/directives/directive';
import Fragment from 'vue-fragment';
import showdown from 'showdown'// 引入md文件
Vue.use(Fragment.Plugin)
// or

import { Plugin } from 'vue-fragment';
Vue.use(Plugin);
//自定义confirm指令
Vue.directive('confirm', directives);
Vue.directive('slldrag', directives);
// 配置
Vue.use(VueLazyload, {
	preLoad: 1.3,
	attempt: 1,
	error: require('./assets/error.svg'),
	loading: require('./assets/loading.svg') // 注意路径使用require（我这里使用相对路径）
})
//确定提示框
Vue.prototype.$confirm = new confirm();
//element组件动态引入
Vue.use(Element);
//全局引入vueMixin混合
Vue.mixin(VueMixins)
//全局印日http请求
Vue.prototype.$http = http;
 
// 使用md文件
Vue.prototype.md2html = (md)=> {
  let converter = new showdown.Converter();
  let text = md.toString();
  let html = converter.makeHtml(text);
  return html
};
window.vm = new Vue({
  el: '#root',
  store,
  i18n,
  router,
  render: h => h(App),
  mounted() {
    //如果存在Token则证明已经登录过否则表名没有登录过
    if(window.localStorage.getItem('CSRFPreventionToken')) {
      this.$store.dispatch('UPDATE_401_COUNT', {silenceAuthFailures: true})
    } else {
      this.$store.dispatch('UPDATE_401_COUNT', {silenceAuthFailures: false})
    };
  }
})
//
// if(isIE) {
//   var CustomEvent = function(event, params){
//     params = params || { bubbles: false, cancelable: false, detail: undefined };
//
//     var evt = document.createEvent('CustomEvent');
//
//     evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
//
//     return evt;
//   };
//
//   CustomEvent.prototype = window.Event.prototype;
//
//   window.CustomEvent = CustomEvent;
// }
// // 统一拦截ajax请求
// function ajaxEventTrigger (event) {
//   var ajaxEvent = new CustomEvent(event, { detail: this })
//   window.dispatchEvent(ajaxEvent)
// }
//
// function myBrowser() {
//   var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
//   var isOpera = userAgent.indexOf("Opera") > -1;
//   if (isOpera) { //判断是否Opera浏览器
//     return "Opera"
//   }
//   ;
//   if (userAgent.indexOf("Firefox") > -1) { //判断是否Firefox浏览器
//     return "FF";
//   }
//   ;
//   if (userAgent.indexOf("Chrome") > -1) {
//     return "Chrome";
//   }
//   ;
//   if (userAgent.indexOf("Safari") > -1) { //判断是否Safari浏览器
//     return "Safari";
//   }
//   ;
//   if (isIE() && !isOpera) { //判断是否IE浏览器
//     return "IE";
//   }
//   ;
// }
// var oldXHR = window.XMLHttpRequest;
// function newXHR () {
//   var realXHR = new oldXHR()
//   realXHR.addEventListener('readystatechange', function () { ajaxEventTrigger.call(this, 'ajaxReadyStateChange') }, false)
//   return realXHR
// }
// window.XMLHttpRequest = newXHR
// var startTime = 0
// var gapTime = 0 // 计算请求延时
// window.addEventListener('ajaxReadyStateChange', function (e) {
//   var xhr = e.detail
//   var status = xhr.status
//   var readyState = xhr.readyState
//   /**
//    * 计算请求延时
//    */
//   if (readyState === 1) {
//     startTime = (new Date()).getTime()
//   }
//   if (readyState === 4) {
//     gapTime = (new Date()).getTime() - startTime
//   }
//   /**
//    * 上报请求信息
//    */
//   if (readyState === 4) {
//     if(status === 200){
//       // 接口正常响应时捕获接口响应耗时
//       console.log('接口',xhr.responseURL,'耗时',gapTime, myBrowser())
//     }else{
//       // 接口异常时捕获异常接口及状态码
//       console.log('异常接口',xhr.responseURL,'状态码',status, myBrowser())
//     }
//   }
// })
