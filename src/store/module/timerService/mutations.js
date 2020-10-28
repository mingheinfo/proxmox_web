import _ from 'lodash';
import Vue from 'vue';
function batchMerge (state, objMap) {
  Object.keys(objMap).forEach(uuid => {
    Vue.set(state, uuid, {...state[uuid], ...objMap[uuid]})
  })
}
function remove (state, uuid) {
  Vue.delete(state, uuid)
}

export default {
  merge (state, taskMap) {
    _.keys(taskMap).forEach(uuid => {
      taskMap[uuid].fn()
      let interval = 1000
      if (taskMap[uuid].interval) {
        interval = taskMap[uuid].interval
      }
      let timerId = setInterval(taskMap[uuid].fn, interval)
      taskMap[uuid].timerId = timerId
    })
    batchMerge(state, taskMap)
  },
  delete (state, uuid) {
    if (state[uuid] && state[uuid].timerId) {
      clearInterval(state[uuid].timerId)
    }
    remove(state, uuid)
  }
}
