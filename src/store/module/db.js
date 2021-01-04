import * as types from '../mutations-types';
import { deepCopy } from '@libs/utils/index';
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
  lxcNetWorkList: [],
  poolThinList: [],
  usbList: [],
  backUpList: [],
  nfsList: [],
  cifsList: [],
  accessList: [],
  groupsList: [],
  rolesList: [],
  usersList: [],
  glusterfsList: [],
  pciList: [],
  domainsList: [],
  pciMDevList: [],
  addClusterLogList: [],
  haResourceList: [],
  cephMonList: [],
  iscsiList: [],
  vgList: [],
  clusterTaskList: [],
  clusterLogList: [],
  poolsList: [],
  zfsList: [],
  nodeSystemList: [],
  nodeSystemLogList: [],
  dataCenterReplicationList: [],
  nodeNetWorkList: [],
  haStatusList: [],
  acmeAccountList: [],
  acmePluginList: [],
  directoriesList: [],
  fireWallRuleList: [],
  fireWallResfList: [],
  fireWallGroupList: [],
  fireWallAliasList: [],
  ipSetCidrList: [],
  nodeFireWallLogList: [],
  ipSetList: [],
  macrosList: [],
  dnsApiList: [],
  nodeFireWallRuleList: [],
  certificatesInfoList: [],
  storageTemplateList: [],
  qemuLxcFireWallRuleList: [],
  aptList: [],
  nodeSysLogList: [],
  cephPoolsList: [],
  nodeDiskList: [],
  snapshotList: [],
  nodeSmartList: [],
  nodeDiskLvmThinList: [],
  nodeDiskDirectoryList: [],
  nodeDiskZfsList: [],
  nodeReplicationList: [],
  storageContentList: [],
  qemuBackUpList: [],
  nodeTaskList: [],
  qemuReplicationList: [],
  imageList: [],
  optionObj: {},
  cephObj: {},
  cephMetaDataObj: {},
  nodeNotesObj: {},
  storageStatusObj: {},
  qemuObj: {},
  fireWallAliasObj: {},
  vncTicketObj: {},
  usersObj: {},
  tfaObj: {},
  dataCenterReplicationObj: {},
  addClusterStatusObj: {},
  searchObject: {},
  storageObj: {},
  clusterObj: {},
  poolsObj: {},
  groupsObj: {},
  domainsObj: {},
  subscriptionObj: {},
  roleObj: {},
  acmeAccountObj: {},
  userPermissionObj: {},
  acmePluginObj: {},
  fireWallRuleObj: {},
  certificatesConfigObj: {},
  qemuConfigObj: {},
  timeZoneObj: {},
  qemuFireWallOptionsObj: {},
  nodeFireWallRuleObj: {},
  nodeFireWallOptionObj: {},
  dnsObj: {},
  job: {},
  changeLogObj: {},
  nodeDiskLvmObj: {},
  nodeDiskSdaObj: {},
  hardwareObj: {},
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
    let newState = deepCopy(data);
    Vue.set(state, name, newState)
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
