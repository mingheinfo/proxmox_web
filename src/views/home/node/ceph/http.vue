<script>
  import { confirm } from '@libs/utils/index';
  export default {
    name: "CpehHttp",
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
      queryConfig(path, param) {
        return this.$http.get(`json/nodes/${this.node}/ceph/${path}`, param)
          .then(res => {
              if(res.data) {
                 return Promise.resolve(res.data)
              }
          })
      },
      queryMonitor(path, param) {
        return this.$http.get(`json/nodes/${this.node}/ceph/${path}`, param)
          .then(res => {
            if(res.data) {
              return Promise.resolve(res.data)
            }
          })
      },
      queryNodes() {
        return this.$http.get(`json/nodes`)
          .then(res => {
            if(res.data) {
              this.updateTable({
                tableName: "nodeList",
                list: res.data,
              });
            }
          })
      },
      createMonitor(type, nodename) {
        let event = this.createEvent('action.create.monitor');
        return this.$http.post(`json/nodes/${this.nodename}/ceph/${type}/${nodename}`, null, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=utf8'
          }
        })
          .then(res => {
            this.incEventSuccess(event);
            this.queryStatus(nodename, res.data);
          })
          .catch(res => {
            this.incEventFail(event);
            confirm.call(this, res,  'error', 'icon-error');
          })
      },
      queryLog(node, pid) {
        return this.$http.get(`json/nodes/${node}/tasks/${pid}/log`, {
          _dc: new Date().getTime(),
          start: 0,
          limit: 500
        }).then((res) => {
          this.updateTable({
            tableName: 'addClusterLogList',
            list: res.data
          })
        })
      },
      queryStatus(node, pid) {
        return this.$http.get(`json/nodes/${node}/tasks/${pid}/status`).then((res) => {
          this.updateDbObject({
            name: 'addClusterStatusObj',
            data: res.data
          })
          if(res.data.status === 'stopped' && this.interVal) {
            clearInterval(this.interVal);
            this.$confirm.confirm({
								msg: this.db.addClusterStatusObj.exitstatus,
								type: 'error',
								icon: 'icon-error'
							})
            this.interVal = null;
          }
        })
      },
      stopTask(node, pid) {
        return this.$http.del(`json/nodes/${node}/tasks/${pid}`)
          .then(() => {
            this.queryClusterList();
          })
      },
      operateCeph(nodename, operate, param) {
        let event = this.createEvent('action.create.monitor');
        return this.$http.post(`json/nodes/${nodename}/ceph/${operate}`, param, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=utf8'
          }
        })
          .then(res => {
            this.incEventSuccess(event);
            this.queryStatus(nodename, res.data);
          })
          .catch(res => {
            this.incEventFail(event);
            confirm.call(this, res,  'error', 'icon-error');
          })
      },
      queryServiceLog(nodename, param) {
        return this.$http.get(`json/nodes/${nodename}/syslog`, param)
          .then(res => {
            if(res.data)
            return Promise.resolve(res.data);
          })
      },
      queryDisk(param) {
        return this.$http.get(`json/nodes/${this.node}/disks/list`, param)
          .then(res => {
            if(res.data) {
              return Promise.resolve(res.data);
            }
          })
      },
      createOsd(param) {
        let event = this.createEvent('action.create.osd');
        return this.$http.post(`json/nodes/${this.node}/ceph/osd`, param, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=utf8'
          }
        })
          .then(res => {
            this.incEventSuccess(event);
          })
          .catch(res => {
            this.incEventFail(event);
            confirm.call(this, res,  'error', 'icon-error');
            return Promise.reject();
          })
      },
      queryCephLog(param) {
        return this.$http.get(`json/nodes/${this.node}/ceph/log`, param)
          .then(res => {
            if(res.data) {
              return Promise.resolve(res.data);
            }
          })
      },
      updateOSDInOrOut(id, type, param) {
       let event = this.createEvent('action.update.osd');
        return this.$http.post(`json/nodes/${this.node}/ceph/osd/${id}/${type}`, param, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=utf8'
          }
        })
          .then(res => {
            this.incEventSuccess(event);
          })
          .catch(res => {
            this.incEventFail(event);
            confirm.call(this, res,  'error', 'icon-error');
            return Promise.reject();
          })
      },
      deleteOSDInOrOut(id, param) {
       let event = this.createEvent('action.delete.osd');
        return this.$http.del(`json/nodes/${this.node}/ceph/osd/${id}`, param)
          .then(res => {
            this.incEventSuccess(event);
          })
          .catch(res => {
            this.incEventFail(event);
            confirm.call(this, res,  'error', 'icon-error');
            return Promise.reject();
          })
      },
      deleteMds(id, param) {
        let event = this.createEvent('action.delete.osd');
        return this.$http.del(`json/nodes/${this.node}/ceph/mds/${id}`, param)
          .then(res => {
            this.incEventSuccess(event);
            this.queryStatus(id, res.data);
          })
          .catch(res => {
            this.incEventFail(event);
            confirm.call(this, res,  'error', 'icon-error');
            return Promise.reject();
          })
      },
      //查询osd flags
      queryFlags(param) {
        return this.$http.get(`json/cluster/ceph/flags`, param) 
                   .then(res => {
                     if(res.data) {
                       return Promise.resolve(res.data);
                     }
                   })
      },
      //添加flags
      addFlags(param) {
         let event = this.createEvent('action.add.osd.flags');
        return this.$http.put(`json/cluster/ceph/flags`, param, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=utf8'
          }
        })
          .then(res => {
            this.incEventSuccess(event);
          })
          .catch(res => {
            this.incEventFail(event);
            confirm.call(this, res,  'error', 'icon-error');
            return Promise.reject();
          })
      },
      //添加mds
      addMds(nodename, param) {
          let event = this.createEvent('action.add.mds');
        return this.$http.post(`json/nodes/${this.node}/ceph/mds/${nodename}`, param, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=utf8'
          }
        })
          .then(res => {
            this.incEventSuccess(event);
            this.queryStatus(this.node, res.data);
          })
          .catch(res => {
            this.incEventFail(event);
            confirm.call(this, res,  'error', 'icon-error');
            return Promise.reject();
          })
      },
      //添加mds
      addCephfs(fsname, param) {
          let event = this.createEvent('action.add.mds');
        return this.$http.post(`json/nodes/${this.node}/ceph/fs/${fsname}`, param, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=utf8'
          }
        })
          .then(res => {
            this.incEventSuccess(event);
            this.queryStatus(this.node, res.data);
          })
          .catch(res => {
            this.incEventFail(event);
            confirm.call(this, res,  'error', 'icon-error');
            return Promise.reject();
          })
      },
      //查询ceph池
      queryCephPools() {
        return this.$http.get(`json/nodes/${this.node}/ceph/pools`)
                   .then(res => {
                     if(res.data) {
                       return Promise.resolve(res.data);
                     } 
                   })
      },
      //创建ceph池
       createPools(param) {
         let event = this.createEvent('action.add.pools');
        return this.$http.post(`json/nodes/${this.node}/ceph/pools`, param, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=utf8'
          }
        })
          .then(res => {
            this.incEventSuccess(event);
          })
          .catch(res => {
            this.incEventFail(event);
            confirm.call(this, res,  'error', 'icon-error');
            return Promise.reject();
          })
      },
      //查询规则
      queryRules() {
        return this.$http.get(`json/nodes/${this.node}/ceph/rules`)
                   .then(res => {
                     if(res.data) {
                       return Promise.resolve(res.data);
                     } 
                   })
      },
      //查询fs
      queryFs() {
        return this.$http.get(`json/nodes/${this.node}/ceph/fs`)
                   .then(res => {
                     if(res.data) {
                       return Promise.resolve(res.data);
                     }
                   })
      },
      //查询mds
      queryMds() {
        return this.$http.get(`json/nodes/${this.node}/ceph/mds`)
                   .then(res => {
                     if(res.data) {
                       return Promise.resolve(res.data);
                     }
                   })
      },
      //销毁存储池
      deleteCephPool(id) {
        return this.$http.del(`json/nodes/${this.node}/ceph/pools/${id}`, {
          remove_storages: 1
        })
                   .then(res => {
                     if(res.data) {
                        this.queryStatus(this.node, res.data);
                     }
                   })
      }
    }
  }
</script>

<style scoped>

</style>
