<script>
import { parse_task_upid } from "@libs/utils/index";
export default {
  name: "SystemHttp",
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
    queryNodeSystemList() {
      return this.$http.get(`json/nodes/${this.node}/services`).then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "nodeSystemList",
            list: res.data,
          });
        }
      });
    },
    operateService(operate) {
      if (this.selectedList.length !== 1) return;
      let event = this.createEvent("action.system.start");
      return this.$http
        .post(
          `json/nodes/${this.node}/services/${this.selectedList[0].name}/${operate}`,
          {},
          {
            headers: {
              "content-type": "application/x-www-form-urlencoded; charset=utf8",
            },
          }
        )
        .then(async (res) => {
          if (res.data) {
						let task = parse_task_upid(res.data);
						await this.queryStatus(task.node, res.data);
            this.showLog = true;
            if (
              this.db.addClusterStatusObj &&
              this.db.addClusterStatusObj.status
            ) {
              if (this.db.addClusterStatusObj.status === "stopped") {
                var exitstatus = this.db.addClusterStatusObj.exitstatus;
                if (exitstatus == "OK") {
									this.text = 'Done!';
									this.done = true;
									if(this.interVal){
										clearInterval(this.interVal);
										this.interVal = null;
									}
                } else {
                 this.showLog = false;
                }
              } else {
									this.text = 'Done!';
									this.done = true;
							}
            }
            this.interVal =  setInterval(await this.queryStatus(task.node, res.data), 1000);
          }
          this.incEventSuccess(event);
          this.queryNodeSystemList();
        })
        .catch(() => {
          this.incEventFail(event);
        });
    },
    queryStatus(node, pid) {
      return this.$http
        .get(`json/nodes/${node}/tasks/${pid}/status`, {
          _dc: new Date().getTime(),
        })
        .then((res) => {
          if (res.status !== "running" && this.interVal) {
            clearInterval(this.interVal);
            this.interVal = null;
          }
          this.updateDbObject({
            name: "addClusterStatusObj",
            data: res.data,
          });
        });
		},
		querySystemLog(param) {
			return this.$http.get(`json/nodes/${this.node}/syslog`, param)
			           .then((res) => {
									  if(res.data) {
											this.updateTable({
												tableName: 'nodeSystemLogList',
												list: res.data
									    })
										}
								 })
		}
  },
};
</script>