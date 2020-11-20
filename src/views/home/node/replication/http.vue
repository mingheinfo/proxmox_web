<script>
export default {
	name: 'NodeReplicationHttp',
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
		queryNodeReplication() {
			return this.$http.get(`json/nodes/${this.node}/replication`)
			           .then(res => {
									  if(res.data) {
											this.updateTable({
												tableName: 'nodeReplicationList',
												list: res.data
											})
										}
								 })
		},
		queryHighIds() {
      return this.$http
        .get("json/cluster/replication", {
          _dc: new Date().getTime(),
        })
        .then((res) => {
          if (res.data) this.jobs = res.data;
        });
		},
		 queryNodeList() {
      return this.$http.get("json/nodes").then((res) => {
        if (res.data)
          this.updateTable({
            tableName: "nodeList",
            list: res.data,
          });
      });
    },
		queryReplicationById(id) {
      return this.$http.get(`json/nodes/${this.node}/${id}`).then((res) => {
        if (res.data)
          this.updateDbObject({
            name: "dataCenterReplicationObj",
            data: res.data,
          });
      });
		},
		 createReplication(params) {
      let event = this.createEvent("action.node.replication.create", params.guest);
      return this.$http
        .post(`json/cluster/replication`, params, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
          this.queryReplicationList();
        })
        .catch((res) => {
					this.incEventFail(event);
					return Promise.reject(res);
        });
    },
	}
}
</script>