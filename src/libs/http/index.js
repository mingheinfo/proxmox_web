import Http from './http';
import { Message } from 'element-ui';
import axios from 'axios';
import qs from 'qs';

// 声明一个 Map 用于存储每个请求的标识 和 取消函数
const pending = new Map()
/**
 * 添加请求
 * @param {Object} config 
 */
const addPending = (config) => {
  const url = [
    config.method,
    config.url,
    qs.stringify(config.params),
    qs.stringify(config.data)
  ].join('&');
  config.cancelToken = new axios.CancelToken(cancel => {
    if (!pending.has(url)) { // 如果 pending 中不存在当前请求，则添加进去
      pending.set(url, cancel)
    }
  })
}
/**
 * 移除请求
 * @param {Object} config 
 */
const removePending = (config) => {
  const url = [
    config.method,
    config.url,
    qs.stringify(config.params),
    qs.stringify(config.data)
  ].join('&')
  if (pending.has(url)) { // 如果在 pending 中存在当前请求标识，需要取消当前请求，并且移除
    const cancel = pending.get(url)
    cancel(url)
    pending.delete(url)
  }
}
/**
 * 清空 pending 中的请求（在路由跳转时调用）
 */
const clearPending = () => {
  for (const [url, cancel] of pending) {
    cancel(url)
  }
  pending.clear()
}


function handleError(error, errorTip) {
  if(error.error.response &&error.error.response.status === 401) {
     let count = window.vm.$store.state.db.exceptionLogin.response401count || 0;
     window.vm.$store.dispatch('UPDATE_401_COUNT', {response401count: ++count});
     //当用户鉴权失败后为了良好的用户体验，先不要直接跳转到登录页面
     if(window.vm.$store.state.db.exceptionLogin.response401count > 5) {
      window.location.href='/login';
      window.vm.$store.dispatch('UPDATE_401_COUNT', {silenceAuthFailures: false});
     }
  }
  if(error.error && error.error.response && error.error.response.statusText) {
    return Promise.reject(error.error.response.statusText);
  }
}
function handleSuccess({successTip}) {
  if(typeof successTip !== "string") return;
  Message.info(successTip);
}
const http = new Http({
  onShowErrorTip: (error, errorTip) => handleError({error, errorTip}),
  onShowSuccessTip: (response, successTip) => handleSuccess({successTip}),
});

http.defaults.baseURL = '/api2';
// 请求前拦截

http.instance.interceptors.request.use(cfg => {
  //添加token验证头
  // Do something before request is sent
  if(cfg.url !== "/json/access/ticket")
  cfg.headers['CSRFPreventionToken'] = window.localStorage.getItem('CSRFPreventionToken') || '';
  if(cfg.url !== '/json/cluster/resources'){
    removePending(cfg) // 在请求开始前，对之前的请求做检查取消操作
    addPending(cfg) // 将当前请求添加到 pending 中
  }
  return cfg;
}, error => {
  // Do something with request error
  return Promise.reject(error);
});


http.instance.interceptors.response.use(response => {
  removePending(response) // 在请求结束后，移除本次请求
  return response
}, error => {
  if (axios.isCancel(error)) {
  
  } else {
    // handle error code
  }
  return Promise.reject(error)
})

export {
  http,
  clearPending
}
