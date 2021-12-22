<template lang="pug">
div
  #hdr(style="border:1px solid black;")
    div(style="margin:5px 10px;")
      input(v-model="searchStr" @input="srchInput" @change="select"
            style="border:1px solid black; width:50px;")
      button(@click="select") search
      select(v-model="filterStr" @change="select" 
             style="margin-left:10px")
        option(value="No Filter") No Filter
        option Favorites
        option Not Favorites
      button(@click="showAll" style="margin-left:10px") 
        | Show All
  table(style="margin:10px; width:95%")
    tr(v-for="show in shows")
      td(@click="showInEmby(show.Id)") {{show.Name.substring(0,20)}}
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

let srchTimeout = null;

export default {
  name: 'App',

  data() { return {
    shows: [],
    searchStr: 'great',
    filterStr: 'No Filter',
  }},

  components: {
    FontAwesomeIcon
  },

  methods: {
    chkSrchTimeout () {
      if(srchTimeout) {
        clearTimeout(srchTimeout);
        srchTimeout = null;
      }
    },

    srchInput () {
      this.chkSrchTimeout();
      srchTimeout = setTimeout(()=> {
        this.select();
      }, 300);
    },

    select () {(async () => {
      this.chkSrchTimeout();
      const srchStr = this.searchStr.toLowerCase();
      const fltrStr = this.filterStr;
      const shows = (await emby.getShows()).shows
        .filter( show =>
           (srchStr == '' || show.Name.toLowerCase().includes(srchStr)) && 
           ( show.IsFavorite || fltrStr != "Favorites")                 &&
           (!show.IsFavorite || fltrStr != "Not Favorites")     
        );
      this.shows = shows;
    })()},

    showAll () {(async () => {
      this.searchStr = "";
      this.filterStr = "No Filter";
      this.shows = (await emby.getShows()).shows;
    })()},

    showInEmby () {(async () => {
      // console.log(inb);
      this.searchStr = "";
      this.filterStr = "No Filter";
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
