<script>
import { quickSort } from '@libs/utils/index';
export default {
  name: "QemuHttpIndex",
  methods: {
    /**
     * 删除虚拟机，lxc
    */
    deleteQemu(param) {
      let event = this.createEvent("qemu.action.delete", this.qemu.name);
      return this.$http
        .del(`/json/nodes/${this.qemu.node}/${this.qemu.id}`, param)
        .then((res) => {
          if(res.data) {
            this.queryStatus(res.data);
            this.queryLog(this.qemu.node, res.data);
          }
          this.incEventSuccess(event);
          this.commitUpdateChangeTree(true);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    //查询状态
		queryStatus(upid) {
      let _this = this;
			return this.$http.get(`json/nodes/${_this.qemu.node}/tasks/${upid}/status`)
			           .then(res => {
									 if(res.data) {
                     _this.statusObj = res.data;
                     	_this.updateDbObject({
                        name: 'addClusterStatusObj',
                        data: res.data
                      })
										 if(res.data.status === 'stopped') {
                        /**
                         * 删除之后将不存在此资源当跳转至首页
                        */
                       if(res.data.exitstatus && res.data.exitstatus === 'OK' && res.data.type && res.data.type.indexOf('destroy') >=0){
                         if(_this.closeLog) {
                          _this.closeLog();
                           setTimeout(() => {
                              _this.$router.push('/datacenter/overview');
                              window.localStorage.removeItem('lastsel');
                           }, 500)
                         }
                       }else {
                         if(_this.interval) {
                         clearInterval(_this.interval);
                         _this.interval = null;
                         }
                       }
                     }
									 }
								 })
    },
    /**
     * 查询任务日志
    */
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
    /**
     * 关闭lxc 虚拟机
    */
    offQemu() {
      let event = this.createEvent(`action.qemu.off`, this.qemu.name);
      return this.$http
        .post(
          `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/shutdown`,
          {},
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          }
        )
        .then(() => {
          this.incEventSuccess(event);
          this.__init__();
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    /**
     * 查询资源
    */
    queryResource() {
      let last = window.localStorage.getItem("lastsel") || "[]";
      this.qemu = (JSON.parse(last) && JSON.parse(last)) || "";
      return this.$http
        .get(`/json/nodes/${this.qemu.node}/${this.qemu.id}/status/current`)
        .then((res) => {
          if(res.data) {
            this.updateDbObject({
              name: 'qemuObj',
              data: res.data
            })
          }
        });
    },
     /**
     * 停止lxc 虚拟机
    */
    pausedQemu(params) {
      let event = this.createEvent(
        `action.qemu.${params ? "suspend" : "paused"}`,
        this.qemu.name
      );
      return this.$http
        .post(
          `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/suspend`,
          params,
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          }
        )
        .then(() => {
          this.incEventSuccess(event);
          this.__init__();
        })
       .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
     /**
     * 停止lxc 虚拟机
    */
    stopQemu(param) {
      let event = this.createEvent(`action.qemu.stop`, this.qemu.name);
      return this.$http
        .post(
          `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/stop`,
          param,
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          }
        )
        .then((res) => {
          this.incEventSuccess(event);
          if(res.data) {
            this.interval = setInterval( () => this.queryStatus(res.data), 3000);
          }
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    /**
     * 重置lxc 虚拟机
    */
    resetQemu() {
      let event = this.createEvent(`action.qemu.reset`, this.qemu.name);
      return this.$http
        .post(
          `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/reset`,
          {},
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          }
        )
        .then(() => {
          this.incEventSuccess(event);
          this.__init__();
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    /**
     * 重启lxc
    */
    rebootLxc() {
       let event = this.createEvent(`action.lxc.reboot`, this.qemu.name);
      return this.$http
        .post(
          `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/reboot`,
          {},
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          }
        )
        .then(() => {
          this.incEventSuccess(event);
          this.__init__();
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    /**
     * 查询节点
    */
    queryNodeList() {
      return this.$http.get("/json/nodes").then((res) => {
        if (res.data) {
          this.nodeList = quickSort(res.data, 'node', '+');
        }
      });
    },
     /**
     * 查询存储
    */
    queryStorageList(nodename,param) {
      return this.$http
        .get(`/json/nodes/${nodename}/storage`,param)
        .then((res) => {
          if (res.data) {
            this.storageList = quickSort(res.data, 'storage', '+');
          }
        });
    },
    /**
     * 查询migrate
    */
   queryMigrate(param) {
     return this.$http.get(`json/nodes/${this.qemu.node}/${this.qemu.id}/migrate`, param)
                .then(res => {
                  if(res.data) {
                    this.migreateObj = res.data;
                  }
                })
   },
   /**
    * 迁移虚拟机、lxc
   */
    migreate(params) {
      return this.$http.post(`json/nodes/${this.qemu.node}/${this.qemu.type}/${this.qemu.vmid}/migrate`,  params, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=utf8'
        }
      }).then(res => {
        if(res.data) {
          this.queryStatus(res.data);
          this.queryLog(this.qemu.node, res.data)
        }
      }).catch(res => {
        return Promise.reject(res);
      })
    },
    /**
     * 查询快照列表
    */
    querySnapShot(param) {
      return this.$http.get(`json/nodes/${this.qemu.node}/${this.qemu.id}/snapshot`, param)
                 .then(res =>{
                   if(res.data) {
                     this.snapshotList = quickSort(res.data, 'name', '+');
                   }
                 })
    },
    /**
     * 查询下一个vmid
    */
    queryNextVmid(param) {
      return this.$http.get(`json/cluster/nextid`, param)
                 .then(res =>{
                   if(res.data) {
                     this.vmid = res.data;
                   }
                 })
    },
    /**
     * 查询资源池列表
    */
    queryPool(param) {
      return this.$http.get(`json/pools`, param)
                 .then(res =>{
                   if(res.data) {
                     this.poolList = res.data;
                   }
                 })
    },
   /**
    * clone
   */
    clone(params) {
      return this.$http.post(`json/nodes/${this.qemu.node}/${this.qemu.type}/${this.qemu.vmid}/clone`,  params, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=utf8'
        }
      }).then(res => {
        if(res.data) {
          this.queryStatus(res.data);
          this.queryLog(this.qemu.node, res.data);
        }
      }).catch(res => {
        return Promise.reject(res);
      })
    },
    /**
     * 制作模板
    */
   makeTemplate() {
      let event = this.createEvent('action.template.translate', this.qemu.vmid);
      return this.$http.post(`json/nodes/${this.qemu.node}/${this.qemu.type}/${this.qemu.vmid}/template`,  '', {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=utf8'
        }
      }).then(res => {
         this.incEventSuccess(event);
      }).catch(res => {
        this.incEventFail(event);
        return Promise.reject(res);
      })
   },
   /**
    * 获得ha groups
   */
    getGroups() {
      return this.$http.get(`json/cluster/ha/groups`)
                 .then(res =>{
                   if(res.data) {
                     this.groupList = quickSort(res.data, 'name', '+');
                   }
                 })
    },
    /**
     * 查询ha资源
    */
   queryHaResource(vmid, param) {
     return this.$http.get(`json/cluster/ha/resources/${vmid}`, param)
                .then(res => {
                  if(res.data)
                    this.haResource = res.data;
                })
   },
   /**
    * 管理ha
   */
    mangeHa(param) {
      let event = this.createEvent('action.ha.manage');
      return this.$http.post(`json/cluster/ha/resources`, param, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=utf8'
        }
      }).then(res => {
         this.incEventSuccess(event);
      }).catch(res => {
        this.incEventFail(event);
        return Promise.reject(res);
      })
    },
    /***
     * 修改ha
    */
   updateHa(vmid, param) {
      let event = this.createEvent('action.ha.manage.update');
      return this.$http.put(`json/cluster/ha/resources/${vmid}`, param, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=utf8'
        }
      }).then(res => {
         this.incEventSuccess(event);
      }).catch(res => {
        this.incEventFail(event);
        return Promise.reject(res);
      })
   },
    stopTask(node, pid) {
      return this.$http.del(`json/nodes/${node}/tasks/${pid}`);
		},
  },
};
</script>
