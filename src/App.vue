<template lang="pug">
div
  #hdr(style="border:1px solid black;")
    div(style="margin:5px 10px;")
      input(v-model="searchStr" @input="select"
            style="border:1px solid black; width:50px;")
      button(@click="select") search
      select(v-model="filterStr" @change="select" 
             style="margin-left:10px")
        option(value="No Filter") No Filter
        option Favorites
        option Not Favorites
        option Pickups
        option Not Pickups
        option Pickups/No Emby
      button(@click="showAll" style="margin-left:10px") 
        | Show All

  table(style="margin:10px; width:95%")
    tr(v-for="show in shows" key="show.Id")
      td(@click="showInEmby(show.Id)") 
        span(style="") {{ show.Name.substring(0,100) }}
        span(style="color:gray;") {{'&nbsp &nbsp (' + show.Genres?.join(', ') + ')' }}
      td(style="width:50px; text-align:right") 
             | {{show.UnplayedItemCount? show.UnplayedItemCount+' u&nbsp' : ''}}
      td(style="width:30px; text-align:center;" @click="toggleFav(show)")
        font-awesome-icon(icon="heart"
            :class="{clsRed: show.IsFavorite, clsDim: !show.IsFavorite}")
      td(style="width:30px; text-align:center;" @click="togglePickUp(show)")
        font-awesome-icon(icon="arrow-down"
            :class="{clsGrn: show.Pickup, clsDim: !show.Pickup}")

</template>

<script>
/*
  PlayCount: 0
  PlaybackPositionTicks: 0
  Played: false
  PlayedPercentage: 5
  UnplayedItemCount: 19
*/

import * as emby from "./emby.js";

import { FontAwesomeIcon }      from "@fortawesome/vue-fontawesome";
import { library }              from "@fortawesome/fontawesome-svg-core";
import { faHeart, faArrowDown } from "@fortawesome/free-solid-svg-icons";
library.add(faHeart);
library.add(faArrowDown);

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
      filterStr: "No Filter",
    };
  },

  components: {
    FontAwesomeIcon,
  },

  methods: {
    select() {
      (async () => {
        const srchStr = this.searchStr.toLowerCase();
        const fltrStr = this.filterStr;
        this.shows = allShows.filter(
          (show) =>
            (srchStr == "" || show.Name.toLowerCase().includes(srchStr)) &&
            (show.IsFavorite || fltrStr != "Favorites") &&
            (!show.IsFavorite || fltrStr != "Not Favorites") &&
            (show.Pickup || fltrStr != "Pickups") &&
            (!show.Pickup || fltrStr != "Not Pickups") &&
            (show.Id.startsWith("pkup-") || fltrStr != "Pickups/No Emby")
        );
      })();
    },

    showAll() {
      (async () => {
        this.searchStr = "";
        this.filterStr = "No Filter";
        this.shows = allShows;
      })();
    },

    showInEmby(id) {
      if (!id.startsWith("pkup-")) window.open(getEmbyUrl(id), id);
    },

    toggleFav(show) {
      (async () => {
        show.IsFavorite = await emby.toggleFav(show.Id, show.IsFavorite);
        if (show.Id.startsWith("pkup-")) console.log(show);
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
.clsGrn {
  color: #2f2;
}
.clsRed {
  color: #f66;
}
.clsDim {
  color: #ddd;
}
</style>
