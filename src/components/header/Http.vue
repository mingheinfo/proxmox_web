<script>
import { quickSort } from '@src/libs/utils';
export default {
  name: "CreateQemuHttp",
  methods: {
    queryNodeList() {
      return this.$http.get("/json/nodes").then((res) => {
        if (res.data) {
          this.nodeList = quickSort(res.data, 'node', '-');
        }
      });
    },
    queryPoolList() {
      return this.$http.get("/json/pools").then((res) => {
        if (res.data) {
          this.poolList = quickSort(res.data, 'poolid', '-');
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
    queryStorageList(param) {
      return this.$http
        .get(`/json/nodes/${this.nodename}/storage`,param)
        .then((res) => {
          if (res.data) {
            this.storageList = quickSort(res.data, 'storage', '-');
            return Promise.resolve(quickSort(res.data, 'storage', '-'));
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
            this.imageStorageList = quickSort(res.data, 'storage', '-');
          }
        });
    },
    queryIsoList(param) {
      return this.$http
        .get(`/json/nodes/${this.nodename}/storage/${param.storage}/content`, {
          content: param.content,
        })
        .then((res) => {
          if (res.data) {
            this.isoList = quickSort(res.data, 'volid', '-');
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
            this.networkList = quickSort(res.data, 'iface', '-');
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
        }).catch(res => {
          return Promise.reject(res);
        });
    },
    createLxc(params) {
      let event = this.createEvent("action.lxc.create", params.name);
      return this.$http
        .post(`/json/nodes/${this.nodename}/lxc`, params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then((res) => {
          if (res.data) {
            this.incEventSuccess(event);
            this.queryStatus(this.nodename, res.data);
          }
        }).catch(res => {
          return Promise.reject(res);
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
    },
    /**
     * 修改密码 @param {password:}
    */
    updatePsw(param) {
     let event = this.createEvent(`action.password.update`);
     return this.$http.put(`json/access/password`, param, {
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded; charset=utf8;'
       }
     }).then(res => {
       this.incEventSuccess(event);
     }).catch(res => {
       this.incEventFail(event);
       return Promise.reject(res);
     })
    }
  },
};
</script>