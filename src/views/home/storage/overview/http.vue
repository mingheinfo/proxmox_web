<script>
export default {
  name: "StorageOverviewHttp",
  methods: {
    queryStatus() {
      return this.$http
        .get(
          `/json/nodes/${this.storage.node}/storage/${this.storage.storage}/status`
        )
        .then((res) => {
          if (res.data) {
            this.updateDbObject({
              name: "storageObj",
              data: res.data,
            });
          }
        });
		},
			 queryRrdData() {
        return this.$http.get(`/json/nodes/${this.storage.node}/storage/${this.storage.storage}/rrddata?timeframe=${this.timeframe.replace(/(.*?)\((.*?)\)/g, '$1')}&cf=${this.timeframe.replace(/(.*?)\((.*?)\)/g, '$2')}`)
          .then(res => {
						if(res.data && res.data.length > 0) {
              this.usedRate = Object.assign({}, this.usedRate, {
              value: [res.data.map(it => it.total ? it.total : 0), res.data.map(it => it.used ? it.used : 0)],
              color: this.colors,
              func: this.byteToSize,
              time: res.data.map(it => it.time)
            })
						}
          })
			},
  },
};
</script>