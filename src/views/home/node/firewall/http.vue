<script>
import { deepCopy} from '@libs/utils/index';
export default {
	name: 'NodeFireWallHttp',
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
		queryFireWallList() {
      return this.$http.get(`json/nodes/${this.node}/firewall/rules`).then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "nodeFireWallRuleList",
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
            .del(`json/nodes/${this.node}/firewall/rules/${it.pos}`)
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
        .post(`json/nodes/${this.node}/firewall/rules`, param, {
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
        .put(`json/nodes/${this.node}/firewall/rules/${id}`, param, {
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
        .get(`json/nodes/${this.node}/firewall/rules/${id}`, {
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
      delete params.ipversion;
      params.enable = params.enable === 0 ? 1 : 0;
      return this.$http
        .put(`json/nodes/${this.node}/firewall/rules/${param.pos}`, params, {
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
	}
}
</script>
