<template lang="pug">
div
  #hdr(style="border:1px solid black; background-color:#ccc; position:fixed; left:0; top:0;")
    div(style="margin:3px 10px;")
      div(style="display:inline-block;margin-right:10px; font-size:14px; font-weight:bold; color:blue") 
       | TV Series
      input(v-model="searchStr" @input="select"
            style="border:1px solid black; width:80px;")
      button(@click="select") search
      //- select(v-model="filterStr" @change="select" 
      //-        style="margin-left:10px")
      //-   option(value="No Filter") No Filter
      //-   option Favorites
      //-   option Not Favorites
      //-   option Pickups
      //-   option Not Pickups
      //-   option Pickups/No Emby
      button(@click="showAll" style="margin-left:10px") 
        | Show All

  div(style="margin-top:40px")
    table(style="margin:10px; width:95%; font-size:14px")
      tr(v-for="show in shows" key="show.Id")
        td(@click="showInEmby(show.Id)" style="padding:4px;") {{ show.Name }}
        td(style="width:30px; text-align:center;" @click="toggleFav(show)")
          font-awesome-icon(:icon="['far', 'laugh-beam']"
            v-bind:style="(comedy(show) ? {color:'teal'} : {color:'#ddd'  })")
        td(style="width:30px; text-align:center;" @click="toggleFav(show)")
          font-awesome-icon(:icon="['far', 'sad-cry']"
            v-bind:style="(drama(show) ? {color:'blue'} : {color:'#ddd'  })")
        td(style="width:30px; text-align:center;" @click="toggleFav(show)")
          font-awesome-icon(:icon="['far', 'clock']"
            v-bind:style="(hour(show) ? {color:'purple'} : {color:'#ddd'  })")
        td(style="width:30px; text-align:center;" @click="toggleFav(show)")
          font-awesome-icon(:icon="['fas', 'check']"
            v-bind:style="(played(show) ? {color:'lime'} : {color:'#ddd'  })")
        td(style="width:30px; text-align:center;" @click="toggleFav(show)")
          font-awesome-icon(:icon="['fas', 'plus']"
            v-bind:style="(show.UnplayedItemCount>0 ? {color:'#0cf'} : {color:'#ddd'  })")
        td(style="width:30px; text-align:center;" @click="toggleFav(show)")
          font-awesome-icon(:icon="['far', 'heart']"
            v-bind:style="(show.IsFavorite>0 ? {color:'red'} : {color:'#ddd'  })")
        td(style="width:30px; text-align:center;" @click="togglePickUp(show)")
          font-awesome-icon(icon="arrow-down"
            v-bind:style="(show.Pickup ? {color:'#5ff'} : {color:'#ddd'  })")
        td(style="width:30px; text-align:center;" @click="togglePickUp(show)")
          font-awesome-icon(icon="tv"
            v-bind:style="(database(show) ? {color:'#a66'} : {color:'#ddd'  })")
</template>

<script>

import * as emby from "./emby.js";

import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {library}         from "@fortawesome/fontawesome-svg-core";
import {faLaughBeam, faSadCry, faClock, faHeart}  
                         from "@fortawesome/free-regular-svg-icons";
import {faCheck, faPlus, faArrowDown, faTv} 
                         from "@fortawesome/free-solid-svg-icons";
library.add([faLaughBeam, faSadCry, faClock, faHeart, 
             faCheck, faPlus, faArrowDown, faTv]);

let allShows = [];

const getEmbyUrl = (id) =>
  `http://hahnca.com:8096/web/index.html
   #!/item?id=${id}&serverId=ae3349983dbe45d9aa1d317a7753483e`.replace(/\s*/g, "");

export default {
  name: "App",

  data() {
    return {
      shows: [],
      searchStr: "",
    };
  },

  components: {
    FontAwesomeIcon,
  },

  methods: {
    comedy  (show) {return( show.Genres?.includes('Comedy'))},
    drama   (show) {return( show.Genres?.includes('Drama'))},
    hour    (show) {return(  // > 35 mins is an hour
             show.RunTimeTicks > (15000000000/21) * 35)},
    played  (show) {return(!show.Played && this.database(show))},
    database(show) {return(!show.Id.startsWith('nodb-'))},
    select() {
      (async () => {
        const srchStr = this.searchStr.toLowerCase();
        // const fltrStr = this.filterStr;
        // this.shows = allShows.filter(
        //   (show) =>
        //     (srchStr == "" || show.Name.toLowerCase().includes(srchStr)) &&
        //     (show.IsFavorite || fltrStr != "Favorites") &&
        //     (!show.IsFavorite || fltrStr != "Not Favorites") &&
        //     (show.Pickup || fltrStr != "Pickups") &&
        //     (!show.Pickup || fltrStr != "Not Pickups") &&
        //     (show.Id.startsWith("nodb-") || fltrStr != "Pickups/No Emby")
        // );
      })();
    },

    showAll() {
      (async () => {
        this.searchStr = "";
        // this.filterStr = "No Filter";
        this.shows = allShows;
      })();
    },

    showInEmby(id) {
      if (!id.startsWith("nodb-")) window.open(getEmbyUrl(id), id);
    },

    toggleFav(show) {
      (async () => {
        show.IsFavorite = await emby.toggleFav(show.Id, show.IsFavorite);
        if (show.Id.startsWith("nodb-")) console.log(show);
      })();
    },

    togglePickUp(show) {
      (async () => {
        show.pickup = await emby.togglePickUp(show.Name, show.pickup);
        // console.log('show.pickup', show.pickup);
      })();
    },
  },

  mounted() {
    (async () => {
      await emby.init();
      allShows = await emby.loadAllShows(0, 5);
      this.shows = allShows;
      // console.log(allShows[0]);
    })();
  },
};
</script>

<style>
tr {
  outline: thin solid;
}
tr:nth-child(even) {
  background-color: #f4f4f4;
}
td {
  outline: thin solid;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

/*
  comedy             laugh-beam              teal
  drama              sad-cry                 blue
  RunTimeTicks       clock                   purple
  Played             check                   lime
  UnplayedItemCount  plus                    aqua
  IsFavorite         heart                   red
  PickUp             arrow-down              green
  !nodb-             database                maroon
*/

