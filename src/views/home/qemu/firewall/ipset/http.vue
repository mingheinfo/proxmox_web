<script>
export default {
	name: 'IPSetHttp',
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
    * 查询IPSET
   */
    queryIpSetList() {
      return this.$http.get(`json/nodes/${this.node.node}/${this.node.id}/firewall/ipset`).then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "ipSetList",
            list: res.data,
          });
        }
      });
    },
    /**
    * 查询IPSET cidr
   */
    queryIpSetCidrList(ipset) {
      return this.$http
        .get(`json/nodes/${this.node.node}/${this.node.id}/firewall/ipset/${ipset}`)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "ipSetCidrList",
              list: res.data,
            });
          }
        });
    },
    /**
    * 创建IPSET cidr
   */
		createIPSet(param) {
			 let event = this.createEvent("action.firewall.ipset.create");
      return this.$http
        .post(`json/nodes/${this.node.node}/${this.node.id}/firewall/ipset`, param, {
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
    * 更新IPSET cidr
   */
		updateIPSet(param) {
			 let event = this.createEvent("action.firewall.ipset.update");
      return this.$http
        .post(`json/nodes/${this.node.node}/${this.node.id}/firewall/ipset`, param, {
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
    * 删除IPSET
   */
		 deleteIpset() {
      let event = this.createEvent("action.firewall.ipset.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((it) => {
          p = this.$http
            .del(`json/nodes/${this.node.node}/${this.node.id}/firewall/ipset/${it.name}`)
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
    /**
    * 删除IPSET cidr
   */
		deleteIpsetCidr(name) {
			 let event = this.createEvent("action.firewall.ipset.cidr.delete");
      let tasks = [],
        p;
      this.selectedCidrList.forEach((item) => {
        ((it) => {
          p = this.$http
            .del(`json/nodes/${this.node.node}/${this.node.id}/firewall/ipset/${name}/${it.cidr}`)
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
        .post(`json/nodes/${this.node.node}/${this.node.id}/firewall/ipset/${name}`, param, {
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
        .put(`json/nodes/${this.node.node}/${this.node.id}/firewall/ipset/${ipset}/${param.cidr}`, params, {
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
	}
}
</script>