<script>
import { deepCopy, confirm} from '@libs/utils/index';
export default {
	name: 'NodeReplicationHttp',
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
		queryNodeReplication() {
      this.loading = true;
			return this.$http.get(`json/nodes/${this.node}/replication`)
			           .then(res => {
			             this.loading = false;
									  if(res.data) {
											this.updateTable({
												tableName: 'nodeReplicationList',
												list: res.data
											})
										}
								 }).catch(res => {
               this.loadingText = res;
            })
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
		 queryNodeList() {
      return this.$http.get("json/nodes").then((res) => {
        if (res.data)
          this.updateTable({
            tableName: "nodeList",
            list: res.data,
          });
      });
    },
		queryReplicationById(id) {
      return this.$http.get(`json/cluster/replication/${id}`, {
        _dc: new Date().getTime()
      }).then((res) => {
        if (res.data)
          this.updateDbObject({
            name: "dataCenterReplicationObj",
            data: res.data,
          });
      });
		},
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
        })
        .catch((res) => {
					this.incEventFail(event);
					return Promise.reject(res);
        });
    },
    handleImmidiateSchedule() {
	  	let event = this.createEvent("action.node.replication.create");
      return this.$http
        .post(`json/nodes/${this.node}/replication/${this.selectedList[0].id}/schedule_now`, null, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
					this.incEventFail(event);
					return Promise.reject(res);
        });
		},
    queryLog(id) {
      return this.$http.get(`json/nodes/${this.node}/replication/${id}/log`, {
        _dc  : new Date().getTime(),
        start: 0,
        limit: 500
      })
                 .then(res => {
                   if(res.data) {
                     return Promise.resolve(res.data);
                   }
                 })
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
        })
        .catch((res) => {
          this.incEventFail(event);
           confirm.call(this, res, 'confirm', 'icon-warning');
        });
    },
     /**
     * 删除复制
    */
		delete() {
			 let event = this.createEvent("action.replication.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((id) => {
          p = this.$http
            .del(`json/cluster/replication/${id}`)
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
	}
}
</script>
