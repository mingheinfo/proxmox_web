<script>
export default {
	name: 'NetWorkHttp',
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
		queryConfig(param) {
      return this.$http
        .get(`json/nodes/${this.node.node}/${this.node.id}/config`, param)
        .then((res) => {
          if (res.data) {
            this.updateDbObject({
              name: "qemuConfigObj",
              data: res.data,
            });
          }
        });
		},
		queryNetWorkList(param) {
			return this.$http.get(`json/nodes/${this.node.node}/network`, param)
			           .then(res => {
									 if(res.data) {
										 this.updateTable({
											 tableName: 'netWorkList',
											 list: res.data
										 })
									 }
								 })
		},
		createNetWork(param) {
			let event = this.createEvent(`action.lxc.network.create`);
			return this.$http.put(`json/nodes/${this.node.node}/${this.node.id}/config`, param,  {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          })
			           .then((res) => {
										this.incEventSuccess(event);
								})
								.catch(res => {
									this.incEventFail(event);
									return Promise.reject(res);
								});
		},
		delete() {
			let tasks = [], p = null, event = this.createEvent(`action.lxc.network.delete`);
			this.selectedList.forEach(item => {
				((id) => {
					p = this.$http.put(`json/nodes/${this.node.node}/${this.node.id}/config`, {
						delete: id
					},  {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          })
			           .then((res) => {
										this.incEventSuccess(event);
								})
								.catch(res => {
									this.incEventFail(event);
									return Promise.reject(res);
								});
				})(item.id)
				tasks.push(p);
			})
			return Promise.all(tasks);
		}
	}
}
</script>