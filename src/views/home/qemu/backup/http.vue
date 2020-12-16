<script>
export default {
	name: 'QemuBackUpHttp',
	data() {
    return {
      node: {},
    };
  },
  mounted() {
    let _this = this,
      last = window.localStorage.getItem("lastsel") || "[]";
    _this.node = (JSON.parse(last) && JSON.parse(last)) || "";
  },
	methods: {
		/**
		 * 查询备份列表
		 * @param param object {content: ''}
		*/
		queryQemuBackUpList(param) {
			return this.$http.get(`json/nodes/${this.node.node}/storage/${this.storage}/content`, param)
			           .then(res => {
									 if(res.data) {
										 this.updateTable({
											 tableName: 'qemuBackUpList',
											 list: res.data
										 })
									 }
								 })
		},
		/**
		 * 查询存储列表
		 * param object {format:1,content:backup}
		*/
		queryQemuStorageList(param) {
			return this.$http.get(`json/nodes/${this.node.node}/storage`, param)
			           .then(res => {
									 if(res.data) {
										 this.updateTable({
											 tableName: 'storageList',
											 list: res.data
										 })
									 }
								 })
		},
		queryLog(node, pid) {
      return this.$http
        .get(`json/nodes/${node}/tasks/${pid}/log`, {
          _dc: new Date().getTime(),
          start: 0,
          limit: 500,
        })
        .then((res) => {
          this.updateTable({
            tableName: "addClusterLogList",
            list: res.data,
          });
        });
    },
    queryStatus(node, pid) {
      return this.$http
        .get(`json/nodes/${node}/tasks/${pid}/status`, {
          _dc: new Date().getTime(),
        })
        .then((res) => {
				  if(!res.data) return;
          if (res.data.status !== "running" && this.interVal) {
            clearInterval(this.interVal);
            this.interVal = null;
          }
          this.updateDbObject({
            name: "addClusterStatusObj",
            data: res.data,
          });
        });
    },
    stopTask(node, pid) {
      return this.$http.del(`json/nodes/${node}/tasks/${pid}`).then(() => {
        this.querySubscriptionInfo();
      });
		},
		createBackUp(param) {
			let event = this.createEvent('action.qemu.backup.create');
			return this.$http.post(`json/nodes/${this.node.node}/vzdump`, param, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=utf8'
				}
			})
			.then(res => {
				if(res.data) {
					this.incEventSuccess(event);
					this.queryLog(this.node.node, res.data);
					this.queryStatus(this.node.node, res.data);
				}
			}).catch(res => {
				this.incEventFail(event);
				return Promise.reject(res);
			})
		},
		restore(url, param) {
			let event = this.createEvent('action.qemu.backup.restore');
			return this.$http.post(url, param, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=utf8'
				}
			})
			.then(res => {
				if(res.data) {
					this.incEventSuccess(event);
					this.queryLog(this.node.node, res.data);
					this.queryStatus(this.node.node, res.data);
				}
			}).catch(res => {
				this.incEventFail(event);
				return Promise.reject(res);
			})
		},
		delete() {
			let event = this.createEvent(`action.qemu.backup.delete`), tasks = [], p =null;
			this.selectedList.forEach(item => {
				((id) => {
           p = this.$http.del(`json/nodes/${this.node.node}/storage/${this.storage}/content/${id}`, {
						 delay: 5
					 }).then(res => {
						 this.incEventSuccess(event);
					 }).catch((res) => {
							this.incEventFail(event);
							return Promise.reject(res);
					 })
					 tasks.push(p);
				})(item.volid)
			})
			return Promise.all(tasks);
		},
		queryConfig(param) {
			return this.$http.get(`json/nodes/${this.node.node}/vzdump/extractconfig`, param)
			           .then(res => {
									 if(res.data) {
										 this.configContent = res.data;
									 }
								 })
		}
	}
}
</script>