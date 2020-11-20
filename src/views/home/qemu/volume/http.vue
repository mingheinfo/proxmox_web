<script>
export default {
  name: "VolumeHttp",
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
    queryResource() {
      return this.$http
        .get(`/json/nodes/${this.node.node}/${this.node.id}/pending`)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "volumeList",
              list: res.data,
            });
          }
        });
    },
    resume(param) {
      let event = this.createEvent("action.qemu.hardware.resume");
      return this.$http
        .put(`json/nodes/${this.node.node}/${this.node.id}/config`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then((res) => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
        });
    },
    queryConfig(param) {
      return this.$http
        .get(`json/nodes/${this.node.node}/${this.node.id}/config`, param)
        .then((res) => {
          if (res.data) {
            this.updateDbObject({
              name: "qemuConfigObj",
              data: res.data,
            });
          }
        });
    },
    queryStorage(param) {
      return this.$http
        .get(`/json/nodes/${this.node.node}/storage`, param)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "storageList",
              list: res.data,
            });
          }
        });
		},
		queryImage(param) {
			return this.$http
        .get(`/json/nodes/${this.node.node}/storage/${this.storage}/content`, param)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "imageList",
              list: res.data,
            });
          }
        });
		},
		queryNetWork(param) {		
			return this.$http
        .get(`/json/nodes/${this.node.node}/network`, param)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "netWorkList",
              list: res.data,
            });
          }
        });
		},
		queryUsb(param) {
			 return this.$http.get(`json/nodes/${this.node.node}/scan/usb`, param)
			            .then(res => {
										if(res.data) {
											 this.updateTable({
												tableName: "usbList",
												list: res.data,
											});
										}
									})
		},
		queryPci(param) {
			return this.$http.get(`json/nodes/${this.node.node}/hardware/pci`, param)
			            .then(res => {
										if(res.data) {
											 this.updateTable({
												tableName: "pciList",
												list: res.data,
											});
										}
									})
		},
		queryMDev(pciid) {
			return this.$http.get(`json/nodes/${this.node.node}/hardware/pci/${pciid}/mdev`)
			            .then(res => {
										if(res.data) {
											 this.updateTable({
												tableName: "pciMDevList",
												list: res.data,
											});
										}
									})
		},
    createHardWare(param) {
      let event = this.createEvent("action.qemu.hardware.create");
      return this.$http
        .post(`json/nodes/${this.node.node}/${this.node.id}/config`, param, {
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
		updateHardWare(param) {
			 let event = this.createEvent("action.qemu.hardware.update");
      return this.$http
        .put(`json/nodes/${this.node.node}/${this.node.id}/config`, param, {
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
		//删除配置
		deleteHareWare(param) {
			let event = this.createEvent(`action.qemu.hardware.delete`);
			return this.$http.put(`extjs/nodes/${this.node.node}/${this.node.id}/config`, param, {
				headers: {
					 'content-type': 'application/x-www-form-urlencoded; charset=utf8'
				}
			})
			           .then(res => {
									 this.incEventSuccess(event);
									 if(res.data) {
										  this.jobVisible = true;
											this.queryStatus(res.data);
											this.interVal = setInterval(() => this.queryStatus(res.data), 3000);
									 }
									 if(res.status == "400") {
										 return Promise.reject(res.errors);
									 }
								 }).catch(res => {
									 this.incEventFail(event);
									 return Promise.reject(res);
								 })
		},
		//查询状态
		queryStatus(upid) {
			return this.$http.get(`json/nodes/${this.node.node}/tasks/${upid}/status`)
			           .then(res => {
									 if(res.data) {
										 this.statusObj = res.data;
										 if(res.data.status === 'stopped') {
											 this.jobText = "Done!";
											 this.jobVisible = false;
										 }
									 }
								 })
		}
  },
};
</script>