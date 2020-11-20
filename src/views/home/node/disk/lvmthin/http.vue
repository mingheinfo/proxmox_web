<script>
export default {
	name: 'NodeDiskLvmThinHttp',
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
		queryDiskLvmThin(param) {
			return this.$http.get(`json/nodes/${this.node}/disks/lvmthin`, param)
			           .then(res => {
                    if(res.data) {
											this.updateTable({
												tableName: 'nodeDiskLvmThinList',
												list: res.data
											})
										}
								 })
		},
		queryListNodeDiskList(param) {
			return this.$http.get(`json/nodes/${this.node}/disks/list`, param)
			           .then(res => {
									 if(res.data) {
										 this.updateTable({
											 tableName: 'nodeDiskList',
											 list: res.data
										 })
									 }
								 })
		},
		createThin(param) {
			let event = this.createEvent(`action.node.disk.lvmthin.create`);
			return this.$http.post(`json/nodes/${this.node}/disks/lvmthin"`, param, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=utf8'
				}
			}).then(res => {
				this.incEventSuccess(event);
			}).catch(res => {
				return Promise.reject(res);
			})
		}
	}
}
</script>