import * as types from '../mutations-types';
import Vue from 'vue';
const state = {
  cap: {},
  resources: [],
  volumeList: [],
  clusterList: [],
  vmList: [],
  nodeList: [],
  storageList: [],
  netWorkList: [],
  poolThinList: [],
  backUpList: [],
  nfsList: [],
  cifsList: [],
  accessList: [],
  groupsList: [],
  rolesList: [],
  usersList: [],
  glusterfsList: [],
  domainsList: [],
  addClusterLogList: [],
  addClusterStatusList: [],
  cephMonList: [],
  iscsiList: [],
  vgList: [],
  iscsiList: [],
  poolsList: [],
  zfsList: [],
  dataCenterReplicationList: [],
  optionObj: {},
  qemuObj: {},
  usersObj: {},
  tfaObj: {},
  dataCenterReplicationObj: {},
  searchObject: {},
  storageObj: {},
  clusterObj: {},
  poolsObj: {},
  groupsObj: {},
  roleObj: {},
  userPermissionObj: {},
  job: {},
  selectView: window.localStorage.getItem("overviewType")|| 'dataCenter',
  lastSelectObj: {},
  changeTree: false,
  treeData: { dataIndex: {}, updateCount: 0 },
}

const actions = {
  [types.UPDATE_DB]: (ctx, payload) => {
    ctx.commit(types.UPDATE_DB, payload);
  },
  [types.UPDATE_TABLE]: (ctx, payload) => {
    ctx.commit(types.UPDATE_TABLE, payload);
  },
  [types.UPDATE_SEARCHOBJ]: (ctx, payload) => {
    ctx.commit(types.UPDATE_SEARCHOBJ, payload);
  },
  [types.UPDATE_SELECTVIEW]: (ctx, payload) => {
    ctx.commit(types.UPDATE_SELECTVIEW, payload);
  },
  [types.UPDATE_DB_OBJECT] ({ commit, state }, param) {
    commit(types.UPDATE_DB_OBJECT, param)
  },
  [types.UPDATE_LAST_SELECT]:(ctx, payload) => {
    ctx.commit(types.UPDATE_LAST_SELECT, payload);
  },
  [types.UPDATE_CHANGE_TREE]:(ctx, payload) => {
    ctx.commit(types.UPDATE_CHANGE_TREE, payload);
  }
}

const mutations = {
  "UPDATE_DB": (state, {dbName, obj}) => {
    if (!state[dbName]) state[dbName] = {}
    Vue.set(state, dbName, { ...state[dbName], obj });
  },
  "UPDATE_TABLE": (state, {tableName, list}) => {
    if (!state[tableName]) state[tableName] = [];
    Vue.set(state, tableName, list);
  },
  "UPDATE_SEARCHOBJ": (state, payload) => {
    state.searchObject =  payload
  },
  "UPDATE_SELECTVIEW": (state, payload) => {
    state.selectView =  payload
  },
  [types.UPDATE_DB_OBJECT] (state, { name, data }) {
    if (!state[name]) state[name] = {}
    Vue.set(state, name, {...state[name], ...data})
  },
  [types.UPDATE_LAST_SELECT](state, obj) {
    Vue.set(state, "lastSelectObj", obj);
  },
  [types.UPDATE_CHANGE_TREE](state, payload) {
    Vue.set(state, 'changeTree', payload);
  }
}

export default {
  state,
  actions,
  mutations
}