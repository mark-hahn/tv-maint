<template lang="pug">
div
  #hdr(style="border:1px solid black;margin:10px;")
    label(for="srch") Search:
    input(v-model="searchStr" name="srch" @change="search")
  table(style="margin:10px")
    tr(v-for="show in shows")
      td {{show.Name}}
</template>

<script>
import * as emby from "./emby.js"

export default {
  name: 'App',

  data() { return {
    shows: [],
    searchStr: '',
  }},

  methods: {
    search () { (async () => {
      const str = this.searchStr.toLowerCase();
      this.shows = (await emby.getShows()).shows
        .filter( show => show.Name.toLowerCase().includes(str));
    })()},
  },

  mounted() { (async() => {
      await emby.init();
      this.shows = (await emby.getShows()).shows;
      // console.log(this.shows);
  })();
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;}
</style>
