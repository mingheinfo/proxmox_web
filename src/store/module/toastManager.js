import Vue from 'vue'
import * as types from '../mutations-types'

//初始化状态
const state = {
  toasts: {}
}

// getters计算所需要的状态
const getters = {
}

// actions异步操作触发mutations对toast进行增删改查
const actions = {
  [types.CREATE_TOAST] ({ commit, state }, param) {
    commit(types.CREATE_TOAST, param)
  },
  [types.UPDATE_TOAST] ({ commit, state }, param) {
    commit(types.UPDATE_TOAST, param)
  },
  [types.DESTROY_TOAST] ({ commit, state }, id) {
    commit(types.DESTROY_TOAST, id)
  }
}

// mutations
const mutations = {
  [types.CREATE_TOAST] (state, param) {
    Vue.set(state.toasts, param.id, param)
  },
  [types.UPDATE_TOAST] (state, newState) {
    Object.keys(newState).forEach(function (propName) {
      if (propName !== 'id') Vue.set(state.toasts[newState.id], propName, newState[propName])
    })
  },
  [types.DESTROY_TOAST] (state, id) {
    delete state.toasts[id]
    Vue.set(state, 'toasts', {...state.toasts})
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
