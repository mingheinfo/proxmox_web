<script>
export default {
  name: "CreateQemuHttp",
  methods: {
    queryNodeList() {
      return this.$http.get("/json/nodes").then((res) => {
        if (res.data) {
          this.nodeList = res.data;
        }
      });
    },
    queryPoolList() {
      return this.$http.get("/json/pools").then((res) => {
        if (res.data) {
          this.poolList = res.data;
        }
      });
    },
    queryNextVmId() {
      return this.$http
        .get("/json/cluster/nextid", {
          _dc: Date.now(),
        })
        .then((res) => {
          if (res.data) {
            this.vmid = res.data;
            this.nextid = res.data;
          }
        });
    },
    queryStorageList() {
      return this.$http
        .get(`/json/nodes/${this.nodename}/storage`, {
          format: 1,
          content: "iso",
        })
        .then((res) => {
          if (res.data) {
            this.storageList = res.data;
          }
        });
    },
    queryImageStorageList() {
      return this.$http
        .get(`/json/nodes/${this.nodename}/storage`, {
          format: 1,
          content: "images",
        })
        .then((res) => {
          if (res.data) {
            this.imageStorageList = res.data;
          }
        });
    },
    queryIsoList() {
      return this.$http
        .get(`/json/nodes/${this.nodename}/storage/local/content`, {
          content: "iso",
        })
        .then((res) => {
          if (res.data) {
            this.isoList = res.data;
          }
        });
    },
    queryNetWorkList() {
      return this.$http
        .get(`/json/nodes/${this.nodename}/network`, {
          type: "any_bridge",
        })
        .then((res) => {
          if (res.data) {
            this.networkList = res.data;
          }
        });
    },
    createQemu(params) {
      let event = this.createEvent("action.qumu.create", params.name);
      return this.$http
        .post(`/json/nodes/${this.nodename}/qemu`, params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then((res) => {
          if (res.data) {
            this.incEventSuccess(event);
          }
        });
    },
    //查询任务
    queryClusterTask() {
      return this.$http.get(`json/cluster/tasks`).then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "clusterTaskList",
            list: res.data,
          });
        }
      });
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
          if (!res.data) return;
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
		queryClusterLog() {
			return this.$http.get(`json/cluster/log`)
			           .then(res => {
									 if(res.data) {
										 this.updateTable({
											 tableName: 'clusterLogList',
											 list: res.data
										 })
									 }
								 })
		}
  },
};
</script>