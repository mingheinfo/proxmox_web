<script>
import { deepCopy} from '@libs/utils/index';
export default {
	name: 'QemuFireWallHttp',
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
    /***
     * 查找规则
    */
		queryFireWallList() {
      return this.$http.get(`json/nodes/${this.node.node}/${this.node.id}/firewall/rules`).then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "qemuLxcFireWallRuleList",
            list: res.data,
          });
        }
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
		deleteFireWallRule() {
      let event = this.createEvent("action.firewall.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((it) => {
          p = this.$http
            .del(`json/nodes/${this.node.node}/${this.node.id}/firewall/rules/${it.pos}`)
            .then(() => {
              this.incEventSuccess(event);
              this.__init__();
            })
            .catch(() => {
              this.incEventFail(event);
            });
        })(item);
        tasks.push(p);
      });
      return Promise.all(tasks);
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
      return this.$http.get(`json/nodes/${this.node.node}/${this.node.id}/firewall/refs`, param).then((res) => {
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
        .post(`json/nodes/${this.node.node}/${this.node.id}/firewall/rules`, param, {
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
		 //编辑更新防火墙
    updateFireWall(id, param) {
      let event = this.createEvent("action.firewall.update");
      return this.$http
        .put(`json/nodes/${this.node.node}/${this.node.id}/firewall/rules/${id}`, param, {
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
		 queryFireWallById(id) {
      return this.$http
        .get(`json/nodes/${this.node.node}/${this.node.id}/firewall/rules/${id}`, {
          _dc: new Date().getTime(),
        })
        .then((res) => {
          if (res.data) {
            this.updateDbObject({
              name: "nodeFireWallRuleObj",
              data: res.data,
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
      params.enable = params.enable === 0 ? 1 : 0;
      return this.$http
        .put(`json/nodes/${this.node.node}/${this.node.id}/firewall/rules/${param.pos}`, params, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then((res) => {
          this.__init__();
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    /**
     * 查询虚拟机防火墙alias
    */
   queryFireWallAlias() {
     return this.$http.get(`json/nodes/${this.node.node}/${this.node.id}/firewall/aliases`)
                .then(res => {
                  if(res.data) {
                    this.updateTable({
                      tableName: 'fireWallAliasList',
                      list: res.data
                    })
                  }
                })
   },
   /**
    * 创建虚拟机别名
   */
    createFireWallAlias(param) {
       let _this = this,
      last = window.localStorage.getItem("lastsel") || "[]";
      _this.node = (JSON.parse(last) && JSON.parse(last)) || "";
      let event = this.createEvent("action.firewall.alias.create");
      return this.$http
        .post(`json/nodes/${_this.node.node}/${  _this.node.id}/firewall/aliases`, param, {
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
    /**
    * 单个查询虚拟机别名
   */
    queryFireWallAliasById(id) {
       let _this = this,
      last = window.localStorage.getItem("lastsel") || "[]";
      _this.node = (JSON.parse(last) && JSON.parse(last)) || "";
      return this.$http
        .get(`json/nodes/${_this.node.node}/${_this.node.id}/firewall/aliases/${id}`, {
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
    /**
    * 更新虚拟机别名
   */
    updateFireWallAlias(name, param) {
      let _this = this,
      last = window.localStorage.getItem("lastsel") || "[]";
      _this.node = (JSON.parse(last) && JSON.parse(last)) || "";
      let event = this.createEvent("action.firewall.alias.update");
      return this.$http
        .put(`json/nodes/${ _this.node.node}/${ _this.node.id}/firewall/aliases/${name}`, param, {
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
    /**
    * 删除虚拟机防火墙别名
   */
    deleteFireWallAlias() {
      let event = this.createEvent("action.firewall.alias.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((it) => {
          p = this.$http
            .del(`json/nodes/${this.node.node}/${this.node.id}/firewall/aliases/${it.name}`)
            .then(() => {
              this.incEventSuccess(event);
              this.__init__();
            })
            .catch((res) => {
              this.incEventFail(event);
              return Promise.reject(res);
            });
        })(item);
        tasks.push(p);
      });
      return Promise.all(tasks);
    }
	}
}
</script>