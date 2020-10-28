<script>
export default {
  name: "PoolsOverviewHttp",
  methods: {
    queryPoolList() {
      return this.$http.get(`/json/pools/${this.pools.pool}`).then((res) => {
        if(res.data) {
				 this.updateDbObject({
           name: "poolsObj",
           data: res.data,
         });
				}
      });
    },
  },
};
</script>