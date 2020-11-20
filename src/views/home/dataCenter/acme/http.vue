<script>
import { parse_task_upid } from '@libs/utils/index'
export default {
  name: "AcmeHttp",
  methods: {
    queryAcmePluginsList() {
      return this.$http.get("json/cluster/acme/plugins").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "acmePluginList",
            list: res.data,
          });
        }
      });
    },
    queryAcmeAccountList() {
      return this.$http.get("json/cluster/acme/account").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "acmeAccountList",
            list: res.data,
          });
        }
      });
    },
    queryAcmeTos(param) {
      return this.$http
        .get(`json/cluster/acme/tos`, {
          _dc: new Date().getTime(),
          directory: param,
        })
        .then((res) => {
          if (res.data) {
						this.tos_url = res.data;
          }
        }).catch((res) => {
					this.$confirm.info({
						msg: res
					})
				});
    },
    queryAcmeDirection() {
      return this.$http.get(`json/cluster/acme/directories`).then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "directoriesList",
            list: res.data,
          });
        }
      });
		},
		createAcmeAccount(param) {
			 let event = this.createEvent('action.acme.account.create');
			return this.$http.post(`json/cluster/acme/account`, param, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charst=utf8'
				}
			}).then(async (res) => {
				 if(res.data) {
         	let task = parse_task_upid(res.data);
					await this.queryLog(task.node,res.data);
					await this.queryStatus(task.node,res.data);
				}
					this.incEventSuccess(event);
			}).catch(res => {
				 this.incEventFail(event);
				 return Promise.reject(res);
			})
		},
		queryLog(node, pid) {
			return this.$http.get(`json/nodes/${node}/tasks/${pid}/log`, {
				_dc: new Date().getTime(),
				start: 0,
				limit: 500
			}).then((res) => {
				this.updateTable({
					tableName: 'addClusterLogList',
					list: res.data
				})
			})	
		},
		queryStatus(node, pid) {
			return this.$http.get(`json/nodes/${node}/tasks/${pid}/status`, {
				_dc: new Date().getTime(),
			}).then((res) => {
				if(res.data.status !== 'running' && this.interVal) {
					clearInterval(this.interVal);
					this.interVal = null;
				}
				return this.updateDbObject({
					name: 'addClusterStatusObj',
					data: res.data
				})
			})	
		},
		stopTask(node, pid) {
			return this.$http.del(`json/nodes/${node}/tasks/${pid}`)
		},	
		queryAcmeAccountById(id) {
      return this.$http.get(`json/cluster/acme/account/${id}`, {
				_dc: new Date().getTime()
			}).then((res) => {
				if (res.data) {
            this.updateDbObject({
              name: "acmeAccountObj",
              data: res.data,
            });
         }
			})
		},
		deleteAcmeAccount() {
			let event = this.createEvent("action.acme.account.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((id) => {
          p = this.$http
            .del(`json/cluster/acme/account/${id}`)
            .then(async (res) => {
							if(res.data) {
									let task = parse_task_upid(res.data);
									this.incEventSuccess(event);
						     	this.queryAcmeAccountList();
				         return	await this.queryStatus(task.node,res.data);
							}
            })
            .catch((res) => {
							this.incEventFail(event);
							return Promise.reject(res);
            });
        })(item.name);
        tasks.push(p);
      });
      return Promise.all(tasks);	
		},
		queryDNSApiList() {
			return this.$http.get('json/cluster/acme/challenge-schema')
			           .then((res) => {
                    if(res.data) {
										this.updateTable({
											tableName: 'dnsApiList',
											list: res.data
										})
										}
								 })
		},
		createPlugin(param) {
			let event = this.createEvent('action.acme.plugin.create')
			return this.$http.post('json/cluster/acme/plugins/', param, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=utf8'
				}
			}).then(async (res) => {
					this.incEventSuccess(event);
			}).catch(res => {
				 this.incEventFail(event);
				 return Promise.reject(res);
			})
		},
		queryAcmePluginById(id) {
			return this.$http.get(`json/cluster/acme/plugins/${id}`, {
				_dc: new Date().getTime()
			}).then((res) => {
				if (res.data) {
            this.updateDbObject({
              name: "acmePluginObj",
              data: res.data,
            });
         }
			})
		},
		updateDnsApiPlugin(id, param) {
			let event = this.createEvent('action.acme.plugin.update');
			return this.$http.put('json/cluster/acme/plugins/' + id, param, {
         headers: {
					 	'content-type': 'application/x-www-form-urlencoded; charst=utf8'
				 }
			}).then((res) => {
					this.incEventSuccess(event);
			}).catch(res => {
				 this.incEventFail(event);
				 return Promise.reject(res);
			})
		},
		deleteAcmePlugin() {
				let event = this.createEvent("action.acme.plugin.delete");
      let tasks = [],
        p;
      this.selectedPluginList.forEach((item) => {
        ((id) => {
          p = this.$http
            .del(`json/cluster/acme/plugins/${id}`)
            .then(async (res) => {
							 this.__init__();
							 	this.incEventSuccess(event);
            })
            .catch((res) => {
							this.incEventFail(event);
							return Promise.reject(res);
            });
        })(item.plugin);
        tasks.push(p);
      });
      return Promise.all(tasks);	
		}
  },
};
</script>