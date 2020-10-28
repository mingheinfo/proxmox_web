<script>
   export default {
		 name: 'CreateQemuHttp',
		 methods: {
			 queryNodeList() {
				return	this.$http.get('/json/nodes')
					    .then((res) => {
						    if(res.data) {
									this.nodeList = res.data;
								}
					    })
			 },
			 queryPoolList() {
				return	this.$http.get('/json/pools')
					    .then((res) => {
                 if(res.data) {
									 this.poolList = res.data;
								 }
							})
			 },
			 queryNextVmId() {
        return  this.$http.get('/json/cluster/nextid',{
						_dc: Date.now()
					})
					.then((res) => {
             if(res.data) {
							 this.vmid = res.data;
							 this.nextid = res.data;
						 }
					}) 
			 },
			 queryStorageList() {
         return this.$http.get(`/json/nodes/${this.nodename}/storage`, {
					 format:1,
					 content: 'iso'
				 })
				 .then((res) => {
					 if(res.data) {
							this.storageList = res.data;
						}
				  })
			 },
			 queryImageStorageList() {
         return this.$http.get(`/json/nodes/${this.nodename}/storage`, {
					 format:1,
					 content: 'images'
				 })
				 .then((res) => {
					 if(res.data) {
							this.imageStorageList = res.data;
						}
				  })
			 },
			 queryIsoList() {
				 return this.$http.get(`/json/nodes/${this.nodename}/storage/local/content`, {
					 content: 'iso'
				 })
				 .then((res) => {
					 if(res.data) {
							this.isoList = res.data;
						}
				  })
			 },
			 queryNetWorkList() {
				 return this.$http.get(`/json/nodes/${this.nodename}/network`, {
					 type: 'any_bridge'
				 })
				 .then((res) => {
					 if(res.data) {
							this.networkList = res.data;
						}
				  })
			 },
			 createQemu(params) {
				 let event = this.createEvent('action.qumu.create', params.name)
				 return this.$http.post(`/json/nodes/${this.nodename}/qemu`,params, {
					 headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
				 })
				 .then((res) => {
					 if(res.data) {
						  this.incEventSuccess(event);
						}
				  })
			 }
		 }
	 }
</script>