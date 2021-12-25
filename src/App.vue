<template lang="pug">
div
  #hdr(style="border:1px solid black; background-color:#ccc; position:fixed; left:0; top:0;")
    div(style="margin:3px 10px; display:inline-block;")
      div(style="display:inline-block;margin-right:10px; font-size:14px; margin-right:20px; font-weight:bold; color:blue") 
       | TV Series
      input(v-model="searchStr" @input="select"
            style="border:1px solid black; width:80px;")
      button(@click="select") search
      button(@click="showAll" style="margin-left:20px") 
        | Show All
    div(style="float:right; margin-right:23px;")
      table(style="background-color:white;")
        tr
          td(style="width:30px; text-align:center;")
            font-awesome-icon(:icon="['far', 'laugh-beam']")
          td(style="width:30px")
          td(style="width:30px")
          td
          td(style="width:30px")
          td(style="width:30px")
          td
          td(style="width:30px")
          td(style="width:30px")
          td(style="width:30px")

  div(style="margin-top:55px")
    table(style="margin:10px; width:95%; font-size:14px")
      tr(v-for="show in shows" key="show.Id")
        td(@click="showInEmby(show.Id)" style="padding:4px;") {{ show.Name }}
        td(style="width:30px; text-align:center;" @click="toggleFav(show)")
          font-awesome-icon(:icon="['far', 'laugh-beam']"
            :style="(comedy(show) ? {color:'teal'} : {color:'#ddd'  })")
        td(style="width:30px; text-align:center;" @click="toggleFav(show)")
          font-awesome-icon(:icon="['far', 'sad-cry']"
            :style="(drama(show) ? {color:'blue'} : {color:'#ddd'  })")
        td(style="width:30px; text-align:center;" @click="toggleFav(show)")
          font-awesome-icon(:icon="['far', 'clock']"
            :style="(hour(show) ? {color:'purple'} : {color:'#ddd'  })")
        td
        td(style="width:30px; text-align:center;" @click="toggleFav(show)")
          font-awesome-icon(:icon="['fas', 'check']"
            :style="(played(show) ? {color:'lime'} : {color:'#ddd'  })")
        td(style="width:30px; text-align:center;" @click="toggleFav(show)")
          font-awesome-icon(:icon="['fas', 'plus']"
            :style="(unplayed(show) ? {color:'#0cf'} : {color:'#ddd'  })")
        td
        td(style="width:30px; text-align:center;" @click="toggleFav(show)")
          font-awesome-icon(:icon="['far', 'heart']"
            :style="(favorite(show) ? {color:'red'} : {color:'#ddd'  })")
        td(style="width:30px; text-align:center;" @click="togglePickUp(show)")
          font-awesome-icon(icon="arrow-down"
            :style="(pickup(show) ? {color:'#5ff'} : {color:'#ddd'  })")
        td(style="width:30px; text-align:center;" @click="deleteShow(show)")
          font-awesome-icon(icon="tv"
            :style="(database(show) ? {color:'#a66'} : {color:'#ddd'  })")
</template>

<script>
import * as emby from "./emby.js";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faLaughBeam,
  faSadCry,
  faClock,
  faHeart,
} from "@fortawesome/free-regular-svg-icons";
import { faCheck, faPlus, faArrowDown, faTv } from "@fortawesome/free-solid-svg-icons";
library.add([
  faLaughBeam,
  faSadCry,
  faClock,
  faHeart,
  faCheck,
  faPlus,
  faArrowDown,
  faTv,
]);

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
      // fltrDrama:   0,
      // fltr:   0,
      // fltr:   0,
      // fltr:   0,
      // fltr:   0,
      // fltr:   0,
      // fltr:   0,
      fltrComedy: 0,
      fltrDatabase: 0,
    };
  },

  components: {
    FontAwesomeIcon,
  },

  /////////////  CONDITIONAL METHODS  ////////////
  methods: {
    comedy(show) {
      return show.Genres?.includes("Comedy");
    },
    drama(show) {
      return show.Genres?.includes("Drama");
    },
    hour(show) {
      return (
        // > 35 mins is an hour
        show.RunTimeTicks > (15000000000 / 21) * 35
      );
    },
    played(show) {
      return !show.Played;
    },
    unplayed(show) {
      return show.UnplayedItemCount > 0;
    },
    favorite(show) {
      return show.IsFavorite;
    },
    pickup(show) {
      return show.Pickup;
    },
    database(show) {
      return !show.Id.startsWith("nodb-");
    },

    /////////////  FILTER  ////////////
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

    /////////////////  UPDATE METHODS  /////////////////
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
        show.Pickup = await emby.togglePickUp(show.Name, show.Pickup);
        if (!show.Pickup && show.Id.startsWith("nodb-")) {
          console.log("toggled pickUp, removing row", show.Pickup, show.Id);
          this.shows = allShows.filter((s) => s.Id != show.Id);
        }
      })();
    },

    // -------- bug:  removes row on show.pickup (wrong)
    //                but doesn't change pickup list

    deleteShow(show) {
      console.log("deleteShow show", show);
      if (!window.confirm(`Do you really want to delete series ${show.Name} from Emby?`))
        return;
      (async () => {
        const id = show.Id;
        const res = await emby.deleteShow(id);
        if (res != "ok") return;
        if (show.Pickup) {
          delete show.Genres;
          show.RunTimeTicks = 0;
          show.Played = true;  // backwards -- TODO fix
          show.UnplayedItemCount = 0;
          show.IsFavorite = false;
          show.Id = "nodb-" + Date.now();
          console.log("deleted db, keeping row");
        } else {
          console.log("deleted db, removing row");
          this.shows = allShows.filter((show) => show.Id != id);
        }
      })();
    },
  },

  /////////////////  MOUNTED  /////////////////
  mounted() {
    (async () => {
      await emby.init();
      allShows = await emby.loadAllShows();
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

/* comedy laugh-beam teal drama sad-cry blue RunTimeTicks clock purple Played check lime
UnplayedItemCount plus aqua IsFavorite heart red PickUp arrow-down green !nodb- database
maroon */
