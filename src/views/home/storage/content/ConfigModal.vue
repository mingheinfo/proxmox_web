<template>
  <m-dialog :visible="visible"
	          title="配置"
	          @close="$emit('close')">
		<template slot="header"></template>
		<template slot="content">
		  <div  class="config">
					{{configStr.trim()}}
			</div>
		</template>
		<template slot="footer"><span></span></template>
	</m-dialog>
</template>

<script>
import StorageConfigHttp from "@src/views/home/storage/content/http";
export default {
	name: 'ConfigModal',
	mixins: [StorageConfigHttp],
	props: {
		visible: {
			type: Boolean,
			default: false,
		},
		param: {
			type:Object,
			default: () => {
				return {}
			}
		}
	},
	data() {
		return {
			configStr: ''
		}
	},
	mounted() {
		this.__init__();
	},
	methods: {
    __init__() {
			let param = {
				_dc: new Date().getTime(),
				volume: this.param && this.param.volid
			}
			this.queryConfigByVolid(param)
		}
	}
}
</script>

<style scoped>
  .config{
    white-space: pre-line;
		padding: 0px 10px;
	}
</style>