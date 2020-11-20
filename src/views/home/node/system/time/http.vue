<script>
export default {
	name: 'NodeSystemHttp',
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
		queryTime(){
			return this.$http.get(`json/nodes/${this.node}/time`)
			           .then(res => {
									 if(res.data) {
										 this.updateDbObject({
											 name: 'timeZoneObj',
											 data: res.data
										 })
									 }
								 })
		},
		updateTimeZone(param) {
				let event = this.createEvent(`action.timezone.update`);
			return this.$http.put(`json/nodes/${this.node}/time`, param, {
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