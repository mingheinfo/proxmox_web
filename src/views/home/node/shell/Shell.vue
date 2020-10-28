<template>
  <div class="m-shell">
    <iframe src="/shell/?console=shell&node=test&resize=scale&xtermjs=2" width="100%" height="100%">

    </iframe>
  </div>
</template>

<script>
  export default {
    name: "Shell"
  }
</script>

<style scoped>
  .m-shell{
    width: 100%;
    height: 100%;
  }
</style>
