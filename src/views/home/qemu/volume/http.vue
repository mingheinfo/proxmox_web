<script>
export default {
	name: 'VolumeHttp',
	methods: {
		queryResource() {
			return this.$http.get(`/json/nodes/${this.node.node}/${this.node.id}/pending`)
			           .then((res) => {
									 if(res.data) {
										 this.updateTable({
											 tableName: 'volumeList',
											 list: res.data
										 })
									 }
								 })
		}
	}
}
</script>