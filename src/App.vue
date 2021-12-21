<template lang="pug">
div
  #hdr(style="border:1px solid black;")
    div(style="margin:5px 10px;")
      input(v-model="searchStr" @change="search"
            style="border:1px solid black;")
      button(@click="search") search
      button(@click="clrSrch" style="margin-left:10px") 
        | Show All
  table(style="margin:10px; width:100%")
    tr(v-for="show in shows")
      td {{show.Name.substring(0,20)}}
      td(style="width:16px;")
        font-awesome-icon(v-if="show.IsFavorite" 
                          style="color:#f88" icon="heart")

</template>

<script>
import * as emby from "./emby.js"

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHeart, faCoffee } from '@fortawesome/free-solid-svg-icons'
library.add(faHeart);

export default {
  name: 'App',

  data() { return {
    shows: [],
    searchStr: 'great',
  }},

  components: {
    FontAwesomeIcon
  },

  methods: {
    search () {(async () => {
      const str = this.searchStr.toLowerCase();
      const shows = (await emby.getShows()).shows
        .filter(show => show.Name.toLowerCase().includes(str));
      console.log(shows);
      this.shows = shows;
    })()},

    clrSrch () {(async () => {
      this.searchStr = "";
      this.shows = (await emby.getShows()).shows;
    })()},
  },

  mounted() { (async() => {
    await emby.init();
    this.shows = (await emby.getShows(0,5)).shows;
  })();
  },
}
</script>

<style>
  tr {outline: thin solid;}
  tr:nth-child(even) {background-color: #f0f0f0;}
  td {outline: thin solid;}
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;}
  span {font-size: 48px; color: Dodgerblue}

</style>
