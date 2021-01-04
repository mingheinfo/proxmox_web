<script>
import { deepCopy } from "@libs/utils/index";
export default {
  name: "FireWallHttp",
  methods: {
    queryFireWallList() {
      return this.$http.get("json/cluster/firewall/rules").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "fireWallRuleList",
            list: res.data,
          });
        }
      });
    },
    handleEnable(param) {
      let event = this.createEvent(
          `action.firewall.${param.enable === 0 ? "enable" : "stop"}`
        ),
        params = deepCopy(param);
      delete params.pos;
      delete params.ipversion;
      params.enable = params.enable === 0 ? 1 : 0;
      return this.$http
        .put(`json/cluster/firewall/rules/${param.pos}`, params, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then((res) => {
          this.queryFireWallList();
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    queryMacrosList() {
      return this.$http.get("json/cluster/firewall/macros").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "macrosList",
            list: res.data,
          });
        }
      });
    },
    queryRefsList(param) {
      return this.$http.get("json/cluster/firewall/refs", param).then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "fireWallResfList",
            list: res.data,
          });
        }
      });
    },
    createFireWall(param) {
      let event = this.createEvent(`action.firewall.create`);
      return this.$http
        .post("json/cluster/firewall/rules", param, {
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
    deleteFireWallRule() {
      let event = this.createEvent("action.firewall.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((it) => {
          p = this.$http
            .del(`json/cluster/firewall/rules/${it.pos}`)
            .then(() => {
              this.incEventSuccess(event);
              this.queryFireWallList();
            })
            .catch(() => {
              this.incEventFail(event);
            });
        })(item);
        tasks.push(p);
      });
      return Promise.all(tasks);
    },
    queryFireWallById(id) {
      return this.$http
        .get(`json/cluster/firewall/rules/${id}`, {
          _dc: new Date().getTime(),
        })
        .then((res) => {
          if (res.data) {
            this.updateDbObject({
              name: "fireWallRuleObj",
              data: res.data,
            });
          }
        });
    },
    //编辑更新防火墙
    updateFireWall(id, param) {
      let event = this.createEvent("action.firewall.update");
      return this.$http
        .put(`json/cluster/firewall/rules/${id}`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    //查询安全组
    queryFireWallGroupList() {
      return this.$http.get(`json/cluster/firewall/groups`).then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "fireWallGroupList",
            list: res.data,
          });
        }
      });
    },
    //数据中心防火墙配置选项
    queryFireOptionList(param) {
      return this.$http
        .get(`json/cluster/firewall/options`, param)
        .then((res) => {
          if (res.data) {
            this.updateDbObject({
              name: "optionObj",
              data: res.data,
            });
          }
        });
    },
    //编辑Option
    modifyOptions(param) {
      let event = this.createEvent("action.firewall.update");
      return this.$http
        .put(`json/cluster/firewall/options`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    //查询规则
    queryFireRuleList(group) {
      return this.$http
        .get(`json/cluster/firewall/groups/${group}`)
        .then((res) => {
          if (res.data) {
            return this.updateTable({
              tableName: "fireWallRuleList",
              list: res.data,
            });
          }
        });
    },
    handleGroupEnable(group, param) {
      let event = this.createEvent(
          `action.firewall.${param.enable === 0 ? "enable" : "stop"}`
        ),
        params = deepCopy(param);
      delete params.pos;
      params.enable = params.enable === 0 ? 1 : 0;
      return this.$http
        .put(`json/cluster/firewall/groups/${group}/${param.pos}`, params, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then((res) => {
          this.queryFireRuleList(group);
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    createFireWallGroupRule(group, param) {
      let event = this.createEvent("action.firewall.group.create");
      return this.$http
        .post(`json/cluster/firewall/groups/${group}`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded;charset=utf8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    queryFireWallGroupRuleById(group, id) {
      return this.$http
        .get(`json/cluster/firewall/groups/${group}/${id}`, {
          _dc: new Date().getTime(),
        })
        .then((res) => {
          if (res.data) {
            this.updateDbObject({
              name: "fireWallRuleObj",
              data: res.data,
            });
          }
        });
    },
    updateFireWallGroupRule(id, param, group) {
      let event = this.createEvent("action.firewall.group.rule.update");
      return this.$http
        .put(`json/cluster/firewall/groups/${group}/${id}`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    deleteFireWallGroupRule(group) {
      let event = this.createEvent("action.firewall.group.rule.delete");
      let tasks = [],
        p;
      this.selectedRuleList.forEach((item) => {
        ((it) => {
          p = this.$http
            .del(`json/cluster/firewall/groups/${group}/${it.pos}`)
            .then(() => {
              this.incEventSuccess(event);
              this.queryFireRuleList(group);
            })
            .catch(() => {
              this.incEventFail(event);
            });
        })(item);
        tasks.push(p);
      });
      return Promise.all(tasks);
    },
    createFireWallGroup(param) {
      let event = this.createEvent("action.firewall.group.create");
      return this.$http
        .post(`json/cluster/firewall/groups`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    updateFireWallGroup(param) {
      let event = this.createEvent("action.firewall.group.update");
      return this.$http
        .post(`json/cluster/firewall/groups`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    deleteFireWallGroup() {
      let event = this.createEvent("action.firewall.group.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((it) => {
          p = this.$http
            .del(`json/cluster/firewall/groups/${it.group}`)
            .then(() => {
              this.incEventSuccess(event);
              this.queryFireWallGroupList();
            })
            .catch((res) => {
              this.incEventFail(event);
              return Promise.reject(res);
            });
        })(item);
        tasks.push(p);
      });
      return Promise.all(tasks);
    },
    queryAliasList() {
      return this.$http.get("json/cluster/firewall/aliases").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "fireWallAliasList",
            list: res.data,
          });
        }
      });
    },
    createFireWallAlias(param) {
      let event = this.createEvent("action.firewall.alias.create");
      return this.$http
        .post(`json/cluster/firewall/aliases`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    queryFireWallAliasById(id) {
      return this.$http
        .get(`json/cluster/firewall/aliases/${id}`, {
          _dc: new Date().getTime(),
        })
        .then((res) => {
          if (res.data) {
            this.updateDbObject({
              name: "fireWallAliasObj",
              data: res.data,
            });
          }
        });
    },
    updateFireWallAlias(name, param) {
      let event = this.createEvent("action.firewall.alias.update");
      return this.$http
        .put(`json/cluster/firewall/aliases/${name}`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    deleteFireWallAlias() {
      let event = this.createEvent("action.firewall.alias.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((it) => {
          p = this.$http
            .del(`json/cluster/firewall/aliases/${it.name}`)
            .then(() => {
              this.incEventSuccess(event);
              this.queryAliasList();
            })
            .catch((res) => {
              this.incEventFail(event);
              return Promise.reject(res);
            });
        })(item);
        tasks.push(p);
      });
      return Promise.all(tasks);
    },
    queryIpSetList() {
      return this.$http.get("json/cluster/firewall/ipset").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "ipSetList",
            list: res.data,
          });
        }
      });
    },
    queryIpSetCidrList(ipset) {
      return this.$http
        .get(`json/cluster/firewall/ipset/${ipset}`)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "ipSetCidrList",
              list: res.data,
            });
          }
        });
		},
		createIPSet(param) {
			 let event = this.createEvent("action.firewall.ipset.create");
      return this.$http
        .post(`json/cluster/firewall/ipset`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
		},
		updateIPSet(param) {
			 let event = this.createEvent("action.firewall.ipset.update");
      return this.$http
        .post(`json/cluster/firewall/ipset`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
		},
		 deleteIpset() {
      let event = this.createEvent("action.firewall.ipset.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((it) => {
          p = this.$http
            .del(`json/cluster/firewall/ipset/${it.name}`)
            .then(() => {
              this.incEventSuccess(event);
              this.queryIpSetList();
            })
            .catch((res) => {
              this.incEventFail(event);
              return Promise.reject(res);
            });
        })(item);
        tasks.push(p);
      });
      return Promise.all(tasks);
		},
		deleteIpsetCidr(name) {
			 let event = this.createEvent("action.firewall.ipset.cidr.delete");
      let tasks = [],
        p;
      this.selectedCidrList.forEach((item) => {
        ((it) => {
          p = this.$http
            .del(`json/cluster/firewall/ipset/${name}/${it.cidr}`)
            .then(() => {
              this.incEventSuccess(event);
              this.queryIpSetCidrList(name);
            })
            .catch((res) => {
              this.incEventFail(event);
              return Promise.reject(res);
            });
        })(item);
        tasks.push(p);
      });
      return Promise.all(tasks);
		},
		//创建IPSetcidr
		createIPSetCidr(name, param) {
			 let event = this.createEvent(`action.firewallipset.cidr.create`);
      return this.$http
        .post(`json/cluster/firewall/ipset/${name}`, param, {
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
		//编辑更新IPSetCidr
		updateIPSetCidr(ipset, param) {
			 let event = this.createEvent("action.firewall.ipset.cidr.update"),
			 params = deepCopy(param);
			 delete params.cidr
      return this.$http
        .put(`json/cluster/firewall/ipset/${ipset}/${param.cidr}`, params, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
		}
  },
};
</script>
