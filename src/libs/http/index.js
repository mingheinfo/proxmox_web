import Http from './http';
import { Message } from 'element-ui';
import axios from 'axios';
import store from '@src/store/'
function handleError(error, errorTip) {
  if(error.error.response &&error.error.response.status === 401) {
     let count = window.vm.$store.state.db.response401count++;
     this.update401Count(count);
     if(window.vm.$store.state.db.response401count > 5)
      window.location.href='/login'
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
  cfg.cancelToken = new axios.CancelToken(function (cancel) {
    store.dispatch('ADD_CANCEL_REQUEST', {cancelToken: cancel})
  })
  return cfg;
}, error => {
  // Do something with request error
  return Promise.reject(error);
});

export {
  http
}
