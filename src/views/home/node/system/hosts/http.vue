<script>
export default {
	name: 'NodeSystemHostsHttp',
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
		queryHosts() {
			return this.$http.get(`json/nodes/${this.node}/hosts`)
			           .then(res => {
									 if(res.data) {
										 this.updateDbObject({
											 name: 'systemHostObj',
											 data: res.data
										 })
									 }
								 })
		},
		updateHosts(param) {
			let event =  this.createEvent(`action.node.host.update`);
			return this.$http.post(`json/nodes/${this.node}/hosts`, param, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=utf8'
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