<script>
export default {
	name: 'QemuOverHttp',
	methods: {
		 queryRrdData() {
       let [timeframe, cf] = [this.timeframe.replace(/(.*?)\((.*?)\)/g, "$1"), this.timeframe.replace(/(.*?)\((.*?)\)/g, "$2")];
       if(/[\u4E00-\u9FA5]/.test(timeframe) || /[\u4E00-\u9FA5]/.test(cf)) return;
       this.rrdLoading = true;
        this.$http.get(`/json/nodes/${this.node.node}/${this.node.id}/rrddata?timeframe=${encodeURIComponent(timeframe)}&cf=${encodeURIComponent(cf)}`)
          .then(res => {
            this.rrdLoading = false;
            this.cpu = Object.assign({}, this.cpu, {
              value: [res.data.map(it => it.cpu ? it.cpu * 100 : 0)],
              color: this.colors,
              time: res.data.map(it => it.time)
            })
            this.memory = Object.assign({}, this.memory, {
              value: [res.data.map(it => it.maxmem ? it.maxmem : 0), res.data.map(it => it.mem ? it.mem : 0)],
              color: this.colors,
              func: this.byteToSize,
              time: res.data.map(it => it.time)
            })
            this.network = Object.assign({}, this.network, {
              value: [res.data.map(it => it.netin ? it.netin : 0), res.data.map(it => it.netout ? it.netout : 0)],
              color: this.colors,
              func: this.byteToSize,
              time: res.data.map(it => it.time)
            })
            this.disk = Object.assign({}, this.disk, {
              value: [res.data.map(it => it.diskread ? it.diskread : 0), res.data.map(it => it.diskwrite ? it.diskwrite : 0)],
              color: this.colors,
              func: this.byteToSize,
              time: res.data.map(it => it.time)
            })
          }).catch((rse) => {
          this.rrdLoading = false;
        })
			},
      queryConfig() {
        return this.$http.get(`/json/nodes/${this.node.node}/${this.node.id}/config?_dc=${new Date().getTime()}`)
          .then(res => {
            this.config = res.data;
            this.comment = res.data.description ? res.data.description : '';
          }).catch(res => {
            this.config.description = res;
            return Promise.reject(res);
          })
			},
			setComment() {
				let event = this.createEvent('action.qemu.comment', this.node.id);
        return this.$http.put(`/json/nodes/${this.node.node}/${this.node.id}/config`, {
          description: this.comment,
          digest: this.config.digest
        },{
          headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        }).then((res) => {
          this.incEventSuccess(event);
          this.showComment = false;
          this.queryConfig();
        }).catch(() => {
          this.incEventFail(event);
          this.showComment = false;
        })
      },
       /**
     * 查询资源
    */
    queryResource() {
       this.loading = true;
      return this.$http
        .get(`/json/nodes/${this.node.node}/${this.node.id}/status/current`)
        .then((res) => {
          this.loading = false;
					this.updateDbObject({
						name: 'qemuObj',
						data: res.data
					})
        }).catch((res) => {
          this.loading = true;
          this.loadingText = res;
        });
    },
	}
}
</script>
