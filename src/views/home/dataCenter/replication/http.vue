<script>
import { deepCopy, confirm } from "@libs/utils/index";
export default {
  name: "DataCenterReplicationHttp",
  methods: {
    queryReplicationList() {
      return this.$http.get("json/cluster/replication").then((res) => {
        if (res.data)
          this.updateTable({
            tableName: "dataCenterReplicationList",
            list: res.data,
          });
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
    queryHighIds() {
      return this.$http
        .get("json/cluster/replication", {
          _dc: new Date().getTime(),
        })
        .then((res) => {
          if (res.data) this.jobs = res.data;
        });
    },
    createReplication(params) {
      let event = this.createEvent("action.replication.create", params.guest);
      return this.$http
        .post("json/cluster/replication", params, {
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
          confirm.call(this, res, 'confirm', 'icon-warning');
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
        .catch((res) => {
          this.incEventFail(event);
           confirm.call(this, res, 'confirm', 'icon-warning');
        });
    },
    queryReplicationById(id) {
      return this.$http.get(`json/cluster/replication/${id}`).then((res) => {
        if (res.data)
          this.updateDbObject({
            name: "dataCenterReplicationObj",
            data: res.data,
          });
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
            .catch((res) => {
              this.incEventFail(event);
               confirm.call(this, res, 'confirm', 'icon-warning');
            });
        })(item.id);
        tasks.push(p);
      });
      return Promise.all(tasks);
		}
  },
};
</script>