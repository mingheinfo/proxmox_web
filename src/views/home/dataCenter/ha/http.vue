<script>
import { deepCopy } from '@libs/utils/index';
export default {
  name: "HaHttp",
  methods: {
    queryHaStatus() {
      return this.$http.get(`json/cluster/ha/status/current`).then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "haStatusList",
            list: res.data,
          }).then(() => {
						this.updateTable({
            tableName: "haResourceList",
            list: res.data.filter(it => it.type === 'service'),
          });
					})
        }
      });
		},
		queryHaResource() {
			return this.$http.get('json/cluster/ha/resources').then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "haResourceList",
            list: res.data,
          });
        }
      });
		},
    queryNode() {
      return this.$http
        .get("json/cluster/config/nodes", {
          _dc: new Date().getTime(),
        })
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "nodeList",
              list: res.data,
            });
          }
        });
    },
    queryGroups() {
      return this.$http
        .get("json/cluster/ha/groups", {
          _dc: new Date().getTime(),
        })
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "groupsList",
              list: res.data,
            });
          }
        });
		},
		queryResource() {
			 return this.$http
        .get("json/cluster/resources")
        .then((res) => {
          if (res.data) {
					  return Promise.resolve(res.data);
          }
        });
		},
		createHa(param) {
			let event = this.createEvent('action.ha.create');
			return this.$http.post(`json/cluster/ha/resources`, param, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charst=utf8'
				}
			}).then((res) => {
					this.queryHaStatus();
					this.queryHaResource();
					this.incEventSuccess(event);
			}).catch(res => {
				 this.incEventFail(event);
				 return Promise.reject(res);
			})
		},
		updateHa(param) {
			let event = this.createEvent('action.ha.update');
			let params = deepCopy(param);
			delete params.sid;
			return this.$http.put('json/cluster/ha/resources/' + param.sid, params, {
         headers: {
					 	'content-type': 'application/x-www-form-urlencoded; charst=utf8'
				 }
			}).then((res) => {
					this.queryHaStatus();
					this.queryHaResource();
					this.incEventSuccess(event);
			}).catch(res => {
				 this.incEventFail(event);
				 return Promise.reject(res);
			})
		},
		deleteHa() {
		 let event = this.createEvent("action.access.ha.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((sid) => {
          p = this.$http
            .del(`/json/cluster/ha/resources/${sid}`)
            .then(() => {
              this.incEventSuccess(event);
							this.queryHaStatus();
							this.queryHaResource();
            })
            .catch(() => {
              this.incEventFail(event);
            });
        })(item.sid);
        tasks.push(p);
      });
      return Promise.all(tasks);	
		},
		createHaGroup(param) {
		  let event = this.createEvent('action.ha.group.create');
			return this.$http.post(`json/cluster/ha/groups`, param, {
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
		queryGroupsById(param) {
			return this.$http.get(`json/cluster/ha/groups/${param.id}`, {
				_dc: new Date().getTime()
			}).then((res) => {
				if (res.data) {
            this.updateDbObject({
              name: "groupsObj",
              data: res.data,
            });
         }
			})
		},
		updateHaGroup(id, param) {
			let event = this.createEvent('action.ha.group.lupdate');
			return this.$http.put('json/cluster/ha/groups/' + id, param, {
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
		deleteHaGroup() {
		 let event = this.createEvent("action.access.ha.group.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((id) => {
          p = this.$http
            .del(`/json/cluster/ha/groups/${id}`)
            .then(() => {
              this.incEventSuccess(event);
							this.queryGroups();
            })
            .catch(() => {
              this.incEventFail(event);
            });
        })(item.group);
        tasks.push(p);
      });
      return Promise.all(tasks);	
		}
  },
};
</script>