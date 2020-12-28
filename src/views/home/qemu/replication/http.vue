<script>
import { deepCopy, confirm} from '@libs/utils/index';
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
      return this.$http.get(`json/cluster/replication/${id}`, {_dc: new Date().getTime()}).then((res) => {
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
          this.__init__();
        })
        .catch(() => {
          this.incEventFail(event);
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
              this.__init__();
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
    /**
     * 立即安排
    */
		handleImmidiateSchedule() {
		let event = this.createEvent("action.node.replication.create");
      return this.$http
        .post(`json/nodes/${this.node.node}/replication/${this.selectedList[0].id}/schedule_now`, null, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
          this.__init__();
        })
        .catch((res) => {
					this.incEventFail(event);
					return Promise.reject(res);
        });
    },
    /**
     * 复制日志
    */
   queryReplicationLog(id) {
     return this.$http.get(`json/nodes/${this.node.node}/replication/${id}/log`, {
        _dc  : new Date().getTime(),
        start: 0,
        limit: 500
     }).then(res => {
       if(res.data) {
         return Promise.resolve(res.data);
       }
     })
   },
   /**
    * 编辑更新复制
   */
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
	}
}
</script>
