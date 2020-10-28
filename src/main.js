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
Vue.prototype.$confirm = new confirm();

Vue.use(Element);
Vue.mixin(VueMixins)

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
