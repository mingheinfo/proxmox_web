<script>
import {confirm} from '@libs/utils/index'
export default {
	name: 'CephHttp',
	methods: {
		queryCephStatus(url) {
			return this.$http.get(url)
			           .then(res => {
									 if(res.data) {
                     this.updateDbObject({
											 name: 'cephObj',
											 data: res.data
										 })
									 }
								 }).catch(res => {
								   if(this.interVal)  {
								     clearInterval(this.interVal);
								     this.interVal = null;
                   }
									 if(/(not installed)/.test(res)) {
										  return confirm.call(this, 'Ceph没有在此节点上安装。你想现在安装吗？', 'info', 'icon-warning', '安装ceph-nautilus')
                       .then(res => {
                         return Promise.reject('not installed');
                       });
									 }
                   this.updateDbObject({
                     name: 'cephObj',
                     data: {}
                   })
								 })
		},
		queryNetWork() {
			return this.$http.get(`json/nodes/localhost/network`)
			           .then(res => {
									 if(res.data) {
										 this.updateTable({
											 tableName: 'networkList',
											 list: res.data
										 })
									 }
								 })
		},
		queryNodeList() {
      return this.$http.get("/json/nodes").then((res) => {
        if (res.data) {
          this.updateTable({
						tableName: 'nodeList',
						list: res.data
					})
        }
      });
		},
		configCeph(nodename, param) {
			return this.$http.post(`json/nodes/${nodename}/ceph/init`, param, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=utf8'
				}
			}).then(res => {

			})
		},
		configMonNode(nodename) {
			return this.$http.post(`json/nodes/${nodename}/ceph/mon/${nodename}`, {}, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=utf8'
				}
			}).then((res) => {
				if(res.data){
          this.interVal = setInterval(() => this.queryStatus(nodename, res.data), 3000);
				}
			})
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
		queryCephMetaData() {
			return this.$http.get(`json/cluster/ceph/metadata`)
			           .then(res => {
									 if(res.data) {
										 this.updateDbObject({
											 name: 'cephMetaDataObj',
											 data: res.data
										 })
									 }
								 })
		}
	}
}
</script>
