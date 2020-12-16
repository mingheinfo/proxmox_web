<template>
   <div class="app">
     <router-view/>
   </div>
</template>

<script>
  export default {
    name: "App",
    methods: {
      confirm() {
        alert('ok!');
      }
    }
  }
</script>

<style scoped>

</style>
