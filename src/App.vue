<template lang="pug">
#hdr(style="border:1px solid black;margin:10px;")
  label(for="srch") Search:
  input(v-model="searchStr" name="srch")
</template>

<script>
import * as emby from "./emby.js"

export default {
  name: 'App',
  data() { return {
      searchStr: '',
  }}
}
emby.init();

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;}
</style>
