<script>
export default {
	name: 'QemuFireWallOptionsHttp',
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
		queryQemuOption() {
			return this.$http.get(`json/nodes/${this.node.node}/${this.node.id}/firewall/options`)
			           .then(res => {
									 if(res.data) {
										 this.updateDbObject({
											 name: 'qemuFireWallOptionsObj',
											 data: res.data
										 })
									 }
								 })
		},
		 //编辑Option
    modifyOptions(param) {
      let event = this.createEvent("action.firewall.update");
      return this.$http
        .put(`json/nodes/${this.node.node}/${this.node.id}/firewall/options`, param, {
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
	}
}
</script>