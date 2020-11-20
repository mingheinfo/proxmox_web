<script>
import { parse_task_upid } from "@libs/utils/index";
export default {
  name: "CertificatesHttp",
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
    queryAcmeAccount() {
      return this.$http.get(`json/cluster/acme/account`).then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "acmeAccountList",
            list: res.data,
          });
        }
      });
    },
    queryCertificatesInfoList() {
      return this.$http
        .get(`json/nodes/${this.node}/certificates/info`)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "certificatesInfoList",
              list: res.data,
            });
          }
        });
    },
    queryCertificatesConfig() {
      return this.$http.get(`json/nodes/${this.node}/config`).then((res) => {
        if (res.data) {
          this.updateDbObject({
            name: "certificatesConfigObj",
            data: res.data,
          });
        }
      });
    },
    createCertificates(param) {
      let event = this.createEvent("action.certificates.create");
      return this.$http
        .post(`json/nodes/${this.node}/certificates/custom`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then((res) => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    deleteCertificates() {
      let event = this.createEvent(`action.certificates.delete`);
      return this.$http
        .del(`json/nodes/${this.node}/certificates/custom?restart=1`)
        .then((res) => {
          this.incEventSuccess(event);
          this.queryCertificatesInfoList();
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    queryAcmeDirection() {
      return this.$http.get(`json/cluster/acme/directories`).then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "directoriesList",
            list: res.data,
          });
        }
      });
    },
    queryAcmeTos(param) {
      return this.$http
        .get(`json/cluster/acme/tos`, {
          _dc: new Date().getTime(),
          directory: param,
        })
        .then((res) => {
          if (res.data) {
            this.tos_url = res.data;
          }
        })
        .catch((res) => {
          this.$confirm.info({
            msg: res,
          });
        });
    },
    updateAcme(param) {
      let event = this.createEvent(`action.certificates.acme.update`);
      return this.$http
        .put(`json/nodes/${this.node}/config`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then((res) => {
          this.incEventSuccess(event);
          this.queryCertificatesConfig();
        })
        .catch((res) => {
          this.$confirm.error({
            msg: res,
          });
        });
    },
    createAcmeAccount(param) {
      let event = this.createEvent("action.acme.account.create");
      return this.$http
        .post(`json/cluster/acme/account`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charst=utf8",
          },
        })
        .then(async (res) => {
          if (res.data) {
            let task = parse_task_upid(res.data);
            await this.queryLog(task.node, res.data);
            await this.queryStatus(task.node, res.data);
          }
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    createAcmeDomains(param) {
      let event = this.createEvent("action.acme.domains.create");
      return this.$http
        .put(`json/nodes/${this.node}/config`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charst=utf8",
          },
        })
        .then(async (res) => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
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
          if (res.data.status === "stopped" && this.interVal) {
            clearInterval(this.interVal);
            this.interVal = null;
          }
          return this.updateDbObject({
            name: "addClusterStatusObj",
            data: res.data,
          });
        });
    },
    stopTask(node, pid) {
      return this.$http.del(`json/nodes/${node}/tasks/${pid}`);
    },
    queryAcmePluginsList() {
      return this.$http.get("json/cluster/acme/plugins").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "acmePluginList",
            list: res.data,
          });
        }
      });
    },
    orderCertifices() {
      let event = this.createEvent(`action.acme.certifices.order`);
      return this.$http
        .post(
          `json/nodes/${this.node}/certificates/acme/certificate`,
          {
            force: 1,
          },
          {
            headers: {
              "content-type": "application/x-www-form-urlencoded; charset=utf8",
            },
          }
        )
        .then(async (res) => {
          this.incEventSuccess(event);
          if (res.data) {
            let task = parse_task_upid(res.data);
            await this.queryLog(task.node, res.data);
            await this.queryStatus(task.node, res.data);
          }
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
  },
};
</script>