import * as types from '../mutations-types';
import Vue from 'vue';
const state = {
  allResList: []
}

const actions = {
  [types.ADD_CANCEL_REQUEST]: (ctx, payload) => {
    ctx.commit(types.ADD_CANCEL_REQUEST, payload);
  },
  [types.CLEAR_CANCEL_REQUEST]: (ctx, payload) => {
    ctx.commit(types.CLEAR_CANCEL_REQUEST, payload);
  },
}

const mutations= {
  [types.ADD_CANCEL_REQUEST]: (state, payload) => {
    state.allResList.push(payload.cancelToken);
    console.log(state.allResList);
  },
  [types.CLEAR_CANCEL_REQUEST]: (ctx, payload) => {
    if(state.allResList.length > 0)
      state.allResList.forEach(item => {
        item({'status': 'CANCEL', error: '取消请求'})
      })
    state.allResList = []
  }
}

export default {
  state,
  actions,
  mutations
}
