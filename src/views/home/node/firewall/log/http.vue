<script>
export default {
	name: 'NodeFireWallLogHttp',
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
		queryNodeFireWallLogList() {
			return this.$http.get(`json/nodes/${this.node}/firewall/log`, {
				_dc: new Date().getTime(),
				start: 0,
				limit:500
			}).then(res => {
				if(res.data) {
					this.updateTable({
						tableName: 'nodeFireWallLogList',
						list: res.data
					}) 
				}
			})
		}
	}
}
</script>