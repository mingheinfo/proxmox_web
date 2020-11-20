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
		queryDiskDirectory(param) {
			return this.$http.get(`json/nodes/${this.node}/disks/directory`, param)
			           .then(res => {
                    if(res.data) {
											this.updateTable({
												tableName: 'nodeDiskDirectoryList',
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
		createDirectory(param) {
			let event = this.createEvent(`action.node.disk.directory.create`);
			return this.$http.post(`json/nodes/${this.node}/disks/directory`, param, {
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