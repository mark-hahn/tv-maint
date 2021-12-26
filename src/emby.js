import axios from "axios"

const markUsrId = "894c752d448f45a3a1260ccaabd0adff";
const authHdr = 'UserId="894c752d448f45a3a1260ccaabd0adff", ' +
                'Client="MyClient", Device="myDevice", '      +
                'DeviceId="123456", Version="1.0.0"';
const fields = ['Name', 'Id', 'IsFavorite', 'Played', 'RunTimeTicks',
                'UnplayedItemCount', "DateCreated", "ExternalUrls",
                "Genres","Overview","Path","People","PremiereDate"];
let token = '';

const getToken = async (name, pwd) => {
  const config = {
    method: 'post',
    url: "http://hahnca.com:8096" +
         "/emby/Users/AuthenticateByName" +
         "?api_key=ba7d62f79cbd4a539b675b05b5663607",
    headers: { Authorization: authHdr },
    data: { Username: name, Pw: pwd },
  };
  const showsRes = await axios(config);
  token = showsRes.data.AccessToken;
}

export async function init() {
  await getToken('MARK', '90-NBVcvbasd');
}

export async function loadAllShows() {
  const showsRes = await axios.get(getShowsUrl());
  const shows = [];
  for(let key in showsRes.data.Items) {
    let item = showsRes.data.Items[key];
    Object.assign(item, item.UserData);
    delete item.UserData;
    for(const k of ['DateCreated', 'PremiereDate'])
      if(item[k]) item[k] = item[k].replace(/T.*/, '');
    shows.push(item);
  }
  // console.log(shows);
  const showNames = shows.map(show => show.Name);
  // console.log(showNames);
  const pickups = (await axios.get(
        'http://hahnca.com/tv/series.json')).data;
  for(let pickup of pickups) {
    // console.log(pickup);
    let gotPickup = false;
    for(let showName of showNames) {
      if(showName == pickup) {
        const show = shows.find(show => show.Name == showName);
        show.Pickup = true;
        gotPickup = true;
      }
    }
    if(!gotPickup) {
      shows.push( {
        Name:  pickup,
        Pickup:true,
        Id:   'nodb-' + Math.random(),
      });
      // console.log('added', shows[shows.length-1]);
    }
  }
  shows.sort((a,b) => {
    const aname = a.Name.replace(/The\s/i, '');
    const bname = b.Name.replace(/The\s/i, '');
    return (aname.toLowerCase() > bname.toLowerCase() ? +1 : -1);
  });
  console.log('all shows loaded');
  // console.log(shows);
  return shows;
}

export async function toggleFav(id, isFav) {
  const config = {
    method: (isFav ? 'delete' : 'post'),
    url:     getFaveUrl(id),
  };
  let favRes;
  try { favRes = await axios(config); }
  catch (e) { return isFav; }
  return (favRes.status == 200 ? favRes.data.IsFavorite : isFav);
}

export async function addPickUp(name) {
  if(name == "") return false;
  const config = {
    method: 'post',
    url: `http://hahnca.com/tv/pickup/` + encodeURI(name),
  };
  let pickUpRes;
  let err = null;
  try { pickUpRes = await axios(config); }
  catch (e) { err = e.message; }
  if(err || pickUpRes?.data !== 'ok') {
    if(!err) err = pickUpRes?.data;
    alert('Error: unable to add pickup to server. ' +
          'Please tell mark.\n\nError: ' + err);
    return false;
  }
  return true;
}

export async function togglePickUp(name, pickup) {
  const config = {
    method: (pickup ? 'delete' : 'post'),
    url:    `http://hahnca.com/tv/pickup/` + encodeURI(name),
  };
  let pickUpRes;
  try { pickUpRes = await axios(config); }
  catch (e) { return pickup; }
  if(pickUpRes.data !== 'ok') {
    alert('Error: unable to save change to server. ' +
          'Please tell mark.\n\nError: ' + pickUpRes.data);
    return pickup;
  }
  else {
    return !pickup;
  }
}

export async function deleteShow(id) {
  const delRes = await axios.delete(getDeleteShowUrl(id));
  console.log({delRes});
  const res = delRes.status;
  console.log('deleteShow', res);
  let err = 'ok';
  if(res != 204) {
    err = 'Error: unable to delete show. ' +
          'Please tell mark.\n\nError: ' + delRes.data;
    alert(err);
  }
  return err;
}


/////////////////////  GET URLS  ///////////////////////
function getShowsUrl (startIdx=0, limit=10000) {
  return `http://hahnca.com:8096 / emby
      / Users / 894c752d448f45a3a1260ccaabd0adff / Items
    ?SortBy=SortName
    &SortOrder=Ascending
    &IncludeItemTypes=Series
    &Recursive=true
    &Fields= Name              %2c Id                %2c
             IsFavorite        %2c Played            %2c 
             UnplayedItemCount %2c DateCreated       %2c 
             ExternalUrls      %2c Genres            %2c 
             Overview          %2c Path              %2c 
             People            %2c PremiereDate
    &StartIndex=${startIdx}
    &ParentId=4514ec850e5ad0c47b58444e17b6346c
    &Limit=${limit}
    &X-Emby-Token=${token}
  `.replace(/\s*/g, "");
}

function getFaveUrl (id) {
  return encodeURI(`http://hahnca.com:8096 / emby
          / Users / 894c752d448f45a3a1260ccaabd0adff 
          / FavoriteItems / ${id}
    ?X-Emby-Client=Emby Web
    &X-Emby-Device-Name=Chrome
    &X-Emby-Device-Id=f4079adb-6e48-4d54-9185-5d92d3b7176b
    &X-Emby-Client-Version=1.0.0
    &X-Emby-Token=${token}
  `.replace(/\s*/g, ""));
}

function getDeleteShowUrl(id) {
  return `http://hahnca.com:8096 / emby / Items / ${id}
    ?X-Emby-Client=EmbyWeb
    &X-Emby-Device-Name=Chrome
    &X-Emby-Device-Id=f4079adb-6e48-4d54-9185-5d92d3b7176b
    &X-Emby-Client-Version=4.6.4.0
    &X-Emby-Token=${token}
  `.replace(/\s*/g, "");
}

export function getEmbyPageUrl(id) {
  return `http://hahnca.com:8096 / web / index.html #! / item
    ?id=${id}&serverId=ae3349983dbe45d9aa1d317a7753483e
    `.replace(/\s*/g, "");
}

/*

AirDays: []
BackdropImageTags: ["dd2d6479fc843d9a6e834d3f3f965ffe"]
CanDelete: true
CanDownload: false
ChildCount: 3
CommunityRating: 7.3
DateCreated: "2019-06-26T01:35:06.0000000+00:00"
DisplayOrder: "Aired"
DisplayPreferencesId: "f63033ff6886ecc7083a696cbeced1b0"
Etag: "9a9388246d4af7828bfbec6e79edb3ed"
ExternalUrls: [{Name: "IMDb", Url: "https://www.imdb.com/title/tt6794990"},…]
GenreItems: [{Name: "Drama", Id: 7765}, {Name: "Crime", Id: 8388}, {Name: "Thriller", Id: 8389},…]
Genres: ["Drama", "Crime", "Thriller", "Mystery"]
Id: "303167"
ImageTags: {Banner: "e9f06826b638082dae77c1d187499040", Primary: "2d368c7e7552efb69c25b57e4149b2ab",…}
IsFolder: true
LocalTrailerCount: 0
LockData: false
LockedFields: []
Name: "Absentia"
OfficialRating: "TV-MA"
Overview: "While hunting one of Boston's most notorious serial killers, an FBI agent disappears without a trace and is declared dead. Six years later, she is found in a cabin in the woods, barely alive and with no memory of the years she was missing. Returning home to learn her husband has remarried and her son is being raised by another woman, she soon finds herself implicated in a new series of murders."
ParentId: "5"
Path: "/mnt/media/tv/Absentia"
People: [{Name: "Stana Katic", Id: "776879", Role: "Emily Byrne", Type: "Actor",…},…]
PlayAccess: "Full"
PremiereDate: "2017-09-25T07:00:00.0000000+00:00"
PresentationUniqueKey: "330500-en-4514ec850e5ad0c47b58444e17b6346c"
PrimaryImageAspectRatio: 0.68
ProductionYear: 2017
ProviderIds: {Tvdb: "330500", Imdb: "tt6794990"}
RecursiveItemCount: 20
RemoteTrailers: []
RunTimeTicks: 27000000512
ServerId: "ae3349983dbe45d9aa1d317a7753483e"
SortName: "Absentia"
Studios: [{Name: "AXN", Id: 776890}]
SupportsSync: true
TagItems: []
Taglines: []
Type: "Series"
UserData: {
  IsFavorite: false
  PlayCount: 0
  PlaybackPositionTicks: 0
  Played: false
  PlayedPercentage: 5
  UnplayedItemCount: 19
}
*/