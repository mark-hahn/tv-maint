<template lang="pug">
div
  #hdr(style="width:100%; background-color:#ccc; ")
    div(style="margin:3px 10px; display:inline-block;width:100%")
      #lbl TV Series
      input(v-model="searchStr" @input="select"
            style="border:1px solid black; width:100px;")
      button(@click="select")
        font-awesome-icon(icon="search")
      input(v-model="pkupEditName" 
            style="border:1px solid black; margin-left:20px; width:100px;"
             @change="addPickUp")
      button(@click="addPickUp") +
      button(@click="showAll" style="margin-left:20px") 
        | Show All
    div(style="width:100%;")
      table(style="background-color:white; padding:0 14px; width:100%;")
        tr  
          button(@click="sortClick") 
            | Sort
          td(style="padding:0 4px;text-align:right;") Filters:
          td( v-for="cond in conds"
              :style="{width:'30px',textAlign:'center'}"
              @click="condFltrClick(cond)" )
            font-awesome-icon(:icon="cond.icon"
              :style="{color:condFltrColor(cond)}")
  div(style="margin-top:85px; width:100%;")
    table(style="padding:0 5px; width:100%; font-size:14px")
      tr.show-row(v-for="show in shows"  key="show.Id"
                    :id="nameHash(show.Name)")
        td(style="width:30px; text-align:center;"
           @click="copyNameToClipboard(show)" )
          font-awesome-icon(icon="copy" style="color:#ccc")
        td(v-if="sortByDate" style="width:50px") {{show.date}}
        td( :style="{padding:'4px', backgroundColor: highlightName == show.Name ? 'yellow' : 'white'}"
           @click="showInExternal(show, $event)") {{show.Name}}
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
import { faLaughBeam, faSadCry, faClock, faHeart} 
         from "@fortawesome/free-regular-svg-icons";
import { faCheck, faPlus, faArrowDown, faTv, 
         faSearch, faQuestion, faCopy} 
         from "@fortawesome/free-solid-svg-icons";
library.add([ faLaughBeam, faSadCry, faClock, faHeart,
              faCheck, faPlus, faArrowDown, faTv, faSearch, faQuestion, faCopy]);

let allShows = [];
let dates    = null;

export default {
  name: "App",
  components: { FontAwesomeIcon },
  data() {
    const toggleFavorite = async (show) => {
      this.saveVisShow(show.Name);
      show.IsFavorite = await emby.toggleFav(show.Id, show.IsFavorite);
      // if (show.Id.startsWith("nodb-")) console.log(show);
    };

    const togglePickup = async (show) => {
      this.saveVisShow(show.Name);
      show.Pickup = await emby.togglePickUp(show.Name, show.Pickup);
      if (!show.Pickup && show.Id.startsWith("nodb-")) {
        console.log("toggled pickUp, removing row");
        const id = show.Id;
        allShows = allShows.filter((show) => show.Id != id);
        this.shows = allShows;
      }
    };

    const toggleToTry = async (show) => {
      this.saveVisShow(show.Name);
      show.InToTry = 
        await emby.toggleToTry(show.Id, show.InToTry);
    };

    const deleteShowFromEmby = async (show) => {
      this.saveVisShow(show.Name);
      console.log("delete Show From Emby:", show.Name);
      if(!window.confirm(
          `Do you really want to delete series ${show.Name} from Emby?`))
        return;
      const id = show.Id;
      const res = await emby.deleteShowFromEmby(id);
      if (res != "ok") return;
      if (show.Pickup) {
        delete show.Genres;
        show.RunTimeTicks = 0;
        show.UnplayedItemCount = 0;
        show.IsFavorite = false;
        show.Id = "nodb-" + Math.random();
        console.log("deleted db, keeping row");
      } else {
        console.log("deleted db, removing row");
        allShows = allShows.filter((show) => show.Id != id);
        this.shows = allShows;
        this.scrollSavedVisShowIntoView();
      }
    };

    return {
      shows: [],
      searchStr: "",
      pkupEditName: "",
      sortByDate: false,
      highlightName: "",

      conds: [
        { color: "teal", filter: 0,
          icon: ["far", "laugh-beam"],
          cond(show)  { return show.Genres?.includes("Comedy"); },
          click(show) {},
        },
        { color: "blue", filter: 0,
          icon: ["far", "sad-cry"],
          cond(show) { return show.Genres?.includes("Drama"); },
          click(show) {},
        },
        // { color: "purple", filter: 0,
        //   icon: ["far", "clock"],
        //   cond(show) { 
        //       return show.RunTimeTicks > (15e9 / 21) * 35; },
        //   click(show) {},
        // },
        { color: "#0cf", filter: 0,
          icon: ["fas", "plus"],
          cond(show)  { return show.UnplayedItemCount > 0; },
          click(show) {},
        },
        { color: "lime", filter: 0,
          icon: ["fas", "question"],
          cond(show)  { return show.InToTry },
          click(show) { toggleToTry(show) },
        },
        { color: "red", filter: 0,
          icon: ["far", "heart"],
          cond(show)  { return show.IsFavorite },
          click(show) { toggleFavorite(show); },
        },
        { color: "#5ff", filter: 0,
          icon: ["fas", "arrow-down"],
          cond(show)  { return show.Pickup; },
          click(show) { togglePickup(show); },
        },
        { color: "#a66", filter: 0,
          icon: ["fas", "tv"],
          cond(show)  { return !show.Id.startsWith("nodb-"); },
          click(show) { deleteShowFromEmby(show); },
        },
      ],
    };
  },

  /////////////  METHODS  ////////////
  methods: {
    nameHash (name) {
      return 'name-' + name
        .toLowerCase()
        .replace(/^the\s/, '')
        .replace(/[^a-zA-Z0-9]*/g, '');
    },

    saveVisShow (name) {
      const hash = this.nameHash(name);
      console.log(`saving ${hash} as last visible show`);
      this.highlightName = name;
      window.localStorage.setItem('lastVisShow', name);
    },

    async sortClick () {
      if(!dates) {
        dates = (await emby.loadDates());
          console.log(dates);
        for(let show of allShows) {
          show.date = dates[this.nameHash(show.Name)];
          if(!show.date) show.date = '01/01/01';
          // console.log(show.date);
        }
      }
      this.sortByDate = !this.sortByDate;
      this.sortShows();
      this.showAll();
    },

    scrollSavedVisShowIntoView () {
      this.$nextTick(() => {
        const name = window.localStorage.getItem('lastVisShow');
        const id = this.nameHash(name);
        this.highlightName = name;
        console.log(`srolling ${id} into view`);
        const ele = document.getElementById(id);
        if(ele) {
          ele.scrollIntoView(true);
          const hdrEle = document.getElementById('hdr');
          window.scrollBy(0,-80);
        }
        else {
          console.log(`show ${id} not in show list, finding nearest match`);
          for(let show of this.shows) {
            const hash = this.nameHash(show.Name);
            if(hash > id) {
              const ele = document.getElementById(hash);
              if(ele) {
                ele.scrollIntoView(true);
                window.scrollBy(0,-160);
                this.saveVisShow(show.Name);
              }
              break;
            }
          }
        }
      });
    },

    copyNameToClipboard (show) {
      const hash = this.nameHash(show.Name);
      const ele = document.getElementById(hash);
      const text = ele.innerText.trim();
      console.log(`copying ${text} to clipboard`);
      navigator.clipboard.writeText(text)
      this.saveVisShow(show.Name);
    },

    condFltrClick(cond) {
      if (++cond.filter == 2) cond.filter = -1;
      this.select();
    },

    condFltrColor(cond) {
      switch (cond.filter) {
        case  0: return "gray";
        case -1: return "#ddd";
        case +1: return cond.color;
      }
    },

    sortShows() {
      allShows.sort((a, b) => {
        if (this.sortByDate)
          return a.date > b.date ? -1 : +1;
        else {
          const aname = a.Name.replace(/The\s/i, "");
          const bname = b.Name.replace(/The\s/i, "");
          return aname.toLowerCase() > bname.toLowerCase() 
                  ? +1 : -1;
        }
      });
    },

    addPickUp() {
      const name = this.pkupEditName;
      if (allShows.some((show) => show.Name == name)) {
        console.log("skipping duplicate show name", name);
        return;
      }
      if (name && emby.addPickUp(name)) {
        allShows.push({
          Name: name,
          Pickup: true,
          Id: "nodb-" + Math.random(),
        });
        this.highlightName = name;
        this.sortShows();
        this.saveVisShow(name);
        this.scrollSavedVisShowIntoView();
        console.log("added pickup", name);
      }
      this.pkupEditName = "";
    },

    condColor(show, cond) {
      if (cond.cond(show)) return cond.color;
      return "#ddd";
    },

    select() {
      const srchStrLc = this.searchStr == "" ? null : this.searchStr.toLowerCase();
      this.shows = allShows.filter((show) => {
        if (srchStrLc && !show.Name.toLowerCase().includes(srchStrLc)) return false;
        for (let cond of this.conds) {
          if (cond.filter == 0) continue;
          if ((cond.filter == +1) != cond.cond(show)) return false;
        }
        return true;
      });
      this.scrollSavedVisShowIntoView();
    },

    /////////////////  UPDATE METHODS  /////////////////
    showAll() {
      this.searchStr = "";
      for (let cond of this.conds) cond.filter == 0;
      this.shows = allShows;
      const name = allShows[0].Name;
      this.saveVisShow(name);
      this.highlightName = name;
      this.scrollSavedVisShowIntoView();
    },

    showInExternal(show, event) {
      console.log('showInExternal', show.ExternalUrls, event);
      this.saveVisShow(show.Name);
      if(!show.Id.startsWith('nodb-')) {
        if(event.altKey || event.ctrlKey) {
          const urls = show.ExternalUrls;
          if(urls) {
            const wiki = event.altKey;
            let url = urls.find((url) => 
              url.Name == (wiki ? 'Wikipedia' : 'IMDb' ));
            if(!url) url = urls[0];
            if(url) window.open(url.Url, 'extWebPage');
          }
        }
        else
          window.open(emby.embyPageUrl(show.Id), 'extWebPage');
      }
    }
  },


  /////////////////  MOUNTED  /////////////////
  mounted() {
    (async () => {
      await emby.init();
      allShows = await emby.loadAllShows();
      this.shows = allShows;
      const lastVisShow = 
        this.nameHash(window.localStorage.getItem('lastVisShow'));
      if(!lastVisShow) {
        const name = allShows[0].Name;
        this.highlightName = name;
        this.saveVisShow(name);
      }
      else 
        this.scrollSavedVisShowIntoView();
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
#hdr {
  border: 1px solid black;
  position: fixed;
  left: 0;
  top: 0;
}

#lbl {
  display: inline-block;
  margin-right: 10px;
  font-size: 14px;
  margin-right: 20px;
  font-weight: bold;
  color: blue;
}
</style>
