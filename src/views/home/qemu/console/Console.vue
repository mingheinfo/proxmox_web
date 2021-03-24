<template>
  <div ref="m-shell">
    	<iframe ref ="shell" :src="src" width="100%" height="100%"></iframe>
	</div>
</template>

<script>
  export default {
		name: 'Console',
		data() {
    return {
      node: {},
      src: ''
    };
  },
  mounted() {
    let _this = this,
      last = window.localStorage.getItem("lastsel") || "[]";
       _this.node = (JSON.parse(last) && JSON.parse(last)) || "";
       _this.src = `/shell/?console=${_this.node.type === 'qemu' ? 'kvm' : 'lxc'}&vmid=${_this.node.vmid}&node=${_this.node.node}&resize=scale&novnc=1`
			 _this.$refs.shell.style.height = _this.$refs['m-shell'].parentNode.clientHeight + 'px';
		 	 window.addEventListener('resize', _this.setShellHeight, false)
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