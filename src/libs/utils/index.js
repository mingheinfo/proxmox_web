const path = require('path');
import { http } from '@libs/http/index';
import { Container, Message } from 'element-ui';
import { gettext } from '@src/i18n/local_zhCN.js';
import { kvm_vga_drivers } from '@libs/enum/enum.js';

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
    //如果提供了事件对象，则这是一个非IE浏览器
    if ( ev && ev.stopPropagation )
    //因此它支持W3C的stopPropagation()方法
    ev.stopPropagation();
   else
  //否则，我们需要使用IE的方式来取消事件冒泡
    window.event.cancelBubble = true;
}
/**
 * @param fn要触发的回调，
 * @param delay隔多少时间触发
 * */
function debounce(fn, delay) {
  let timer;
  return function () {
    let context = this;
    let args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(function() {
      fn.apply(context, args)
    }, delay)
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
      func.apply(context, args);
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
 * 快速排序 @parma array原数组;
 * prop 根据哪个字段排序
 * order 默认降序排列 -表示降序, +表示升序
 * */
function quickSort(array, prop, order = '-') {
  if (!Array.isArray(array)) return;
  let sort = (arr, left = 0, right = arr.length - 1) => {
    if (left >= right) return;
    let i = left, j = right, baseVal = arr[j]//以最后一个元素为基准;
    while (i < j) {
      if (Object.prototype.toString.call(arr[i]) === '[object Object]' || Object.prototype.toString.call(arr[j]) === '[object Object]') {
        if (order == '-') {
          while (i < j && arr[i][prop] >= baseVal[prop]) {
            i++;
          }
          arr[j] = arr[i];
          while (i < j && arr[j][prop] <= baseVal[prop]) {
            j--;
          }
          arr[i] = arr[j];
        } else {
          while (i < j && arr[i][prop] <= baseVal[prop]) {
            i++;
          }
          arr[j] = arr[i];
          while (i < j && arr[j][prop] >= baseVal[prop]) {
            j--;
          }
          arr[i] = arr[j];
        }
      } else {
        while (i < j && arr[i] <= baseVal) {
          i++;
        }
        arr[j] = arr[i];
        while (i < j && arr[j] >= baseVal) {
          j--;
        }
        arr[i] = arr[j];
      }
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
    var params = { proxy: windowHostname() };
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
  var dlink = document.createElement('a');
  dlink.setAttribute('type', 'hidden');
  dlink.setAttribute('target', '_blank');
  dlink.href = "/shell/?" + url.slice(0, url.length - 1);
  document.body.appendChild(dlink);
  dlink.click();
  dlink.remove() 
  // a.setAttribute('href', "/shell/?" + url.slice(0, url.length - 1));  
  // a.setAttribute('target', '_blank');  
  // a.click();  
  //var nw = window.open("/shell/?" + url.slice(0, url.length - 1), '_blank', "innerWidth=745,innerheight=427");
  //nw && nw.focus();
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
  return window.localStorage.getItem(item);
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
  if(!info) return;
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
/***
 * 指纹解析
*/
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
//http代理
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
/***
 * 判断值是否为空
*/
const isEmpty = function (val) {
  // null or undefined
  if (val == null) return true;
  if (val == undefined) return true;

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
/***
 * 解析ACMA证书
*/
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
/**
 * 上传文件并在展示内容
*/
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
/**
 * 图片上传
*/
function uploadImage(file, callback) {
  let reader = new FileReader();
  reader.onerror = function(evt) {
    throw new Error(evt);
  }
  reader.onload = function(evt) {
    callback(evt)
  }
  reader.readAsDataURL(file);
}
//或得xhr对象
function getHttpXhr() {
  if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  } else {
    return new ActiveXObject();
  }
}
//文件上传下载，进度，错误
function uploadFile(url, data, callback) {
  //或得xhr对象
  let xhr = getHttpXhr();
  return new Promise((resolve, reject) => {
    //监听readState对象
    xhr.onreadystatechange = function (res) {
      if (xhr.readyState == 4 && xhr.status === 200) {
        resolve(xhr.responseText);
      } else if (/^[4|5](\d+){2}$/.test(xhr.status)) {
        reject(xhr.statusText);
      }
    }
    xhr.addEventListener("load", (ev) => callback(ev, xhr), false);
    xhr.addEventListener("error", (ev) => callback(ev, xhr), false)
    xhr.upload.addEventListener('progress', (ev) => callback(ev, xhr), false)
    xhr.withCredentials = true;//设置跨域
    xhr.open("POST", url, true);
    xhr.send(data);
  })
}
//获取文件Url
function getFileUrl(file) {
  if (window.webkitURL) {
    return window.webkitURL.createObjectURL(file);
  } else if (window.URL) {
    return window.URL.createObjectURL(file);
  } else if (window.createObjectURL) {
    return window.createObjectURL(file);
  }
}

function render_upid(value, metaData, record) {
  var type = record.type;
  var id = record.id;

  return format_task_description(type, id);
}
/***
 * 格式化任务日志描述
*/
function format_task_description(type, id) {
  var farray = task_desc_table[type];
  var text;
  if (!farray) {
    text = type;
    if (id) {
      type += ' ' + id;
    }
    return text;
  }
  var prefix = farray[0];
  text = farray[1];
  if (prefix) {
    return prefix + ' ' + id + ' - ' + text;
  }
  return text;
}

const contentTypes = {
  'images': gettext('Disk image'),
  'backup': gettext('VZDump backup file'),
  'vztmpl': gettext('Container template'),
  'iso': gettext('ISO image'),
  'rootdir': gettext('Container'),
  'snippets': gettext('Snippets')
}
//判断是否是Number类型
function isNumber(value) {
  return typeof value === 'number'
}
function format_content_types(value) {
  return value.split(',').sort().map(function (ct) {
    return contentTypes[ct] || ct;
  }).join(', ');
}
function leftPad(string, size, character) {
  var result = String(string);
  character = character || " ";
  while (result.length < size) {
    result = character + result;
  }
  return result;
}

function render_storage_content(value, metaData, record) {
  var data = record;
  if (isNumber(data.channel) &&
    isNumber(data.id) &&
    isNumber(data.lun)) {
    return "CH " +
      leftPad(data.channel, 2, '0') +
      " ID " + data.id + " LUN " + data.lun;
  }
  return data.volid.replace(/^.*?:(.*?\/)?/, '');
}
const task_desc_table = {
  acmenewcert: ['SRV', gettext('Order Certificate')],
  acmeregister: ['ACME Account', gettext('Register')],
  acmedeactivate: ['ACME Account', gettext('Deactivate')],
  acmeupdate: ['ACME Account', gettext('Update')],
  acmerefresh: ['ACME Account', gettext('Refresh')],
  acmerenew: ['SRV', gettext('Renew Certificate')],
  acmerevoke: ['SRV', gettext('Revoke Certificate')],
  'auth-realm-sync': [gettext('Realm'), gettext('Sync')],
  'auth-realm-sync-test': [gettext('Realm'), gettext('Sync Preview')],
  'move_volume': ['CT', gettext('Move Volume')],
  clustercreate: ['', gettext('Create Cluster')],
  clusterjoin: ['', gettext('Join Cluster')],
  diskinit: ['Disk', gettext('Initialize Disk with GPT')],
  vncproxy: ['VM/CT', gettext('Console')],
  spiceproxy: ['VM/CT', gettext('Console') + ' (Spice)'],
  vncshell: ['', gettext('Shell')],
  spiceshell: ['', gettext('Shell') + ' (Spice)'],
  qmsnapshot: ['VM', gettext('Snapshot')],
  qmrollback: ['VM', gettext('Rollback')],
  qmdelsnapshot: ['VM', gettext('Delete Snapshot')],
  qmcreate: ['VM', gettext('Create')],
  qmrestore: ['VM', gettext('Restore')],
  qmdestroy: ['VM', gettext('Destroy')],
  qmigrate: ['VM', gettext('Migrate')],
  qmclone: ['VM', gettext('Clone')],
  qmmove: ['VM', gettext('Move disk')],
  qmtemplate: ['VM', gettext('Convert to template')],
  qmstart: ['VM', gettext('Start')],
  qmstop: ['VM', gettext('Stop')],
  qmreset: ['VM', gettext('Reset')],
  qmshutdown: ['VM', gettext('Shutdown')],
  qmreboot: ['VM', gettext('Reboot')],
  qmsuspend: ['VM', gettext('Hibernate')],
  qmpause: ['VM', gettext('Pause')],
  qmresume: ['VM', gettext('Resume')],
  qmconfig: ['VM', gettext('Configure')],
  vzsnapshot: ['CT', gettext('Snapshot')],
  vzrollback: ['CT', gettext('Rollback')],
  vzdelsnapshot: ['CT', gettext('Delete Snapshot')],
  vzcreate: ['CT', gettext('Create')],
  vzrestore: ['CT', gettext('Restore')],
  vzdestroy: ['CT', gettext('Destroy')],
  vzmigrate: ['CT', gettext('Migrate')],
  vzclone: ['CT', gettext('Clone')],
  vztemplate: ['CT', gettext('Convert to template')],
  vzstart: ['CT', gettext('Start')],
  vzstop: ['CT', gettext('Stop')],
  vzmount: ['CT', gettext('Mount')],
  vzumount: ['CT', gettext('Unmount')],
  vzshutdown: ['CT', gettext('Shutdown')],
  vzreboot: ['CT', gettext('Reboot')],
  vzsuspend: ['CT', gettext('Suspend')],
  vzresume: ['CT', gettext('Resume')],
  push_file: ['CT', gettext('Push file')],
  pull_file: ['CT', gettext('Pull file')],
  hamigrate: ['HA', gettext('Migrate')],
  hastart: ['HA', gettext('Start')],
  hastop: ['HA', gettext('Stop')],
  hashutdown: ['HA', gettext('Shutdown')],
  srvstart: ['SRV', gettext('Start')],
  srvstop: ['SRV', gettext('Stop')],
  srvrestart: ['SRV', gettext('Restart')],
  srvreload: ['SRV', gettext('Reload')],
  cephcreatemgr: ['Ceph Manager', gettext('Create')],
  cephdestroymgr: ['Ceph Manager', gettext('Destroy')],
  cephcreatemon: ['Ceph Monitor', gettext('Create')],
  cephdestroymon: ['Ceph Monitor', gettext('Destroy')],
  cephcreateosd: ['Ceph OSD', gettext('Create')],
  cephdestroyosd: ['Ceph OSD', gettext('Destroy')],
  cephcreatepool: ['Ceph Pool', gettext('Create')],
  cephdestroypool: ['Ceph Pool', gettext('Destroy')],
  cephfscreate: ['CephFS', gettext('Create')],
  cephcreatemds: ['Ceph Metadata Server', gettext('Create')],
  cephdestroymds: ['Ceph Metadata Server', gettext('Destroy')],
  imgcopy: ['', gettext('Copy data')],
  imgdel: ['', gettext('Erase data')],
  unknownimgdel: ['', gettext('Destroy image from unknown guest')],
  download: ['', gettext('Download')],
  vzdump: ['VM/CT', gettext('Backup')],
  aptupdate: ['', gettext('Update package database')],
  startall: ['', gettext('Start all VMs and Containers')],
  stopall: ['', gettext('Stop all VMs and Containers')],
  migrateall: ['', gettext('Migrate all VMs and Containers')],
  dircreate: [gettext('Directory Storage'), gettext('Create')],
  lvmcreate: [gettext('LVM Storage'), gettext('Create')],
  lvmthincreate: [gettext('LVM-Thin Storage'), gettext('Create')],
  zfscreate: [gettext('ZFS Storage'), gettext('Create')]
}
const log_severity_hash = {
  0: "panic",
  1: "alert",
  2: "critical",
  3: "error",
  4: "warning",
  5: "notice",
  6: "info",
  7: "debug"
}
//渲染日志级别
function render_serverity(value) {
  return log_severity_hash[value] || value;
}
/***
 * 格式化字符串描述将字符串中的{数字}用参数中的值代替
*/
function stringFormat(str) {
  let arg = arguments;
  for (let i in arg) {
    str = str.replace(/(\{\d+\})/, function (o) {
      return arg[Number(i) + 1];
    }
    )
  }
  return str;
}

function render_qemu_bios(value) {
  if (!value) {
    return '默认' + ' (SeaBIOS)';
  } else if (value === 'seabios') {
    return "SeaBIOS";
  } else if (value === 'ovmf') {
    return "OVMF (UEFI)";
  } else {
    return value;
  }
}
function render_kvm_vga_driver(value) {
  if (!value) {
    return "默认";
  }
  let vga = parsePropertyString(value, 'type');
  let text = kvm_vga_drivers[vga.type];
  if (!vga.type) {
    text = "默认";
  }
  if (text) {
    return text + ' (' + value + ')';
  }
  return value;
}

function parsePropertyString(value, defaultKey) {
  let res = {},
    error;

  if (typeof value !== 'string' || value === '') {
    return res;
  }

  value.split(',').forEach((p) => {
    let kv = p.split('=', 2);
    if (!isEmpty(kv[1])) {
      res[kv[0]] = kv[1];
    } else if (!isEmpty(defaultKey)) {
      if (!isEmpty(res[defaultKey])) {
        error = 'defaultKey may be only defined once in propertyString';
        return false; // break
      }
      res[defaultKey] = kv[0];
    } else {
      error = 'invalid propertyString, not a key=value pair and no defaultKey defined';
      return false; // break
    }
  });

  if (error !== undefined) {
    console.error(error);
    return;
  }

  return res;
}

const diskControllerMaxIDs = {
  ide: 4,
  sata: 6,
  scsi: 31,
  virtio: 16,
}

function forEachBus(types, func) {
  var busses = Object.keys(diskControllerMaxIDs);
  var i, j, count, cont;

  if (Array.isArray(types)) {
    busses = types;
  } else if (!isEmpty(types)) {
    busses = [types];
  }

  // check if we only have valid busses
  for (i = 0; i < busses.length; i++) {
    if (!diskControllerMaxIDs[busses[i]]) {
      throw "invalid bus: '" + busses[i] + "'";
    }
  }

  for (i = 0; i < busses.length; i++) {
    count = diskControllerMaxIDs[busses[i]];
    for (j = 0; j < count; j++) {
      cont = func(busses[i], j);
      if (!cont && cont !== undefined) {
        return;
      }
    }
  }
}
//解析启动
function parseStartup(value) {
  if (value === undefined) {
    return;
  }

  var res = {};

  var errors = false;
  value.split(',').forEach(function (p) {
    if (!p || p.match(/^\s*$/)) {
      return; // continue
    }

    var match_res;

    if ((match_res = p.match(/^(order)?=(\d+)$/)) !== null) {
      res.order = match_res[2];
    } else if ((match_res = p.match(/^up=(\d+)$/)) !== null) {
      res.up = match_res[1];
    } else if ((match_res = p.match(/^down=(\d+)$/)) !== null) {
      res.down = match_res[1];
    } else {
      errors = true;
      return false; // break
    }
  });

  if (errors) {
    return;
  }
  return res;
}

function render_kvm_ostype(value) {
  var osinfo = get_kvm_osinfo(value);
  if (osinfo.desc && osinfo.desc !== '-') {
    return osinfo.base + ' ' + osinfo.desc;
  } else {
    return osinfo.base;
  }
}
const kvm_ostypes = {
  'Linux': [
    { desc: '5.x - 2.6 Kernel', val: 'l26' },
    { desc: '2.4 Kernel', val: 'l24' }
  ],
  'Microsoft Windows': [
    { desc: '10/2016/2019', val: 'win10' },
    { desc: '8.x/2012/2012r2', val: 'win8' },
    { desc: '7/2008r2', val: 'win7' },
    { desc: 'Vista/2008', val: 'w2k8' },
    { desc: 'XP/2003', val: 'wxp' },
    { desc: '2000', val: 'w2k' }
  ],
  'Solaris Kernel': [
    { desc: '-', val: 'solaris' }
  ],
  'Other': [
    { desc: '-', val: 'other' }
  ]
}

function get_kvm_osinfo(value) {
  var info = { base: 'Other' }; // default
  if (value) {
    Object.keys(kvm_ostypes).forEach(function (k) {
      kvm_ostypes[k].forEach(function (e) {
        if (e.val === value) {
          info = { desc: e.desc, base: k };
        }
      });
    });
  }
  return info;
}

function render_hotplug_features(value) {
  var fa = [];

  if (!value || (value === '0')) {
    return gettext('Disabled');
  }

  if (value === '1') {
    value = 'disk,network,usb';
  }

  value.split(',').forEach(function (el) {
    if (el === 'disk') {
      fa.push(gettext('Disk'));
    } else if (el === 'network') {
      fa.push(gettext('Network'));
    } else if (el === 'usb') {
      fa.push('USB');
    } else if (el === 'memory') {
      fa.push(gettext('Memory'));
    } else if (el === 'cpu') {
      fa.push(gettext('CPU'));
    } else {
      fa.push(el);
    }
  });

  return fa.join(', ');
}

function render_spice_enhancements(values) {
  let props = parsePropertyString(values);
  if (isEmpty(props)) {
    return '否';
  }

  let output = [];
  if (parseBoolean(props.foldersharing)) {
    output.push('Folder Sharing: ' + gettext('Enabled'));
  }
  if (props.videostreaming === 'all' || props.videostreaming === 'filter') {
    output.push('Video Streaming: ' + props.videostreaming);
  }
  return output.join(', ');
}
function parseBoolean(value, default_value) {
  if (isEmpty(value)) {
    return default_value;
  }
  value = value.toLowerCase();
  return value === '1' ||
    value === 'on' ||
    value === 'yes' ||
    value === 'true';
}


function render_qga_features(value) {
  if (!value) {
    return '默认' + ' (已禁用)';
  }
  var props = parsePropertyString(value, 'enabled');
  if (props && props.enabled && !parseBoolean(props.enabled)) {
    return '已禁用';
  }

  delete props.enabled;
  var agentstring = '可用';

  Object.keys(props).forEach((value, index) => {
    var keystring = '';
    agentstring += ', ' + value + ': ';

    if (value === 'type') {
      let map = {
        isa: "ISA",
        virtio: "VirtIO",
      };
      agentstring += map[props[value]] || '未知';
    } else {
      if (parseBoolean(value)) {
        agentstring += '可用';
      } else {
        agentstring += '可用';
      }
    }
  });

  return agentstring;
}

function format_duration_short(ut) {

  if (ut < 60) {
    return ut.toFixed(1) + 's';
  }

  if (ut < 3600) {
    var mins = ut / 60;
    return mins.toFixed(1) + 'm';
  }

  if (ut < 86400) {
    var hours = ut / 3600;
    return hours.toFixed(1) + 'h';
  }

  var days = ut / 86400;
  return days.toFixed(1) + 'd';
}

/**
 * 格式化日期带有星期 Fri Nov 27 2020 09:04:55 GMT+0800
 * @param value 时间戳
*/
function formatDateForWeek(value, format) {
  if (isEmpty(value)) return;
  let date = new Date(value);
  let d = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let week = {
    5: '星期五',
    4: '星期四',
    3: '星期三',
    2: '星期二',
    1: '星期一',
    6: '星期六',
    0: '星期日'
  }
  if (/(w+)/.test(format)) {
    format = format.replace(RegExp.$1, (week[date.getDay()] + ' '))
  }
  for (let o in d) {
    if (new RegExp(`(${o})`).test(format)) {
      let str = d[o] + ''
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str))
    }
  }
  return format;
}

const mp_counts = { mps: 256, unused: 256 };

function forEachMP(func, includeUnused) {
  var i, cont;
  for (i = 0; i < mp_counts.mps; i++) {
    cont = func('mp', i);
    if (!cont && cont !== undefined) {
      return;
    }
  }

  if (!includeUnused) {
    return;
  }

  for (i = 0; i < mp_counts.unused; i++) {
    cont = func('unused', i);
    if (!cont && cont !== undefined) {
      return;
    }
  }
}
/***
 * 解析公钥数据 @param key公钥字符串
*/
function parseSSHKey(key) {
	//                |--- options can have quotes--|     type    key        comment
	var keyre = /^(?:((?:[^\s"]|\"(?:\\.|[^"\\])*")+)\s+)?(\S+)\s+(\S+)(?:\s+(.*))?$/;
	var typere = /^(?:ssh-(?:dss|rsa|ed25519)|ecdsa-sha2-nistp\d+)$/;

	var m = key.match(keyre);
	if (!m) {
	    return null;
	}
	if (m.length < 3 || !m[2]) { // [2] is always either type or key
	    return null;
	}
	if (m[1] && m[1].match(typere)) {
	    return {
		type: m[1],
		key: m[2],
		comment: m[3]
	    };
	}
	if (m[2].match(typere)) {
	    return {
		options: m[1],
		type: m[2],
		key: m[3],
		comment: m[4]
	    };
	}
	return null;
}

/**
 * 展示错误信息
 * **/
function confirm(message, type, icon, yesText) {
  return this.$confirm[type ? type : 'error']({
    msg: message,
    icon: icon ? icon : 'icon-error',
    yesBtnText: yesText ? yesText : '确定'
  })
}

/**
 * 前端分组
 * **/
function chunkData(arr, pageSize) {
   let num =0, chunkArr = [];
   //计算总页数当页码大于总条数时除以总条数
   if(pageSize <= arr.length) {
     num = Math.ceil(arr.length / pageSize)
   } else {
    num = Math.ceil(arr.length / arr.length)
   }
   for(let i = 0, j = 0 ; i < num; i++) {
     let newArr = [], k = (i + 1) * pageSize;;
     while(j < arr.length) {
        while(j < k ) {
          if(arr[j]) {
            newArr.push(arr[j]);
          }
          j++;
          continue;
        }
        if(j == k) break;
     }
     chunkArr.push(newArr);
   }
   return chunkArr;
}

const on = (function() {
  if (document.addEventListener) {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    };
  } else {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler);
      }
    };
  }
})();

/* istanbul ignore next */
const off = (function() {
  if (document.removeEventListener) {
    return function(element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  } else {
    return function(element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler);
      }
    };
  }
})();

function parseQemuDrive(key, value) {
  if (!(key && value)) {
    return;
  }

  var res = {};

  var match_res = key.match(/^([a-z]+)(\d+)$/);
  if (!match_res) {
    return;
  }
  res['interface'] = match_res[1];
  res.index = match_res[2];

  var errors = false;
  value.split(',').forEach(function(p) {
    if (!p || p.match(/^\s*$/)) {
      return; // continue
    }
    var match_res = p.match(/^([a-z_]+)=(\S+)$/);
    if (!match_res) {
      if (!p.match(/\=/)) {
        res.file = p;
        return; // continue
      }
      errors = true;
      return false; // break
    }
    var k = match_res[1];
    if (k === 'volume') {
      k = 'file';
    }

    if (typeof res[k] !== 'undefined') {
      errors = true;
      return false; // break
    }

    var v = match_res[2];

    if (k === 'cache' && v === 'off') {
      v = 'none';
    }

    res[k] = v;
  });

  if (errors || !res.file) {
    return;
  }

  return res;
}

//数组对象去重
function getUniqueObj(arrays) {
  let newArr = [],
      str = '',
      strArr = [];
  for(let i = 0; i < arrays.length; i++) {
    str = JSON.stringify(arrays[i]);
    if(strArr.indexOf(str) < 0) {
      newArr.push(arrays[i]);
      strArr.push(str);
    }
  }
  return newArr;
}
//判断是否有这个class
function hasClass(cls) {
  let classes = this.className.split(' ');
  return classes.includes(cls);
}


function isIE() {
  if(!!window.ActiveXObject || 'ActiveXObject' in window) {
    return true;
  } 
  return false;
}
//得到ie浏览器版本
function ieVersion() {
  let userAgent = window.navigator.userAgent,
      isMSIE = userAgent.indexOf('MSIE') > -1;
  if(isMSIE) {
    /[MSIE]\s(\d+)/.test(userAgent);
    return RegExp.$1;
  } else {
    /[rv:](\d+)/.test(userAgent);
    return RegExp.$1;
  }
}

/**
 * 精确加法
 */
function add(num1, num2) {
  const num1Digits = (num1.toString().split('.')[1] || '').length;
  const num2Digits = (num2.toString().split('.')[1] || '').length;
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
};
/**
 * 精确减法
 * **/
function subtract(num1, num2) {
  const num1Digits = (num1.toString().split('.')[1] || '').length;
  const num2Digits = (num2.toString().split('.')[1] || '').length;
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum - num2 * baseNum) / baseNum;
}

/**
 * 精确乘法
 * @param {arg1} 表示浮点数
 * @param {arg2} 表示浮点数
 * 小数点等于每个乘数的小数点位数相加
 * **/
function multiply(arg1, arg2) {
  //m表示有多少个小数点
  var m=0,s1=arg1.toString(),s2=arg2.toString();  
  try
  {
    m+=s1.split(".")[1].length
  }
  catch(e)
  {
    
  }  
  try{
    m+=s2.split(".")[1].length
  }
  catch(e)
  {

  }  
  return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);  
}

/**
 * 精确除法
 * **/
function divide(arg1, arg2) {
  var t1=0,t2=0,r1,r2;  
  try
  {
    t1=arg1.toString().split(".")[1].length
  }
  catch(e)
  {

  }  
  try
  {
    t2=arg2.toString().split(".")[1].length
  }
  catch(e)
  {

  }  
  r1=Number(arg1.toString().replace(".",""));  
  r2=Number(arg2.toString().replace(".",""));  
  return (r1/r2)*Math.pow(10,t2-t1);   
};

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
  IP64_match,
  isEmpty,
  parseACME,
  uplodFile,
  render_upid,
  format_content_types,
  render_storage_content,
  uploadFile,
  getFileUrl,
  format_task_description,
  render_serverity,
  stringFormat,
  render_qemu_bios,
  render_kvm_vga_driver,
  forEachBus,
  parseStartup,
  render_kvm_ostype,
  render_hotplug_features,
  render_spice_enhancements,
  render_qga_features,
  format_duration_short,
  formatDateForWeek,
  forEachMP,
  parseSSHKey,
  confirm,
  chunkData,
  on,
  off,
  parseQemuDrive,
  parsePropertyString,
  getUniqueObj,
  hasClass,
  isIE,
  ieVersion,
  add,
  subtract,
  multiply,
  divide,
  uploadImage
}
