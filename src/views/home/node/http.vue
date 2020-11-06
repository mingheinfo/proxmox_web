<script>
import { parse_task_upid } from '@libs/utils/index'
export default {
	name: 'NodeHttp',
	methods: {
		//批量操作vm
	 beatchOperate(operate, node, param) {
			let event = this.createEvent(`action.node.${operate}`);
      return this.$http.post(`json/nodes/${node}/${operate}`, param, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=utf8'
				}
			}).then(async (res) => {
				 this.incEventSuccess(event);
				if(res.data) {
         	let task = parse_task_upid(res.data);
					await this.queryLog(task.node,res.data);
					await this.queryStatus(task.node,res.data);
				}
			}).catch(res => {
				this.incEventFail(event);
				return Promise.reject(event);
			})
		},
		//查询资源
		queryResource() {
			return this.$http.get(`json/cluster/resources`)
			           .then(res => {
									 if(res.data) {
										 return Promise.resolve(res.data);
									 }
								 })
		},
		//查询批量操作日志
		queryLog(node, pid) {
			return this.$http.get(`json/nodes/${node}/tasks/${pid}/log`, {
				_dc: new Date().getTime(),
				start: 0,
				limit: 500
			}).then((res) => {
				if(res.status !== 'running' && this.interVal) {
					clearInterval(this.interVal);
					this.interVal = null;
				}
				this.updateTable({
					tableName: 'addClusterLogList',
					list: res.data
				})
			})	
		},
		//查询批量操作状态
		queryStatus(node, pid) {
			return this.$http.get(`json/nodes/${node}/tasks/${pid}/status`, {
				_dc: new Date().getTime(),
			}).then((res) => {
				if(res.status !== 'running' && this.interVal) {
					clearInterval(this.interVal);
					this.interVal = null;
				}
				this.updateDbObject({
					name: 'addClusterStatusObj',
					data: res.data
				})
			})	
		},
		//停止当前任务
		stopTask(node, pid) {
			return this.$http.del(`json/nodes/${node}/tasks/${pid}`)
		},
		//查询节点
		queryNodeList() {
			return this.$http.get(`json/nodes`)
			           .then(res => {
									 if(res.data) {
										 this.updateTable({
											 tableName: 'nodeList',
											 list: res.data
										 })
									 }
								 })
		}
	}
}
</script>