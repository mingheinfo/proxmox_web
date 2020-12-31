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
import Fragment from 'vue-fragment'
Vue.use(Fragment.Plugin)
// or

import { Plugin } from 'vue-fragment'
Vue.use(Plugin)
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

window.vm = new Vue({
  el: '#root',
  store,
  i18n,
  router,
  render: h => h(App),
  mounted() {
  }
})
