<script>
import { deepCopy, parse_task_upid} from '@libs/utils/index';
export default {
	name: 'NodeDidkHttp',
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
		queryListNodeDiskList() {
      this.loading = true;
			return this.$http.get(`json/nodes/${this.node}/disks/list`)
			           .then(res => {
                   this.loading = false;
									 if(res.data) {
										 this.updateTable({
											 tableName: 'nodeDiskList',
											 list: res.data
										 })
									 }
								 }).catch(res => {
								   this.loading = false;
        })
		},
		querySMartList(param) {
				return this.$http.get(`json/nodes/${this.node}/disks/smart`, param)
			           .then(res => {
									 if(res.data) {
										 this.updateDbObject({
											 name: 'nodeSmartList',
											 data: res.data
										 })
									 }
								 })
								 .catch((res) => {
									 return Promise.reject(res);
								 })
		},
		initGPT() {
			return this.$http.post(`json/nodes/${this.node}/disks/initgpt`, {
				disk: this.selectedList[0].devpath
			},{
				headers: {
					 'content-type': 'application/x-www-form-urlencoded; charset=utf8'
				}
			}).then(async res => {
				 this.incEventSuccess(event);
				 if(res.data) {
					   let task = parse_task_upid(res.data);
            await this.queryLog(task.node, res.data);
            await this.queryStatus(task.node, res.data);
				 }
			})
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
	}
}
</script>
