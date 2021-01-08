<script>
import { deepCopy, confirm } from '@libs/utils/index';
export default {
  name: "DataStorageHttp",
  methods: {
    queryStorageList() {
      return this.$http.get("json/storage").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "storageList",
            list: res.data,
          });
        }
      });
    },
    queryNode() {
      return this.$http.get("json/nodes").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "nodeList",
            list: res.data,
          });
        }
      });
    },
    createStorage(param) {
      let _this = this, event = this.createEvent("action.storage.create", param.storage);
      return _this.$http
        .post("json/storage", param, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then((res) => {
          _this.incEventSuccess(event);
          _this.queryStorageList();
        })
        .catch((res) => {
          _this.incEventFail(event);
          confirm.call(_this, res, 'confirm', 'icon-warning');
        });
		},
		updateStorage(param) {
			let event = this.createEvent("action.storage.update", param.storage);
			let params = deepCopy(param);;
			if(params.hasOwnProperty('storage')) delete params.storage;
			if(params.hasOwnProperty('path')) delete params.path;
			if(params.hasOwnProperty('type')) delete params.type;
			if(params.hasOwnProperty('vgname')) delete params.vgname;
			if(params.hasOwnProperty('thinpool')) delete params.thinpool;
			if(params.hasOwnProperty('export')) delete params.export;
			if(params.hasOwnProperty('server')) delete params.server;
      return this.$http
        .put(`json/storage/${param.storage}`,  params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then((res) => {
          this.incEventSuccess(event);
          this.queryStorageList();
        })
        .catch((res) => {
          this.incEventFail(event);
          confirm.call(this, res, 'confirm', 'icon-warning');
        });
		},
    queryVg(nodename) {
      if (!nodename) nodename = "localhost";
      return this.$http
        .get("/json/nodes/" + nodename + "/scan/lvm")
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "vgList",
              list: res.data,
            });
          }
        });
    },
    queryIs() {
      return this.$http.get("json/storage", { type: "iscsi" }).then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "iscsiList",
            list: res.data,
          });
        }
      });
    },
    queryPoolThin(vgname) {
      return this.$http
        .get("json/nodes/localhost/scan/lvmthin", { vg: vgname })
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "poolThinList",
              list: res.data,
            });
          }
        });
    },
    queryNfs(nodename, server) {
      if (!nodename) nodename = "localhost";
      return this.$http
        .get("/json/nodes/" + nodename + "/scan/nfs", { server: server })
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "nfsList",
              list: res.data,
            });
          }
        });
    },
    queryCifs(nodename, server) {
      if (!nodename) nodename = "localhost";
      return this.$http
        .get("/json/nodes/" + nodename + "/scan/cifs", { server: server })
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "cifsList",
              list: res.data,
            });
          }
        });
    },
    queryGlusterfs(nodename, server) {
      if (!nodename) nodename = "localhost";
      return this.$http
        .get("/json/nodes/" + nodename + "/scan/glusterfs", { server: server })
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "glusterfsList",
              list: res.data,
            });
          }
        });
    },
    queryIscsi(nodename, server) {
      if (!nodename) nodename = "localhost";
      return this.$http
        .get("/json/nodes/" + nodename + "/scan/iscsi", { 'portal': server })
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "iscsiList",
              list: res.data,
            });
          }
        });
    },
    queryCephMon() {
      return this.$http
        .get("json/nodes/localhost/ceph/mon", { _dc: new Date().getTime() })
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "cephMonList",
              list: res.data,
            });
          }
        }).catch(res => {
          return Promise.reject(res);
        });
    },
    queryCephPools() {
      return this.$http
                 .get(`json/nodes/localhost/ceph/pools`)
                 .then((res) => {
                  if (res.data) {
                    this.updateTable({
                      tableName: "cephPoolsList",
                      list: res.data,
                    });
                  }
                }).catch(res => {
                  return Promise.reject(res);
                });
    },
    queryCephPoolsObj (param) {
      return this.$http.get(`json/storage/ceph-pools`,  param)
        .then(res => {
          if(res.data) {
            this.updateDbObject({
              name: "cephPoolsObj",
              data: res.data,
            });
          }
        })
    },
    queryZfs(nodename, server) {
      if (!nodename) nodename = "localhost";
      return this.$http
        .get("/json/nodes/" + nodename + "/scan/zfs", { server: server })
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "zfsList",
              list: res.data,
            });
          }
        });
    },
    delete(storage) {
			let event = this.createEvent('action.storage.delete', storage);
      return this.$http.del(`/json/storage/${storage}`).then((res) => {
        this.incEventSuccess(event);
        this.__init__();
      }).catch((res) => {
        this.incEventFail(event);
        confirm.call(this, res, 'confirm', 'icon-warning');
			});
    },
  },
};
</script>
