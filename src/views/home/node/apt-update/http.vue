<script>
import { parse_task_upid } from '@libs/utils/index';
export default {
  name: "NodeAptUpdateHttp",
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
    queryAptUpdateList() {
      return this.$http
        .get(`json/nodes/${this.node}/apt/update`)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "aptList",
              list: res.data,
            });
          }
        });
    },
    querySubscriptionInfo() {
      return this.$http
        .get(`json/nodes/localhost/subscription`, {
          _dc: new Date().getTime(),
        })
        .then((res) => {
          if (res.data) {
            this.updateDbObject({
              name: "subscriptionObj",
              data: res.data,
            });
          }
        });
    },
    update() {
      return this.$http
        .post(`json/nodes/${this.node}/apt/update`, null, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then(async (res) => {
          if (res.data) {
            let task = parse_task_upid(res.data);
            await this.queryLog(task.node, res.data);
            await this.queryStatus(task.node, res.data);
          }
        })
        .catch((res) => {
          return Promise.reject(res);
        });
    },
    queryLog(node, pid) {
      return this.$http
        .get(`json/nodes/${node}/tasks/${pid}/log`, {
          _dc: new Date().getTime(),
          start: 0,
          limit: 500,
        })
        .then((res) => {
          this.updateTable({
            tableName: "addClusterLogList",
            list: res.data,
          });
        });
    },
    queryStatus(node, pid) {
      return this.$http
        .get(`json/nodes/${node}/tasks/${pid}/status`, {
          _dc: new Date().getTime(),
        })
        .then((res) => {
				  if(!res.data) return;
          if (res.data.status !== "running" && this.interVal) {
            clearInterval(this.interVal);
            this.interVal = null;
          }
          this.updateDbObject({
            name: "addClusterStatusObj",
            data: res.data,
          });
        });
    },
    stopTask(node, pid) {
      return this.$http.del(`json/nodes/${node}/tasks/${pid}`).then(() => {
        this.querySubscriptionInfo();
      });
		},
		queryChangeLog(param) {
			return this.$http.get(`json/nodes/${this.node}/apt/changelog`,param)
			           .then(res => {
									 if(res.data) {
										 this.updateDbObject({
											 name: 'changeLogObj',
											 data: res
										 })
									 }
								 })
		}
  },
};
</script>