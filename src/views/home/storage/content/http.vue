<script>
import { uploadFile, parse_task_upid } from "@libs/utils/index";
export default {
  name: "StorageContentHttp",
  data() {
    return {
      node: "",
      storage: "",
    };
  },
  mounted() {
    let last = window.localStorage.getItem("lastsel") || "[]";
    this.node = (JSON.parse(last).node && JSON.parse(last).node) || "";
    this.storage = (JSON.parse(last).storage && JSON.parse(last).storage) || "";
  },
  methods: {
    queryStorageContent() {
      this.loading = true;
      return this.$http
        .get(`json/nodes/${this.node}/storage/${this.storage}/content`)
        .then((res) => {
          this.loading = false;
          if (res.data) {
            this.updateTable({
              tableName: "storageContentList",
              list: res.data,
            });
          }
        })
        .catch((res) => {
          this.updateTable({
            tableName: "storageContentList",
            list: [],
          });
          if(typeof (this.loading) !== 'undefined' && typeof (this.loadingText) !== 'undefined') {
             this.loading = true;
             this.loadingText = res;
          }
        });
    },
    queryStroageStatus() {
      return this.$http
        .get(`json/nodes/${this.node}/storage/${this.storage}/status`)
        .then((res) => {
          if (res.data) {
            this.updateDbObject({
              name: "storageStatusObj",
              data: res.data,
            });
          }
        })
        .catch((res) => {
          this.updateDbObject({
            name: "storageStatusObj",
            data: [],
          });
        });
    },
    uploadImage(data, callback) {
      return uploadFile(
        `/api2/json/nodes/${this.node}/storage/${this.storage}/upload`,
        data,
        callback
      );
    },
    getTemplate() {
      return this.$http.get(`json/nodes/${this.node}/aplinfo`).then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "storageTemplateList",
            list: res.data,
          });
        }
      });
    },
    downLoadTemplate(param) {
      return this.$http
        .post(`json/nodes/${this.node}/aplinfo`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then(async (res) => {
          if (res.data) {
            let task = parse_task_upid(res.data);
            await this.queryLog(task.node, res.data);
            await this.queryStatus(task.node, res.data);
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
    //删除内容
    delete() {
      if (this.selectedList.length > 0) {
        let tasks = [],
          p = null;
        this.selectedList.forEach((item) => {
          let event = this.createEvent(
            `action.storage.content.delete`,
            item.volid
          );
          p = this.$http
            .del(
              `json/nodes/${this.node}/storage/${this.storage}/content/${item.volid}`,
              { delay: 5 }
            )
            .then(() => {
              this.incEventSuccess(event);
              this.__init__();
            })
            .catch((res) => {
              this.incEventFail(event);
              return Promise.reject(res);
            });
          tasks.push(p);
        });
        return Promise.all(tasks);
      }
    },
    //查询config
    queryConfigByVolid(param) {
      return this.$http
        .get(`json/nodes/${this.node}/vzdump/extractconfig`, param)
        .then((res) => {
          if (res.data) {
            this.configStr = res.data;
          }
        });
    },
    //查询下一个vmid
    queryNextVmId(param) {
      return this.$http.get(`json/cluster/nextid`, param).then((res) => {
        if (res.data) {
          this.nextid = res.data;
        }
      });
    },
    //查询存储
    queryStorage(param) {
      return this.$http
        .get(`json/nodes/${this.node}/storage`, param)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "storageList",
              list: res.data,
            });
          }
        });
    },
    //恢复
    doRestore(url, params) {
      let event = this.createEvent(`action.storage.content.restore`);
      return this.$http
        .post(
          url,
          params,
          {
            headers: {
              "content-type":
                "application/x-www-form-urlencoded; charset=utf8",
            },
          }
        )
        .then(async (res) => {
           this.incEventSuccess(event);
          if(res.data) {
             let upid = res.data;
             await this.queryLog(this.node, upid);
             await this.queryStatus(this.node, upid);
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
