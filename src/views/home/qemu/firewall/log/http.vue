<script>
export default {
	name: 'NodeFireWallLogHttp',
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
		queryQemuFireWallLogList() {
			return this.$http.get(`json/nodes/${this.node.node}/${this.node.id}/firewall/log`, {
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