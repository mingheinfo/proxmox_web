const IPV4_OCTET = "(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])";
const IPV4_REGEXP = "(?:(?:" + IPV4_OCTET + "\\.){3}" + IPV4_OCTET + ")";
const IPV6_H16 = "(?:[0-9a-fA-F]{1,4})";
const IPV6_LS32 = "(?:(?:" + IPV6_H16 + ":" + IPV6_H16 + ")|" + IPV4_REGEXP + ")";
const IPV6_REGEXP = "(?:" +
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
const IP64_match = new RegExp("^(?:" + IPV6_REGEXP + "|" + IPV4_REGEXP + ")$");
export default class Socket {
	constructor(url, cb) {
		this.socket = null;
		this.url = '';
		this.url = url;
		this.lockReconnet = false;
		this.isReconnet = false;
		this.timeoutObj = null;
		this.serverTimeoutObj = null;
		this.cb = cb;
		this.timeout = 60 * 1000;//心跳时间
	}

	onmessage() {
		if(this.socket)
		this.socket.onmessage = (ev) => {
			this.getMsg(ev);
			this.reset();
			this.isReconnet = false;
		}
	}
	//接收服务器端数据
	getMsg(ev) {
    this.cb(ev);
	}

	onerror() {
		if(this.socket)
		this.socket.onerror = () => {
			console.log('websocket服务出错了---onerror');
			this.start();
			this.reconnet(this.url);
		}
	}
  //重连
	reconnet() {
		if (this.lockReconnet)
		return false
	  this.isReconnet = true;
	  this.lockReconnet = true
	  setTimeout(() => {
		  new Socket(this.url);
		  this.lockReconnet = false
	  }, 60 * 1000)
	}
  //打开socket链接
	onopen() {
		if(this.socket)
		this.socket.onopen = () => {
			console.log('socket连接成功')
			if (this.isReconnet) {//执行全局回调函数
				console.log('websocket重新连接了');
				this.isReconnet = false
			}
		}
	}
  //断开socket链接
	onclose() {
		if(this.socket)
		this.socket.onclose =() => {
			console.log("socket连接已关闭");
			this.reset();
		}
	}
	sendMsg (arg) { //发送数据,接收数据
		let data = Object.create(null);
		if(this.socket)
		if (this.socket.readyState === 1) {
			data = JSON.stringify(arg);
			this.socket.send(arg);
		} else {
			setTimeout(() => {
				console.log(socket, '等待socket链接成功')
			  this.sendMsg(data)
			}, 1500)
			return false
		}
	}

	reset() {
		clearTimeout(this.timeoutObj)
		clearTimeout(this.serverTimeoutObj)
	}

	start() {
		if(this.socket)
		this.timeoutObj = setTimeout(() => {
			//发送数据，如果onmessage能接收到数据，表示连接正常,然后在onmessage里面执行reset方法清除定时器
			this.socket.send('heart check')
			this.serverTimeoutObj = setTimeout(() => {
				this.socket.close()
			}, this.timeout)
		}, this.timeout)
	}

  windowHostname() {
		return window.location.hostname.replace(/(http|https)/, 'wss');
	}

	init(url, cb) {
		this.url = url;
		this.cb = cb;
		if ('WebSocket' in window) {
			//无nginx
			//this.socket = new WebSocket('ws://' + location.origin.replace(/(http\:\/\/|https:\/\/)/, '') + '/ws' +this.url + `?accessToken=${window.localStorage.getItem("accessToken")}`)
      this.socket = new WebSocket(this.url)//有nginx
		} else if ('MozWebSocket' in window) {
			//无nginx
			//this.socket = new MozWebSocket('ws://' + location.origin.replace(/(http\:\/\/|https:\/\/)/, '') + '/ws' + this.url + `?accessToken=${window.localStorage.getItem("accessToken")}`)
      this.socket = new MozWebSocket(this.url)//有nginx
		}
		this.onopen();
		this.onmessage();
		this.onerror();
		this.onclose();
	}
}
