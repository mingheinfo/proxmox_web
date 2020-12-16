<script>
import { deepCopy, confirm } from "@libs/utils/index";
export default {
  name: "DataCenterBackUpHttp",
  methods: {
    queryBackUpList() {
      return this.$http.get("/json/cluster/backup").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "backUpList",
            list: res.data,
          });
        }
      });
    },
    delete(param) {
      let event = this.createEvent("action.backup.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((id) => {
          p = this.$http
            .del(`/json/cluster/backup/${id}`)
            .then((res) => {
              this.queryBackUpList();
              this.incEventSuccess(event);
            })
            .catch((e) => {
              this.incEventFail(event);
              confirm.call(this, e, 'confirm', 'icon-warning');
            });
        })(item.id);
        tasks.push(p);
      });
      return Promise.all(tasks);
    },
    queryStorageList(nodename) {
      if (!nodename) {
        return;
      }
      let params = {
        format: 1,
        content: "backup",
      };
      return this.$http
        .get("/json/nodes/" + nodename + "/storage", params)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "storageList",
              list: res.data,
            });
          }
        });
    },
    async queryNodeList() {
      return this.$http.get("json/nodes").then(async (res) => {
        if (res.data) {
          await this.updateTable({
            tableName: "nodeList",
            list: res.data,
          });
        }
      });
    },
    queryResource() {
      return this.$http.get("json/cluster/resources?type=vm").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "vmList",
            list: res.data,
          });
        }
      });
    },
    queryPoolList() {
      return this.$http.get("json/pools").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "poolList",
            list: res.data,
          });
        }
      });
    },
    createBackUp(params) {
      let event = this.createEvent("action.backup.create");
      return this.$http
        .post("json/cluster/backup", params, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
          this.queryBackUpList();
        })
        .catch((res) => {
          this.incEventFail(event);
           confirm.call(this, res, 'confirm', 'icon-warning');
        });
    },
    updateBackUp(param) {
      let event = this.createEvent("action.backup.create");
      let params = deepCopy(param);
      delete params.id;
      return this.$http
        .put(`json/cluster/backup/${param.id}`, params, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
          this.queryBackUpList();
        })
        .catch((res) => {
          this.incEventFail(event);
           confirm.call(this, res, 'confirm', 'icon-warning');
        });
    },
    run() {
     let event = this.createEvent("action.backup.run");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((item) => {
          let params = deepCopy(item);
          delete params.node;
          delete params.id;
          delete params.dow;
          delete params.starttime;
          delete params.enabled;
          p = this.$http
            .post(`/json/nodes/${item.node}/vzdump`, params , {
               headers: {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
              },
            })
            .then((res) => {
              this.queryBackUpList();
              this.incEventSuccess(event);
            })
            .catch((res) => {
              this.incEventFail(event);
               confirm.call(this, res, 'confirm', 'icon-warning');
            });
        })(item);
        tasks.push(p);
      });
      return Promise.all(tasks);
    },
  },
};
</script>