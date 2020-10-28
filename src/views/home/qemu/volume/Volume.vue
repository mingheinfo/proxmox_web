<template>
  <el-table :data="db.volumeList">
		<el-table-column label="名称" prop="key"></el-table-column>
			<el-table-column label="值" prop="value"></el-table-column>
	</el-table>
</template>

<script>
import VolumeHttp from '@src/views/home/qemu/volume/http';
export default {
	name: "Volume",
	mixins: [VolumeHttp],
  data() {
    return {
			node: {}
		};
  },
  mounted() {
		this.__init__();
	},
  methods: {
    __init__() {
      let last = window.localStorage.getItem("lastsel") || "[]";
			this.node = (JSON.parse(last) && JSON.parse(last)) || "";
			this.queryResource();
    },
  },
};
</script>