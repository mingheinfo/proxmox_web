<script>
export default {
	name: 'QemuReplicationHttp',
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
		 * @param guest 虚拟机id
		*/
		queryQemuReplication(param) {
			return this.$http.get(`json/nodes/${this.node.node}/replication`, param)
			           .then(res => {
									 if(res.data) {
										 this.updateTable({
											 tableName: 'qemuReplicationList',
											 list: res.data
										 })
									 }
								 })
		},
		/**
		 * 查询node节点列表
		*/
		queryNodeList() {
      return this.$http.get("json/nodes").then((res) => {
        if (res.data)
          this.updateTable({
            tableName: "nodeList",
            list: res.data,
          });
      });
		},
		queryHighIds() {
      return this.$http
        .get("json/cluster/replication", {
          _dc: new Date().getTime(),
        })
        .then((res) => {
          if (res.data) this.jobs = res.data;
        });
		},
		/**
		 * 查询node节点列表
		*/
		queryReplicationById(id) {
      return this.$http.get(`json/nodes/${this.node.node}/${id}`).then((res) => {
        if (res.data)
          this.updateDbObject({
            name: "dataCenterReplicationObj",
            data: res.data,
          });
      });
		},
		/**
		 * @param Object {target: this.target.join(","),
     *   schedule: this.schedule,
     *   rate: this.rate,
		 *		comment: this.comment,
		 *		disable: this.disable ? 0 : 1
		*}
		*/
		 createReplication(params) {
      let event = this.createEvent("action.node.replication.create", params.guest);
      return this.$http
        .post(`json/cluster/replication`, params, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
          this.queryReplicationList();
        })
        .catch((res) => {
					this.incEventFail(event);
					return Promise.reject(res);
        });
		},
		updateReplication(params) {
			let param = deepCopy(params);
			delete param.id;
			delete param.guest;
			delete param.target;
      let event = this.createEvent("action.replication.update", params.guest);
      return this.$http
        .put(`json/cluster/replication/${params.id}`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
          this.queryReplicationList();
        })
        .catch(() => {
          this.incEventFail(event);
        });
    },
		delete(type) {
			 let event = this.createEvent("action.replication.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((id) => {
          p = this.$http
            .del(`json/cluster/replication/${id}`, {[type]: 1})
            .then((res) => {
              this.queryReplicationList();
              this.incEventSuccess(event);
            })
            .catch((e) => {
              this.incEventFail(event);
            });
        })(item.id);
        tasks.push(p);
      });
      return Promise.all(tasks);
		},
		handleImmidiateSchedule() {
		let event = this.createEvent("action.node.replication.create", params.guest);
      return this.$http
        .post(`json/nodes/${this.node.node}/replication/${this.selectedList[0].id}/schedule_now"`, null, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
          this.queryReplicationList();
        })
        .catch((res) => {
					this.incEventFail(event);
					return Promise.reject(res);
        });
		}
	}
}
</script>