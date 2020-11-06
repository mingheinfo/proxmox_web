<script>
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
  },
};
</script>