<script>
export default {
	name: 'QemuOptionsHttp',
	data() {
    return {
      node: "",
    };
	},
	
  mounted() {
		//获得当前节点对象
    let last = window.localStorage.getItem("lastsel") || "[]";
    this.node = (JSON.parse(last) && JSON.parse(last)) || "";
	},
	methods: {
		//查询虚拟机配置
		queryVmConfig(param) {
			debugger;
			let _this = this;
			return _this.$http.get(`json/nodes/${_this.node.node}/${_this.node.id}/config`, param)
			            .then(res => {
                     if(res.data) {
											 return _this.updateDbObject({
												 name: 'qemuObj',
												 data: res.data
											 })
										 }
									})
		},
		queryVmStateStorage(param) {
			return this.$http.get(`json/nodes/${this.node.node}/storage`, param)
			           .then(res => {
									 if(res.data) {
										 return Promise.resolve(res.data);
									 }
								 })
		},
		updateOptions(param) {
			let event = this.createEvent("action.qemu.options.update");
      return this.$http
        .put(`json/nodes/${this.node.node}/${this.node.id}/config`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then((res) => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
					this.incEventFail(event);
					return Promise.reject(res);
        });
		}
	}
}
</script>