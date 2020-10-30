<script>
import { deepCopy } from '@libs/utils/index'
export default {
	name: 'FireWallHttp',
	methods: {
		queryFireWallList() {
			return this.$http.get('json/cluster/firewall/rules')
			           .then((res) => {
                    if(res.data) {
											this.updateTable({
												tableName: 'fireWallRuleList',
												list: res.data
											})
										}
								 })
		},
		handleEnable(param) {
			let event = this.createEvent(`action.firewall.${param.enable === 0 ? 'enable' : 'stop'}`),
			params = deepCopy(param);
			delete params.pos;
			debugger;
			params.enable = params.enable === 0 ? 1 : 0;
			return this.$http.put(`json/cluster/firewall/rules/${param.pos}`, params, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=utf8'
				}
			})
			           .then((res) => {
											this.queryFireWallList();
											this.incEventSuccess(event);
								 })
								 .catch((res) => {
										 this.incEventFail(event);
										 return Promise.reject(res);
								 })
		},
		queryMacrosList() {
			return this.$http.get('json/cluster/firewall/macros')
			           .then(res => {
									 if(res.data) {
										 	this.updateTable({
												tableName: 'macrosList',
												list: res.data
											})
									 }
								 })
		},
		queryRefsList() {
				return this.$http.get('json/cluster/firewall/refs')
			           .then(res => {
									 if(res.data) {
										 	this.updateTable({
												tableName: 'fireWallResfList',
												list: res.data
											})
									 }
								 })
		},
		createFireWall(param) {
				let event = this.createEvent(`action.firewall.create`);
				return this.$http.post('json/cluster/firewall/rules', param, {
					headers: {
						'content-type': 'application/x-www-form-urlencoded; charset=utf8'
					}
				})
			  .then(res => {
				   this.incEventSuccess(event);				
				})
				.catch(res => {
					this.incEventFail(event);
					return Promise.reject(res);
				})
		},
		 deleteFireWallRule() {
      let event = this.createEvent("action.firewall.delete");
      let tasks = [],
        p;
      this.selectedList.forEach((item) => {
        ((it) => {
          p = this.$http
            .del(`json/cluster/firewall/rules/${it.pos}`)
            .then(() => {
              this.incEventSuccess(event);
              this.queryUsersList({full:1, _dc: new Date().getTime()});
            })
            .catch(() => {
              this.incEventFail(event);
            });
        })(item);
        tasks.push(p);
      });
      return Promise.all(tasks);
    },
	}
}
</script>