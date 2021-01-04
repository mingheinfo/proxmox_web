<script>
import { confirm } from '@libs/utils/index';
export default {
  name: "PoolsOverviewHttp",
  data() {
    return {
      pools: {}
    }
  },
  mounted() {
    let last = window.localStorage.getItem("lastsel") || "[]";
    this.pools = (JSON.parse(last) && JSON.parse(last)) || "";
  },
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
    queryStorage(param) {
      return this.$http.get(`json/nodes/localhost/storage`, param)
        .then(res => {
          if(res.data) {
            this.updateTable({
              tableName: "storageList",
              list: res.data,
            });
          }
        })
    },
    queryResource() {
      return this.$http.get(`json/cluster/resources`)
        .then(res => {
          if(res.data) {
            this.updateTable({
              tableName: "resources",
              list: res.data,
            });
          }
        })
    },
    updatePool(param) {
      let event = this.createEvent('action.update.pool');
      return this.$http.put(`/json/pools/${this.pools.pool}`, param, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=utf8'
        }
      }).then((res) => {
         this.incEventSuccess(event);
      }).catch(res => {
        this.incEventFail(event);
        confirm.call(this, res, 'error', 'icon-error');
      })
    },
    deleteResourceToPool() {
      let event = this.createEvent('action.pool.delete'), p, tasks= [];
      this.selectedList.forEach(item => {
        ((item) => {
          p = this.$http.put(`/json/pools/${this.pools.pool}`, {
            delete: 1,
            [item.type === 'storage' ? 'storage' : 'vms']: item.type === 'storage' ? item.storage : item.vmid
          }, {
            headers: {
              'content-type': 'application/x-www-form-urlencoded; charset=utf8'
            }
          }).then((res) => {
            this.incEventSuccess(event);
          }).catch(res => {
            this.incEventFail(event);
            confirm.call(this, res, 'error', 'icon-error');
          })
        })(item)
        tasks.push(p);
      })
      return Promise.all(tasks)
        .then(res => {
          this.__init__();
        });
    }
  },
};
</script>
