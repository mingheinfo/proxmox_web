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
        }).catch(() => {
           this.updateDbObject({
              name: "storageObj",
              data: {},
            });
        });
    },
    queryRrdData() {
       let [timeframe, cf] = [this.timeframe.replace(/(.*?)\((.*?)\)/g, "$1"), this.timeframe.replace(/(.*?)\((.*?)\)/g, "$2")];
      if(/[\u4e00-\u9fa5]/.test(timeframe) || /[\u4e00-\u9fa5]/.test(cf)) return;
      this.loading = true;
      return this.$http
        .get(
          `/json/nodes/${this.storage.node}/storage/${
            this.storage.storage
          }/rrddata?timeframe=${encodeURIComponent(timeframe)}&cf=${cf}`
        )
        .then((res) => {
          if (res.data && res.data.length > 0) {
            this.usedRate = Object.assign({}, this.usedRate, {
              value: [
                res.data.map((it) => (it.total ? it.total : 0)),
                res.data.map((it) => (it.used ? it.used : 0)),
              ],
              color: this.colors,
              func: this.byteToSize,
              time: res.data.map((it) => it.time),
            });
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          this.usedRate = {
            value: [],
            label: ["Total Size", "Used Size"],
          };
        });
    },
  },
};
</script>
