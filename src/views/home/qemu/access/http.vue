<script>
import { deepCopy } from "@libs/utils/index";
export default {
	name: "StorageAccessHttp",
	data() {
    return {
      node: "",
      storage: "",
    };
  },
  mounted() {
    let _this = this;
    debugger;
    let last = window.localStorage.getItem("lastsel") || "[]";
    _this.node = (JSON.parse(last).node && JSON.parse(last).node) || "";
    _this.vmid = (JSON.parse(last).vmid && JSON.parse(last).vmid) || "";
  },
  methods: {
    queryAccessList() {
      return this.$http.get("json/access/acl").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "accessList",
            list: res.data,
          });
        }
      });
    },
    queryGroupsList() {
      return this.$http.get("json/access/groups").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "groupsList",
            list: res.data,
          });
        }
      });
    },
    queryRoleList() {
      return this.$http.get("json/access/roles").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "rolesList",
            list: res.data,
          });
        }
      });
    },
    queryUsersList(param) {
      return this.$http.get("json/access/users", param).then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "usersList",
            list: res.data,
          });
        }
      });
    },
    createAccess(param) {
      let event = this.createEvent("action.access.create");
      return this.$http
        .put("json/access/acl", param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
          this.queryAccessList();
        })
        .catch(() => {
          this.incEventFail(event);
        });
    },
    delete() {
      let event = this.createEvent("action.access.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((item) => {
          let param = deepCopy(item);
          if (item.type === "user") {
            param.users = item.ugid;
            delete param.ugid;
            delete param.propagate;
          }
          if (item.type === "group") {
            param.groups = item.ugid;
            delete param.ugid;
            delete param.propagate;
          }
          if (item.type === "token") {
            param.tokens = item.ugid;
            delete param.ugid;
            delete param.propagate;
          }
          delete param.type;
          param.roles = param.roleid;
          param.delete = 1;
          delete param.roleid;
          p = this.$http
            .put("json/access/acl", param, {
              headers: {
                "content-type":
                  "application/x-www-form-urlencoded; charset=UTF-8",
              },
            })
            .then(() => {
              this.incEventSuccess(event);
              this.queryAccessList();
            })
            .catch(() => {
              this.incEventFail(event);
            });
        })(item);
        tasks.push(p);
      });
      return Promise.all(tasks);
    },
    //查询domain
    queryDomain() {
      this.$http.get("json/access/domains").then((res) => {
        if (res.data) {
          this.realmList = res.data.map((item) => {
            return {
              label: item.comment,
              value: item.realm,
            };
          });
          this.realm = res.data[0].realm;
          this.updateTable({
            tableName: "domainsList",
            list: res.data,
          });
        }
      });
    },
    //创建用户
    createAccessUser(param) {
      let event = this.createEvent("action.access.user.create");
      return this.$http
        .post("json/access/users", param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
          this.queryUsersList();
        })
        .catch(() => {
          this.incEventFail(event);
        });
		},
		queryUsersObj(param) {
      return this.$http.get(`json/access/users/${param.id}`, {
				'_dc': new Date().getTime()
			}).then((res) => {
        if (res.data) {
          this.updateDbObject({
            name: "usersObj",
            data: res.data,
          });
        }
      });
		},
		updateUsers(param) {
			 let event = this.createEvent("action.access.user.update");
			 let params = deepCopy(param);
			 delete params.userid
      return this.$http
        .put(`json/access/users/${param.userid}`, params, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
          this.queryUsersList();
        })
        .catch(() => {
          this.incEventFail(event);
        });
		},
		deleteUsers() {
			 let event = this.createEvent("action.access.user.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((userid) => {
          p = this.$http
            .del(`json/access/users/${userid}`)
            .then(() => {
              this.incEventSuccess(event);
              this.queryUsersList();
            })
            .catch(() => {
              this.incEventFail(event);
            });
        })(item.userid);
        tasks.push(p);
      });
      return Promise.all(tasks);
		},
		updateUserPsw(param) {
			let event = this.createEvent("action.access.user.password.update");
      return this.$http
        .put(`json/access/password`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
          this.queryUsersList();
        })
        .catch(() => {
          this.incEventFail(event);
        });
    },
    queryTfa(param) {
      return this.$http.get(`json/access/users/${encodeURIComponent(param.userid)}/tfa`, {
        _dc: new Date().getTime()
      }).then((res) => {
        if (res.data) {
          this.updateDbObject({
            name: "tfaObj",
            data: res.data,
          });
        }
      });
    },
    updateTfa(param) {
      return this.$http.put(`json/access/tfa`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        }).then((res) => {
         if (res.data) {
          this.updateDbObject({
            name: "tfaObj",
            data: res.data,
          });
        }
      })
    },
    queryUserPermisson(param) {
      return this.$http.get(`json/access/permissions`,param).then((res) => {
        this.updateDbObject({
            name: "userPermissionObj",
            data: res.data,
          });
      })
    },
    createTokenApi(param) {
       let event = this.createEvent("action.access.token.create");
       let params = deepCopy(param);
       delete params.userid;
      delete params.tokenid;
      return this.$http.post(`json/access/users/${param.userid}/token/${param.tokenid}`, params, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).then(() => {
        this.incEventSuccess(event);
      }).catch((error) => {
        this.incEventFail(event);
        return Promise.reject(error);
      })
    },
    updateTokenApi(param) {
      let event = this.createEvent("action.access.token.update");
      let params = deepCopy(param);
      delete params.userid;
      delete params.tokenid;
      return this.$http.put(`json/access/users/${param.userid}/token/${param.tokenid}`, params, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).then(() => {
        this.incEventSuccess(event);
      }).catch((error) => {
        debugger;
        this.incEventFail(event);
        return Promise.reject(error);
      })
    },
    deleteApiToken() {
      let event = this.createEvent("action.access.token.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((it) => {
          p = this.$http
            .del(`json/access/users/${it.userid}/token/${it.tokenid}`)
            .then(() => {
              this.incEventSuccess(event);
              this.queryUsersList({full:1, _dc: new Date().getTime()});
            })
            .catch(() => {
              this.incEventFail(event);
            });
        })(item);
        tasks.push(p);
      });
      return Promise.all(tasks);
    },
    queryGroupsObj(param) {
      return this.$http.get(`json/access/groups/${param.groupid}`, {
        _dc: new Date().getTime()
      }).then((res) => {
        if (res.data) {
          this.updateDbObject({
            name: "groupsObj",
            data: res.data,
          });
        }
      });
    },
    createGroups(param) {
      let event = this.createEvent("action.access.group.create");
      return this.$http.post(`json/access/groups`, param, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).then(() => {
        this.incEventSuccess(event);
        this.queryGroupsList();
      }).catch((error) => {
        this.incEventFail(event);
        return Promise.reject(error);
      })
    },
    updateGroup(param) {
       let event = this.createEvent("action.access.group.create");
      let params = deepCopy(param);
      delete params.groupid;
      return this.$http.put(`json/access/groups/${param.groupid}`, params, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).then(() => {
        this.incEventSuccess(event);
        this.queryGroupsList();
      }).catch((error) => {
        this.incEventFail(event);
        return Promise.reject(error);
      })
    },
    deleteGroupById() {
      let event = this.createEvent("action.access.group.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((it) => {
          p = this.$http
            .del(`json/access/groups/${it.groupid}`)
            .then(() => {
              this.incEventSuccess(event);
              this.queryGroupsList();
            })
            .catch(() => {
              this.incEventFail(event);
            });
        })(item);
        tasks.push(p);
      });
      return Promise.all(tasks);
    },
    getPoolsList() {
        return this.$http.get(`/json/pools`).then((res) => {
         if(res.data) {
           this.updateTable({
            tableName: "poolsList",
            list: res.data,
          });
         }
      })
    },
    deletePoolById() {
      let event = this.createEvent("action.access.pool.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((it) => {
          p = this.$http
            .del(`json/pools/${it.poolid}`)
            .then(() => {
              this.incEventSuccess(event);
              this.getPoolsList();
            })
            .catch(() => {
              this.incEventFail(event);
            });
        })(item);
        tasks.push(p);
      });
      return Promise.all(tasks);
    },
     createPool(param) {
      let event = this.createEvent("action.access.pool.create");
      return this.$http.post(`json/pools`, param, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).then(() => {
        this.incEventSuccess(event);
        this.getPoolsList();
      }).catch((error) => {
        this.incEventFail(event);
        return Promise.reject(error);
      })
    },
    updatePool(param) {
       let event = this.createEvent("action.access.pool.update");
      let params = deepCopy(param);
      delete params.poolid;
      return this.$http.put(`json/pools/${param.poolid}`, params, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).then(() => {
        this.incEventSuccess(event);
         this.getPoolsList();
      }).catch((error) => {
        this.incEventFail(event);
        return Promise.reject(error);
      })
    },
    deleteRoleById() {
       let event = this.createEvent("action.access.role.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((it) => {
          p = this.$http
            .del(`json/access/roles/${it.roleid}`)
            .then(() => {
              this.incEventSuccess(event);
              this.queryRoleList();
            })
            .catch(() => {
              this.incEventFail(event);
            });
        })(item);
        tasks.push(p);
      });
      return Promise.all(tasks);
    },
    queryRoleObjById(param) {
      return this.$http.get(`json/access/roles/${param.roleid}`, {
				'_dc': new Date().getTime()
			}).then((res) => {
        if (res.data) {
          this.updateDbObject({
            name: "roleObj",
            data: res.data,
          });
        }
      });
    },
     createRole(param) {
      let event = this.createEvent("action.access.role.create");
      return this.$http.post(`json/access/roles`, param, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).then(() => {
        this.incEventSuccess(event);
        this.queryRoleList();
      }).catch((error) => {
        this.incEventFail(event);
        return Promise.reject(error);
      })
    },
    updateRole(param) {
       let event = this.createEvent("action.access.role.update");
      let params = deepCopy(param);
      delete params.roleid;
      return this.$http.put(`json/access/roles/${param.roleid}`, params, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).then(() => {
        this.incEventSuccess(event);
         this.queryRoleList();
      }).catch((error) => {
        this.incEventFail(event);
        return Promise.reject(error);
      })
    },
    createAccessDomain(param) {
      let event = this.createEvent("action.access.domain.create");
      return this.$http.post(`json/access/domains`, param, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).then(() => {
        this.incEventSuccess(event);
        this.queryDomain();
      }).catch((error) => {
        this.incEventFail(event);
        return Promise.reject(error);
      })
    },
    queryDomainById(param) {
      return this.$http.get(`json/access/domains/${param.realm}`, {
        _dc: new Date().getTime()
      }).then((res) => {
        if (res.data) {
          this.updateDbObject({
            name: "domainsObj",
            data: res.data,
          });
        }
      })
    },
    updateDomain(param) {
      let event = this.createEvent("action.access.domain.update");
      let params = deepCopy(param);
      delete params.realm
      delete params.type
      return this.$http.put(`json/access/domains/${param.realm}`, params, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).then(() => {
        this.incEventSuccess(event);
        this.queryDomain();
      }).catch((error) => {
        this.incEventFail(event);
        return Promise.reject(error);
      })
    }
  },
};
</script>