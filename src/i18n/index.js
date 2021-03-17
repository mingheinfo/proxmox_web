import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { getCookie } from "@libs/utils";
import zh_CN from './zh_CN.json';
import en from './en.json';
//国际化配置
Vue.use(VueI18n);
const messages = {
  "zh_CN": Object.assign(zh_CN),
  "en": Object.assign(en)
}
let i18n = new VueI18n({
  locale: getCookie("PVELangCookie") || 'zh_CN',
  messages: messages
})

export default i18n;
