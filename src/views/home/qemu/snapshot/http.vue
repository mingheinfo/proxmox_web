<script>
export default {
  name: "SnapShot",
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
     * @param {_dc: 时间戳}
     */
    querySnapShotList(param) {
      return this.$http
        .get(`json/nodes/${this.node.node}/${this.node.id}/snapshot`, param)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "snapshotList",
              list: res.data,
            });
          }
        });
    },
    /**
     * 删除快照
     */
    deleteSnapShot() {
      let event = this.createEvent(`action.qemu.snapshot.delete`);
      return this.$http
        .del(
          `json/nodes/${this.node.node}/${this.node.id}/snapshot/${this.current}`
        )
        .then((res) => {
          this.incEventSuccess(event);
          if (res.data) {
            this.done = false;
            this.showDeleteLog = true;
            //查询删除进度
            this.queryStatus(res.data);
            this.interVal = setInterval(() => this.queryStatus(res.data), 1000);
          }
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    /**
     * 查询删除状态
     */
    queryStatus(pid) {
      return this.$http
        .get(`json/nodes/${this.node.node}/tasks/${pid}/status`)
        .then((res) => {
          if (res.data.status !== "running") {
            this.done = true;
            //this.showDeleteLog = false;
            if(this.__init__) {
              this.__init__();
            }
            if (this.interVal) {
              clearInterval(this.interVal);
              this.interVal = null;
            }
          }
        });
    },
    /**
     * 添加快照
     */
    addSnapShot(param) {
      let event = this.createEvent(`action.qemu.snapshot.add`);
      return this.$http
        .post(`json/nodes/${this.node.node}/${this.node.id}/snapshot`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8;",
          },
        })
        .then((res) => {
          if (res.data) {
            this.incEventSuccess(event);
            if (res.data) {
              this.done = false;
              this.showDeleteLog = true;
              //查询删除进度
              this.queryStatus(res.data);
              this.interVal = setInterval(
                () => this.queryStatus(res.data),
                1000
              );
            }
          }
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    //查询虚拟机配置
    queryVmConfig(param, snapshot) {
      let _this = this;
      return _this.$http
        .get(
          `json/nodes/${_this.node.node}/${_this.node.id}/snapshot/${snapshot}/config`,
          param
        )
        .then((res) => {
          if (res.data) {
            return _this.updateDbObject({
              name: "qemuObj",
              data: res.data,
            });
          }
        });
    },
    /**
     * 添加快照
     */
    updateSnapShot(snapshotname, param) {
      let event = this.createEvent(`action.qemu.snapshot.update`);
      delete param.snapname;
      return this.$http
        .put(
          `json/nodes/${this.node.node}/${this.node.id}/snapshot/${snapshotname}/config`,
          param,
          {
            headers: {
              "content-type":
                "application/x-www-form-urlencoded; charset=utf8;",
            },
          }
        )
        .then((res) => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
		},
		/**
		 * 回滚
		*/
		rollback(name) {
			 let event = this.createEvent(`action.qemu.snapshot.rollback`);
			return this.$http.post(`json/nodes/${this.node.node}/${this.node.id}/snapshot/${name}/rollback`, null, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=utf8;'
				}
			}).then(res => {
				this.incEventSuccess(event);
			 if (res.data) {
            this.done = false;
            this.showDeleteLog = true;
            //查询删除进度
            this.queryStatus(res.data);
            this.interVal = setInterval(() => this.queryStatus(res.data), 1000);
          }
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
		}
  },
};
</script>
