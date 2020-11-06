<script>
export default {
	name: 'NotesHttp',
	methods: {
		//查询notes
		queryNotes() {
			return this.$http.get(`json/nodes/${this.node}/config`, {
				_dc: new Date().getTime()
			})
			           .then(res => {
									 if(res.data) {
										 this.updateDbObject({
											 name: 'nodeNotesObj',
											 data: res.data
										 })
									 }
								 })
		},
		//添加notes
		addNotes(node, content) {
			let event = this.createEvent('action.notes.add');
      return this.$http.put(`json/nodes/${node}/config`, content, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=utf8'
				}
			}).then((res) => {
			  this.incEventSuccess(event);
			}).catch((res) => {
				this.incEventFail(event);
				return Promise.reject(res);
			})
		}
	}
}
</script>