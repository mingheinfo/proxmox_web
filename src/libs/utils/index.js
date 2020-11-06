const path = require('path');
import { http } from '@libs/http/index';
import { Message } from 'element-ui';

var IPV4_OCTET = "(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])";
var IPV4_REGEXP = "(?:(?:" + IPV4_OCTET + "\\.){3}" + IPV4_OCTET + ")";
var IPV6_H16 = "(?:[0-9a-fA-F]{1,4})";
var IPV6_LS32 = "(?:(?:" + IPV6_H16 + ":" + IPV6_H16 + ")|" + IPV4_REGEXP + ")";
var IP4_match = new RegExp("^(?:" + IPV4_REGEXP + ")$");
const IP4_cidr_match = new RegExp("^(?:" + IPV4_REGEXP + ")\/[1-3][0-9]?$");
var IPV6_REGEXP = "(?:" +
  "(?:(?:" + "(?:" + IPV6_H16 + ":){6})" + IPV6_LS32 + ")|" +
  "(?:(?:" + "::" + "(?:" + IPV6_H16 + ":){5})" + IPV6_LS32 + ")|" +
  "(?:(?:(?:" + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){4})" + IPV6_LS32 + ")|" +
  "(?:(?:(?:(?:" + IPV6_H16 + ":){0,1}" + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){3})" + IPV6_LS32 + ")|" +
  "(?:(?:(?:(?:" + IPV6_H16 + ":){0,2}" + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){2})" + IPV6_LS32 + ")|" +
  "(?:(?:(?:(?:" + IPV6_H16 + ":){0,3}" + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){1})" + IPV6_LS32 + ")|" +
  "(?:(?:(?:(?:" + IPV6_H16 + ":){0,4}" + IPV6_H16 + ")?::" + ")" + IPV6_LS32 + ")|" +
  "(?:(?:(?:(?:" + IPV6_H16 + ":){0,5}" + IPV6_H16 + ")?::" + ")" + IPV6_H16 + ")|" +
  "(?:(?:(?:(?:" + IPV6_H16 + ":){0,7}" + IPV6_H16 + ")?::" + ")" + ")" +
  ")";
var IP6_match = new RegExp("^(?:" + IPV6_REGEXP + ")$");
var IP6_cidr_match = new RegExp("^(?:" + IPV6_REGEXP + ")\/[0-9]{1,3}?$");
var IP6_bracket_match = new RegExp("^\\[(" + IPV6_REGEXP + ")\\]");

var IP64_match = new RegExp("^(?:" + IPV6_REGEXP + "|" + IPV4_REGEXP + ")$");

//获得event对象兼容ie
function getEvent(ev) {
  return ev || window.event;
}
//阻止事件冒泡
function stopEvent(ev) {
  if (ev.stopPropagination) {
    ev.stopPropagination();
  } else {
    ev.cancelBubble = true;
  }
}
/**
 * @param fn要触发的回调，
 * @param delay隔多少时间触发
 * */
function debounce(fn, delay) {
  let timer = null;
  return function () {
    let context = this;
    let args = arguments;
    if (timer) {
      clearTimeout(timer);
      timer = setTimeout(fn.apply(context, args), delay)
    } else {
      timer = setTimeout(fn.apply(context, args), delay);
    }
  }
}

/**
 * 节流函数
 * @param fn要出发的回调
 * @param delay隔多少时间触发
 * */
function throttle(func, delay, immediate) {
  let prev = Date.now();
  return function () {
    const context = this;
    const args = arguments;
    if (immediate) {

    } else {
      let now = Date.now();
      if (now - prev >= delay) {
        func.apply(context, args);
        prev = Date.now();
      }
    }
  }
}

/**
 * 解析cookie
 * */
function parseCookie() {
  let cookies = document.cookie.split(";");
  return cookies.reduce((target, cookie) => {
    let key = cookie.split("=")[0];
    let value = cookie.split("=")[1];
    target[key] = value;
    return target;
  }, {})
}

/**
 * 设置cookie
 * */
function setCookie(name, value) {
  debugger;
  var argv = arguments,
    argc = arguments.length,
    expires = (argc > 2) ? argv[2] : null,
    path = (argc > 3) ? argv[3] : '/',
    domain = (argc > 4) ? argv[4] : null,
    secure = (argc > 5) ? argv[5] : false;

  let str = name + "=" + escape(value) + ((expires === null) ? "" : ("; expires=" + expires.toUTCString())) + ((path === null) ? "" : ("; path=" + path)) + ((domain === null) ? "" : ("; domain=" + domain)) + ((secure === true) ? "; secure" : "");
  console.log(str);
  document.cookie = str;
}
/**
 * @param name 获得cookie值
 * */
function getCookie(name) {
  var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if (arr = document.cookie.match(reg))
    return unescape(arr[2]);
  else
    return null;
}
/**
 * 删除cookie
 * */
function delCookie(name, path) {
  if (this.get(name)) {
    path = path || '/';
    document.cookie = name + '=' + '; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=' + path;
  }
}
/**
 * 树形结构数据处理
 * */
function treeNode(data, cb) {
  let loop = item => {
    if (item.childNodes && item.childNodes.length > 0) {
      treeNode(item.childNodes, cb)
    } else {
      cb(item)
    }
  }
  debugger;
  return loop(data);
}
/**
 * 格式化日期
 * */
function dateFormat(date, format) {
  if (!date) return;
  let d = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let o in d) {
    if (new RegExp(`(${o})`).test(format)) {
      let str = d[o] + ''
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str))
    }
  }
  return format;
}

function padLeftZero(str) {
  return ('00' + str).substr(str.length)
}

/**
 * 数组去重
 * */
function arrayToHeavy(arr) {
  let newArr = [];
  for (let i = 0; i < arr.length; i++) {
    if (!newArr.includes(arr[i])) {
      newArr.push(arr[i]);
    }
  }
  return newArr;
}

/**
 * 冒泡排序
 * */
function bubbleSort(arr) {
  //控制循环
  for (let i = 0; i < arr.length; i++) {
    //遍历数组
    for (let j = 0; j < arr.length - i - 1; j++) {
      let temp;
      if (arr[j] > arr[j + 1]) {
        temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}
/**
 * 快速排序
 * */
function quickSort(array) {
  if (!Array.isArray(array)) return;
  let sort = (arr, left = 0, right = arr.length - 1) => {
    if (left >= right) return;
    let i = left, j = right, baseVal = arr[j]//以最后一个元素为基准;
    while (i < j) {
      while (i < j && arr[i] <= baseVal) {
        i++;
      }
      arr[j] = arr[i];
      while (i < j && arr[j] >= baseVal) {
        j--;
      }
      arr[i] = arr[j];
    }
    arr[j] = baseVal;//当i=j时基准值放在中央位置完成一次循环
    sort(arr, left, j - 1);//baseVal左边进行排序
    sort(arr, j + 1, right);//baseVal右边分组进行排序
  }
  const newArr = array.concat();//深拷贝数组新数组改变不改变原数组
  sort(newArr);
  return newArr;
}
/**
 * 深拷贝对象
 * */
function deepCopy(source) {
  if (!isObject(source)) return source;
  let target = Array.isArray(source) ? [] : {};
  for (let k in source) {
    if (source.hasOwnProperty(k)) {
      if (typeof source[k] === 'object') {
        target[k] = deepCopy(source[k])
      } else {
        target[k] = source[k];
      }
    }
  }
  return target;
}
/**
 * 判断是否是对象
 * */
function isObject(obj) {
  return typeof obj === 'object' || obj !== null
}
/**
 * 每个英文字母首字母大写
 * */
function capitalizeToAll(str) {
  return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}
/**
 * 首字母大写
 * */
function capitalizeToFirst(str) {
  return str.toLowerCase().replace(/\b([\w|']+)\b/, (o) => o.replace(o.charAt(0), o.charAt(0).toUpperCase()))
}
/**
 * 格式化size
 * */
function byteToSize(bytes, unit, width) {
  bytes = Number(bytes);
  if (typeof bytes !== 'number' && isNaN(bytes)) bytes = 0;
  if (bytes < 0) bytes = 0;
  if (typeof width === 'undefined') width = 2;
  if (typeof unit === 'undefined') unit = 'iB';
  let num = Math.pow(10, width);//指数函数10的几次方
  var sizes = ['K', 'M', 'G', 'T', 'P'];//单位
  if (unit) {//单位存在
    sizes.unshift('');
  } else {
    sizes.unshift('Byte')
  }
  if (bytes === 0) return '0 ' + sizes[0] + unit;
  var i = Math.floor(Math.log(bytes) / Math.log(1024));//求1024的自然对数
  // for 0.xxxx number
  if (i < 0) i = 0;
  if (sizes[i] === 'B') num = 1;
  if (i >= 5) i = 5;
  return Math.round(bytes / Math.pow(1024, i) * num) / num + ' ' + sizes[i] + unit;
}
/**
 * 获得event时间target兼容ie
 * */
function getEventTarget(event) {
  return event.target || event.srcElement;
}


function format_duration_long(ut) {
  var days = Math.floor(ut / 86400);
  ut -= days * 86400;
  var hours = Math.floor(ut / 3600);
  ut -= hours * 3600;
  var mins = Math.floor(ut / 60);
  ut -= mins * 60;

  var hours_str = '00' + hours.toString();
  hours_str = hours_str.substr(hours_str.length - 2);
  var mins_str = "00" + mins.toString();
  mins_str = mins_str.substr(mins_str.length - 2);
  var ut_str = "00" + ut.toString();
  ut_str = ut_str.substr(ut_str.length - 2);

  if (days) {
    var ds = days > 1 ? '天' : '天';
    return days.toString() + ' ' + ds + ' ' +
      hours_str + ':' + mins_str + ':' + ut_str;
  } else {
    return hours_str + ':' + mins_str + ':' + ut_str;
  }
}

function render_uptime(value, metaData, record, rowIndex, colIndex, store) {

  var uptime = value;

  if (uptime === undefined) {
    return '';
  }

  if (uptime <= 0) {
    return '-';
  }

  return format_duration_long(uptime);
}
/**
 * 加载所有图片
 * */
function requireAll2Obj(requireContext) {
  let obj = {}
  requireContext.keys().forEach(key => {
    let k = path.basename(key).slice(0, -4)
    obj[k] = requireContext(key)
  })
  return obj
}
/**
 * 打开控制台
 * */
function openConsoleWindow(viewer, vmtype, vmid, nodename, vmname, cmd) {
  // kvm, lxc, shell, upgrade

  if (vmid == undefined && (vmtype === 'kvm' || vmtype === 'lxc')) {
    throw "missing vmid";
  }

  if (!nodename) {
    throw "no nodename specified";
  }

  if (viewer === 'applet' || viewer === 'html5') {
    openVNCViewer(vmtype, vmid, nodename, vmname, viewer === 'html5');
  } else if (viewer === 'xtermjs') {
    openXtermJsViewer(vmtype, vmid, nodename, vmname, cmd);
  } else if (viewer === 'vv') {
    var url;
    var params = { proxy: '10.10.10.222' || windowHostname() };
    if (vmtype === 'kvm') {
      url = '/json/nodes/' + nodename + '/qemu/' + vmid.toString() + '/spiceproxy';
      openSpiceViewer(url, params);
    } else if (vmtype === 'lxc') {
      url = '/' + nodename + '/lxc/' + vmid.toString() + '/spiceproxy';
      openSpiceViewer(url, params);
    } else if (vmtype === 'shell') {
      url = '/json/nodes/' + nodename + '/spiceshell';
      openSpiceViewer(url, params);
    } else if (vmtype === 'upgrade') {
      url = '/json/nodes/' + nodename + '/spiceshell';
      params.upgrade = 1;
      openSpiceViewer(url, params);
    }
  } else {
    throw "unknown viewer type";
  }
}

function openXtermJsViewer(vmtype, vmid, nodename, vmname, cmd) {
  var url = parseQueryString({
    console: vmtype, // kvm, lxc, upgrade or shell
    xtermjs: 1,
    vmid: vmid,
    vmname: vmname,
    node: nodename,
    cmd: cmd,

  });
  var nw = window.open("/shell/?" + url, '_blank', 'toolbar=no,location=no,status=no,menubar=no,resizable=yes,width=800,height=420');
  if (nw) {
    nw.focus();
  }
}

function parseQueryString(param) {
  if (typeof param !== 'object') return;
  let url = '';
  for (let i in param) {
    url += `${i}=${param[i] === 0 ? String(param[i]) : param[i] ? param[i] : ''}&`
  }
  return url.slice(0, url.length - 1);
}

function openVNCViewer(vmtype, vmid, nodename, vmname, novnc) {
  var options = {
    console: vmtype ? vmtype : '', // kvm, lxc, upgrade or shell
    novnc: novnc ? 1 : 0,
    vmid: String(vmid) ? vmid : '',
    vmname: vmname ? vmname : '',
    node: nodename ? nodename : '',
    resize: 'off',
    cmd: ''
  }, url = '';
  for (let it in options) {
    url += encodeURIComponent(it) + '=' + encodeURIComponent(options[it]) + '&';
  }
  var nw = window.open("/shell/?" + url.slice(0, url.length - 1), '_blank', "innerWidth=745,innerheight=427");
  nw.focus();
}

function windowHostname() {
  return window.location.hostname.replace(IP6_bracket_match,
    function (m, addr, offset, original) { return addr; });
}

function openSpiceViewer(url, params) {

  var downloadWithName = function (uri, name) {
    var link = appendDom(document.body, {
      tag: 'a',
      href: uri,
      css: 'display:none;visibility:hidden;height:0px;'
    });
    // Note: we need to tell android the correct file name extension
    // but we do not set 'download' tag for other environments, because
    // It can have strange side effects (additional user prompt on firefox)
    var andriod = navigator.userAgent.match(/Android/i) ? true : false;
    if (andriod) {
      link.download = name;
    }

    if (link.fireEvent) {
      link.fireEvent('onclick');
    } else {
      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
      link.dispatchEvent(evt);
    }
  };

  http.ajax(url, params, 'post', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
  }).then((response) => {
    var raw = "[virt-viewer]\n";
    for (let it in response.data) {
      raw += it + "=" + response.data[it] + "\n";
    }
    var url = 'data:application/x-virt-viewer;charset=UTF-8,' +
      encodeURIComponent(raw);
    downloadWithName(url, "pve-spice.vv");
  }).catch((response) => {
    Message.error(response.htmlStatus ? response.htmlStatus : '');
  });
}

function appendDom(el, options = {}) {
  let tag = document.createElement(options.tag);
  tag.href = options.href;
  tag.style = options.css;
  el.parentNode.insertBefore(tag, el);
  return tag;
}

function getDocument() {
  return document.documentElement || document.body;
}

function genUniqueId() {
  // function s4 () {
  //   return Math.floor((1 + Math.random()) * 0x10000)
  //     .toString(16)
  //     .substring(1)
  // }
  // return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4()
  // return s4() + s4() + 'dca14c9d8a02fbdb108ba4a5'
  const firstCount = 12;
  const secondCount = 3;
  const thirdCount = 15;
  let chars = '0123456789abcdef'.split('');
  let fn = () => {
    return chars[Math.floor(Math.random() * 16)]
  };
  let uuid = '';
  for (let i = 0; i < firstCount; i++) {
    uuid += fn()
  }
  uuid += '12345'.split('')[Math.floor(Math.random() * 5)];
  for (let i = 0; i < secondCount; i++) {
    uuid += fn()
  }
  uuid += '89ab'.split('')[Math.floor(Math.random() * 4)];
  for (let i = 0; i < thirdCount; i++) {
    uuid += fn()
  }
  return uuid
  // [0-9a-f]{12}[1-5][0-9a-f]{3}[89ab][0-9a-f]{15}
}

function browserLocalStorageGetItem(item) {
  return window.localStorage.getItem(item)
}

function browserLocalStorageSetItem(item, value) {
  return window.localStorage.setItem(item, value)
}

function browserLocalStorageRemoveItem(item) {
  return window.localStorage.removeItem(item)
}

function getEventDataFromWindow(item) {
  if (!window.__eventStorage__) window.__eventStorage__ = {};
  if (!window.__eventStorage__[item]) return null;
  return window.__eventStorage__[item]
}

function setEventDataToWindow(item, value) {
  if (!window.__eventStorage__) window.__eventStorage__ = {};
  window.__eventStorage__[item] = value
}

function removeEventDataInWindow(item) {
  if (!window.__eventStorage__) window.__eventStorage__ = {};
  window.__eventStorage__[item] = null
}

function isLongJobEvent(eventId) {
  let longJobListName = `longJobList-${getIdentityUuid()}`;
  let longJobList = JSON.parse(browserLocalStorageGetItem(longJobListName));
  if (!longJobList) longJobList = [];
  for (let longJob of longJobList) {
    if (eventId === longJob.id) return true
  }
  return false
}

function getIdentityUuid() {
  let identityUuid;
  if (localStorage.getItem('loginType') === 'account') {
    identityUuid = localStorage.getItem('accountUuid')
  } else if (localStorage.getItem('loginType') === 'user') {
    identityUuid = localStorage.getItem('userUuid')
  } else {
    identityUuid = localStorage.getItem('uid')
  }
  return identityUuid
}
//判断是否是叶子节点
function isLeaf() {
  return this.get('leaf') === true;
}

function setIconCls(info, typeDefaults) {
  let cls = get_object_icon_class(info.type, info, typeDefaults);
  if (cls !== '') {
    info.iconCls = cls;
  }
  return info;
}

function get_object_icon_class(type, record, typeDefaults) {
  let status = '';
  let objType = type;
  if (type === 'type') {
    // for folder view
    objType = record.groupbyid;
  } else if (record.template) {
    // templates
    objType = 'template';
    status = type;
  } else {
    // everything else
    status = record.status ? record.status + ' ha-' + record.hastate : ' ha-' + record.hastate;
  }
  if (record.lock) {
    status += ' locked lock-' + record.lock;
  }
  var defaults = typeDefaults[objType];
  if (defaults && defaults.iconCls) {
    var retVal = defaults.iconCls + ' ' + status;
    return retVal;
  }
  return '';
}

/**
 * 保留n为小数
*/
function flotToFixed(num, position) {
  return Math.round(num * Math.pow(10, position)) / Math.pow(10, position);
}
/**
 * 计算百分比
*/
function percentToFixed(num, digit) {
  let m = Math.pow(10, digit),
    a = Math.round(num * m, 10) / m,
    c = 0, d = a.toString(), b = 100,
    e = b.toString();
  try {
    c += d.split(".")[1].length;
  } catch (f) {

  }
  try {
    c += e.split(".")[1].length;
  } catch (f) {

  }
  return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c) + '%';
}
/**
 * copy信息
*/
function copyText(content) {
  let targetElm
  if (content.indexOf('\n') !== -1) {
    targetElm = document.createElement('textarea')
  } else {
    targetElm = document.createElement('span')
  }
  var newContent = document.createTextNode(content)
  targetElm.appendChild(newContent)
  document.body.appendChild(targetElm)
  Promise.resolve().then(() => {
    var range = document.createRange()
    range.selectNode(targetElm)
    window.getSelection().removeAllRanges()
    Promise.resolve().then(() => {
      // var range = document.createRange()
      range.selectNode(targetElm)
      window.getSelection().addRange(range)
      document.execCommand('copy')
      window.getSelection().removeAllRanges()
      document.body.removeChild(targetElm)
    })
  })
}

function printPropertyString(data, defaultKey) {
  let stringparts = [],
    gotDefaultKeyVal = false,
    defaultKeyVal;
  for (let key in data) {
    if (defaultKey !== undefined && key === defaultKey) {
      gotDefaultKeyVal = true;
      defaultKeyVal = value;
    } else {
      stringparts.push(key + '=' + data[key]);
    }
  }

  stringparts = stringparts.sort();
  if (gotDefaultKeyVal) {
    stringparts.unshift(defaultKeyVal);
  }
  return stringparts.join(',');
}

function httpProxy(v) {
  return (/^http:\/\/.*$/).test(v);
}

function macPrefix(v) {
  return (/^[a-f0-9][02468ace](?::[a-f0-9]{2}){0,2}:?$/i).test(v);
}

function proxmoxMail(v) {
  return (/^(\w+)([\-+.][\w]+)*@(\w[\-\w]*\.){1,5}([A-Za-z]){2,63}$/).test(v);
}
//解析任务id
function parse_task_upid(upid) {
  var task = {};

  var res = upid.match(/^UPID:([^\s:]+):([0-9A-Fa-f]{8}):([0-9A-Fa-f]{8,9}):(([0-9A-Fa-f]{8,16}):)?([0-9A-Fa-f]{8}):([^:\s]+):([^:\s]*):([^:\s]+):$/);
  if (!res) {
    throw "unable to parse upid '" + upid + "'";
  }
  task.node = res[1];
  task.pid = parseInt(res[2], 16);
  task.pstart = parseInt(res[3], 16);
  if (res[5] !== undefined) {
    task.task_id = parseInt(res[5], 16);
  }
  task.starttime = parseInt(res[6], 16);
  task.type = res[7];
  task.id = res[8];
  task.user = res[9];

  //task.desc = format_task_description(task.type, task.id);
  return task;
}

const isEmpty = function (val) {
  // null or undefined
  if (val == null) return true;

  if (typeof val === 'boolean') return false;

  if (typeof val === 'number') return !val;

  if (val instanceof Error) return val.message === '';

  switch (Object.prototype.toString.call(val)) {
    // String or Array
    case '[object String]':
    case '[object Array]':
      return !val.length;

    // Map or Set or File
    case '[object File]':
    case '[object Map]':
    case '[object Set]': {
      return !val.size;
    }
    // Plain Object
    case '[object Object]': {
      return !Object.keys(val).length;
    }
  }

  return false;
}

function parseACME(value) {
  if (!value) {
    return {};
  }

  var res = {};
  var error;

  value.split(',').forEach(p => {
    var kv = p.split('=', 2);
    if (!isEmpty(kv[1])) {
      res[kv[0]] = kv[1];
    } else {
      error = 'Failed to parse key-value pair: ' + p;
      return false;
    }
  });

  if (error !== undefined) {
    console.error(error);
    return;
  }

  if (res.domains !== undefined) {
    res.domains = res.domains.split(/;/);
  }

  return res;
}

function uplodFile(file, callback) {
  if (file.size > 8192) {
    Vue.$confim.error({
      msg: gettext("Invalid file size: ") + file.size
    });
    return;
  }
  let reader = new FileReader();
  reader.onload = function (evt) {
    callback(evt.target.result);
  };
  reader.readAsText(file);
}
export {
  getEvent,
  stopEvent,
  debounce,
  throttle,
  setCookie,
  parseCookie,
  getCookie,
  delCookie,
  treeNode,
  dateFormat,
  arrayToHeavy,
  bubbleSort,
  quickSort,
  deepCopy,
  capitalizeToAll,
  capitalizeToFirst,
  byteToSize,
  getEventTarget,
  render_uptime,
  requireAll2Obj,
  openConsoleWindow,
  getDocument,
  genUniqueId,
  browserLocalStorageGetItem,
  setEventDataToWindow,
  browserLocalStorageRemoveItem,
  browserLocalStorageSetItem,
  getEventDataFromWindow,
  isLongJobEvent,
  getIdentityUuid,
  isLeaf,
  setIconCls,
  flotToFixed,
  copyText,
  printPropertyString,
  httpProxy,
  macPrefix,
  proxmoxMail,
  percentToFixed,
  parse_task_upid,
  IP4_cidr_match,
  IP4_match,
  IP6_match,
  IP6_cidr_match,
  isEmpty,
  parseACME,
  uplodFile
}
