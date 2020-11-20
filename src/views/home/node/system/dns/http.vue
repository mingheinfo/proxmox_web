<script>
export default {
	name: 'NodeSystemDnsHttp',
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
		queryNodeSystemDnsList() {
			return this.$http.get(`/json/nodes/${this.node}/dns`)
			           .then(res => {
									 if(res.data) {
										 this.updateDbObject({
											 name: 'dnsObj',
											 data: res.data
										 })
									 }
								 })
		},
		updateDns(param) {
			let event = this.createEvent(`action.dns.update`);
			return this.$http.put(`json/nodes/${this.node}/dns`, param, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=utf8;'
				}
			})
			           .then(res => {
                    this.incEventSuccess(event);
								 })
								 .catch(res => {
									 this.incEventFail(event);
									 return Promise.reject(res);
								 })
		}
	}
}
</script>