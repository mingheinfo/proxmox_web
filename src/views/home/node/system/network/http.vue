<script>
import {isEmpty} from '@libs/utils/index';
export default {
	name: 'NetWorkHttp',
	 data() {
    return {
      node: "",
    };
  },
  mounted() {
    let last = window.localStorage.getItem("lastsel") || "[]";
    this.node = (JSON.parse(last).node && JSON.parse(last).node) || "";
  },
	methods: {
		queryNetWorkList(param) {
			return this.$http.get(`json/nodes/${this.node}/network`, param).then(res => {
				if(res.data) {
					this.updateTable({
						tableName: 'nodeNetWorkList',
						list: res.data
					})
				}
				if(res.changes) {
					this.changes = res.changes;
				} else {
					this.changes = ""
				}
			})
		},
		createNetWork(param) {
			let event = this.createEvent('action.node.network.create');
			return this.$http.post(`json/nodes/${this.node}/network`, param, {
				headers: {
					'content-type': "application/x-www-form-urlencoded; charset=utf8;"
				}
			}).then((res) => {
        this.incEventSuccess(event);
			}).catch((res) => {
				this.incEventFail(event);
				return Promise.reject(res);
			})
		},
		//网络的删除、还原、
		resume() {
	    let event = this.createEvent(`action.node.network.resume`);
			return this.$http.del(`json/nodes/${this.node}/network`).then((res) => {
				this.incEventSuccess(event);
				this.queryNetWorkList({_dc: new Date().getTime()});
			}).catch((res) => {
				this.incEventFail(event);
				return Promise.reject(res);
			})
		},
		//更新网络
		updateNetWork(iface, param) {
			debugger
			let event = this.createEvent(`action.node.network.update`);
		      return this.$http.put(`json/nodes/${this.node}/network/${iface}`, param, {
						headers: {
							'content-type': 'application/x-www-form-urlencoded; charset=utf8'
						}
					}).then((res) => {
				this.incEventSuccess(event);
			}).catch((res) => {
				this.incEventFail(event);
				return Promise.reject(res);
			})
		},
		//删除网络
		deleteNetWork() {
			let event = this.createEvent(`action.node.network.delete`),
			tasks = [],
			p;
			if(isEmpty(this.selectedList)) return;
			this.selectedList.forEach(it => {
				p = ((it) => {
					this.$http.del(`json/nodes/${this.node}/network/${it.iface}`)
					    .then((res) => {
								this.incEventSuccess(event);
							})
							.catch((res) => {
								this.incEventFail(event);
								return Promise.reject(res);
							})
				})(it)
				tasks.push(p);
			})
			return Promise.all(tasks);
		},
		//应用配置
		netWorkConfig() {
			let event = this.createEvent(`action.node.network.update`);
		      return this.$http.put(`json/nodes/${this.node}/network`, {}, {
						headers: {
							'content-type': 'application/x-www-form-urlencoded; charset=utf8'
						}
					}).then((res) => {
				this.incEventSuccess(event);
			}).catch((res) => {
				this.incEventFail(event);
				return Promise.reject(res);
			})
		}
	}
}
</script>