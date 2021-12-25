<template lang="pug">
div
  #hdr(style="width:100%; background-color:#ccc; ")
    div(style="margin:3px 10px; display:inline-block;width:100%")
      #lbl TV Series
      input(v-model="searchStr" @input="select"
            style="border:1px solid black; width:80px;")
      button(@click="select") search
      button(@click="showAll" style="margin-left:20px") 
        | Show All
    div(style="width:100%;")
      table(style="background-color:white; padding:0 14px; width:100%;")
        tr
          td(style="padding:0 4px;text-align:right;") Filters:
          td( v-for="cond in conds"
              :style="{width:'30px',textAlign:'center'}"
              @click="condFltrClick(cond)" )
            font-awesome-icon(:icon="cond.icon"
              :style="{color:condFltrColor(cond)}")
  div(style="margin-top:55px; width:100%;")
    table(style="padding:0 5px; width:100%; font-size:14px")
      tr.show-row(v-for="show in shows" key="show.Id")
        td(@click="showInEmby(show.Id)" 
            style="padding:4px;") {{ show.Name }}
        td( v-for="cond in conds" 
            style="width:30px; text-align:center;"
           @click="cond.click(show)" )
          font-awesome-icon(:icon="cond.icon"
              :style="{color:condColor(show,cond)}")
</template>

<script>
import * as emby from "./emby.js";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faLaughBeam, faSadCry, faClock, faHeart, } 
          from "@fortawesome/free-regular-svg-icons";
import { faCheck, faPlus, faArrowDown, faTv } 
          from "@fortawesome/free-solid-svg-icons";
library.add([ faLaughBeam, faSadCry, faClock, faHeart, 
              faCheck, faPlus, faArrowDown, faTv, ]);

let allShows = [];

export default {
  name: "App",
  components: { FontAwesomeIcon, },
  data() { return {
    shows: [],
    searchStr: "",
    conds: {
      Comedy: {
        color:'teal', filter:0, icon:['far','laugh-beam'],  
        cond(show){return show.Genres?.includes("Comedy")},   
        click(show) { },
      },
      Drama: {
        color:'blue', filter:0, icon:['far','sad-cry'], 
        cond(show){return show.Genres?.includes("Drama")},   
        click(show) { },
      },
      Hour: {
        color:'purple', filter:0, icon:['far','clock'], 
        cond(show){ return show.RunTimeTicks>(15e9/21)*35 },  
        click(show) { },
      },
      // Played: {
      //   color:'lime', filter:0, icon:['fas','check'], 
      //   cond(show){ return !show.Played },  
      //   click(show) { },
      // },
      Unplayed: {
        color:'#0cf', filter:0, icon:['fas','plus'], 
        cond(show){ return show.UnplayedItemCount > 0 },  
        click(show) { },
      },
      Favorite: {
        color:'red', filter:0, icon:['far','heart'], 
        cond(show){ return show.IsFavorite },   
        click(show) { this.toggleFavorite(show) },
      },
      Pickup: {
        color:'#5ff', filter:0, icon:['fas','arrow-down'], 
        cond(show){ return show.Pickup },   
        click(show) { this.togglePickup(show) },
      },
      Database: {
        color:'#a66', filter:0, icon:['fas','tv'], 
        cond(show){ return !show.Id.startsWith("nodb-") },  
        click(show) { this.deleteShow(show) },
      }
    }};
  },


  /////////////  METHODS  ////////////
  methods: {
    condFltrClick(cond) {
      cond.filter++;
      if(cond.filter == 2) cond.filter = -1;
      console.log('condFltrClick', cond);
      this.select();
    },

    condFltrColor(cond) {
      switch(cond.filter) {
        case  0: return 'gray';
        case -1: return '#ddd';
        case +1: return  cond.color;
      }
    },

    condColor(show, cond) {
      if(cond.cond(show)) return cond.color;
      return '#ddd';
    },

    select() {
      const srchStrLc = ((this.searchStr == "") ? null :
                          this.searchStr.toLowerCase());
      this.shows = allShows.filter((show) => {
        if(srchStrLc && 
          !show.Name.toLowerCase().includes(srchStrLc)) return false;
        for(let key in this.conds) {
          const cond = this.conds[key];
          if(cond.filter == 0) continue;
          if((cond.filter == +1) != cond.cond(show)) return false;
        }
        return true;
      });
    },

    /////////////////  UPDATE METHODS  /////////////////
    showAll() {
      this.searchStr = "";
      for(let cond of this.conds) cond.filter == 0;
      this.shows = allShows;
    },

    showInEmby(id) {
      if(!id.startsWith("nodb-")) 
        window.open(emby.getEmbyPageUrl(id), id);
    },

    toggleFavorite(show) {
     (async () => {
        show.IsFavorite = 
            await emby.toggleFav(show.Id, show.IsFavorite);
        // if (show.Id.startsWith("nodb-")) console.log(show);
      })();
    },

    togglePickup(show) {
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
.show-row {
  outline: thin solid;
}
tr:nth-child(even) {
  background-color: #f4f4f4;
}
.show-td {
  outline: thin solid;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#hdr { border:1px solid black;
       position:fixed; left:0; top:0;
}

#lbl {display:inline-block; margin-right:10px; 
      font-size:14px; margin-right:20px; font-weight:bold; color:blue
}
</style>
