<script>
export default {
	name: 'SysLogHttp',
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
    querySysLog(param) {
			return this.$http.get(`json/nodes/${this.node}/journal`, param)
			           .then(res => {
									 if(res.data) {
										 this.updateTable({
											 tableName: 'nodeSysLogList',
											 list: res.data
										 })
										 this.setUpdateCursor(res.data);
										 return res.data;
									 }
								 })
		}
	}
}
</script>