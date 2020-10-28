import Vue from 'vue';
import Vuex from 'vuex';
import db from './module/db';
import toastManager from './module/toastManager';
import timerService from  './module/timerService/';
import request from './module/request';
Vue.use(Vuex);
export  default new Vuex.Store({
  modules: {
    db,
    toastManager,
    timerService,
    request
  },
  actions: {

  },
  mutations: {

  },
  getters: {

  }
})
