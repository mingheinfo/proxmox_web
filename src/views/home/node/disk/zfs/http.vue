<script>
export default {
  name: "NodeDiskLvmThinHttp",
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
    queryDiskZfs(param) {
      this.loading = true;
      return this.$http
        .get(`json/nodes/${this.node}/disks/zfs`, param)
        .then((res) => {
          this.loading = false;
          if (res.data) {
            this.updateTable({
              tableName: "nodeDiskZfsList",
              list: res.data,
            });
          }
        }).catch(res => {
          this.loading = false;
        });
    },
    queryListNodeDiskList(param) {
      return this.$http
        .get(`json/nodes/${this.node}/disks/list`, param)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "nodeDiskList",
              list: res.data,
            });
          }
        });
    },
    querySda(param) {
      return this.$http
        .get(`json/nodes/${this.node}/disks/zfs/${param.name}`,{_dc:  param._dc})
        .then((res) => {
          if (res.data) {
            this.updateDbObject({
              name: "nodeDiskSdaObj",
              data: res.data,
            });
          }
        });
    },
    createZfs(param) {
      let event = this.createEvent(`action.node.disk.directory.create`);
      return this.$http
        .post(`json/nodes/${this.node}/disks/zfs`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then((res) => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          return Promise.reject(res);
        });
    },
  },
};
</script>
