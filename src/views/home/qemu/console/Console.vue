<template>
  <div ref="m-shell">
    	<iframe ref ="shell" :src="`/shell/?console=kvm&vmid=${node.vmid}&node=${node.node}&resize=off&novnc=1`" width="100%" height="100%"></iframe>
	</div>
</template>

<script>
  export default {
		name: 'Console',
		data() {
    return {
      node: {},
    };
  },
  mounted() {
    let _this = this,
      last = window.localStorage.getItem("lastsel") || "[]";
       _this.node = (JSON.parse(last) && JSON.parse(last)) || "";
			this.$refs.shell.style.height = this.$refs['m-shell'].parentNode.clientHeight + 'px';
			window.addEventListener('resize', this.setShellHeight, false)
	 },
    methods: {
      setShellHeight() {
         this.$refs.shell.style.height = this.$refs['m-shell'].parentNode.clientHeight + 'px';
      }
    },
    beforeDestroy() {
       window.removeEventListener('resize', this.setShellHeight, false)
		}
}
</script>