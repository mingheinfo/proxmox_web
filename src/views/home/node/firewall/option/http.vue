<script>
import { deepCopy} from '@libs/utils/index';
export default {
	name: 'NodeFireWallHttp',
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
		queryNodeFireWallOption(param) {
			return this.$http.get(`json/nodes/${this.node}/firewall/options`, param)
			           .then(res => {
									 if(res.data) {
										 this.updateDbObject({
											 name: 'nodeFireWallOptionObj',
											 data: res.data
										 })
									 }
								 })
		},
		 //编辑Option
    modifyOptions(param) {
      let event = this.createEvent("action.firewall.update");
      return this.$http
        .put(`json/nodes/${this.node}/firewall/options`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then(() => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
	}
}
</script>