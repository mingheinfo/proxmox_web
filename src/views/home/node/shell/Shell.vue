<template>
  <div class="m-shell" ref="m-shell">
    <iframe :src='`/shell/?console=shell&node=${node}&resize=scale&xtermjs=1`' width="100%" ref="shell"></iframe>
  </div>
</template>

<script>
  export default {
    name: "Shell",
    data() {
      return {
        node: ''
      }
    },
    mounted() {
      let last = window.localStorage.getItem("lastsel") || '[]';
      this.node = (JSON.parse(last).node && JSON.parse(last).node) || '';
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

<style scoped>
  .m-shell{
    width: 100%;
    height: 100%;
  }
</style>
