import axios from "axios"

const u = "https://hahnca.com:8920/emby";
const q = "?api_key=ba7d62f79cbd4a539b675b05b5663607";
const markUsrId = "894c752d448f45a3a1260ccaabd0adff";
const authHdr = 'UserId="894c752d448f45a3a1260ccaabd0adff", ' +
                'Client="MyClient", Device="myDevice", '      +
                'DeviceId="123456", Version="1.0.0"';
const fields = ['Name', 'Id', 'IsFavorite', 'Played', 
                'UnplayedItemCount', "DateCreated", "ExternalUrls",
                "Genres","Overview","Path","People","PremiereDate"];

let token = '';

const pick = (obj, props) => 
  Object.entries(obj).reduce( (r, [k, v]) => {
    if(props.includes(k)) r[k] = v;
    return r;
  },{});

const getToken = async (name, pwd) => {
  const config = {
    method: 'post',
    url: u+"/Users/AuthenticateByName"+q,
    headers: { Authorization: authHdr },
    data: { Username: name, Pw: pwd },
  };
  const showsRes = await axios(config);
  token = showsRes.data.AccessToken;
}

export async function init() {
  await getToken('MARK', '90-NBVcvbasd');
}

export async function getShows(startIdx = 0, limit = 10000) {
  const showsRes = 
        await axios.get(getShowsUrl(startIdx, limit));
  const shows = [];
  for(let key in showsRes.data.Items) {
    const item = showsRes.data.Items[key];
    Object.assign(item, item.UserData);
    delete item.UserData;
    for(const k of ['DateCreated', 'PremiereDate'])
      if(item[k]) item[k] = item[k].replace(/T.*/, '');
    shows.push(pick(item, fields));
  }
  const totRecCount = showsRes.data.TotalRecordCount;
  return {shows, totRecCount};
}

export async function toggleFav(id, isFav) {
  const config = {
    method: (isFav ? 'delete' : 'post'),
    url:     setFaveUrl(id),
  };
  const favRes = await axios(config);
  return (favRes.status == 200 ? favRes.data.IsFavorite : isFav);
}

export async function togglePickUp(id, pickup) {
  const config = {
    method: (pickup ? 'delete' : 'post'),
    url:    `hahnca.com/tv-maint/pickup?id=${id})`
  };
  const pickUpRes = await axios(config);
  console.log(pickUpRes);
  return (pickUpRes.status == 200 ? pickUpRes.data.pickup : pickup);
}

function setFaveUrl (id) {
  return `http://hahnca.com:8096 / emby
          / Users / 894c752d448f45a3a1260ccaabd0adff 
          / FavoriteItems / ${id}
    ?X-Emby-Client=Emby Web
    &X-Emby-Device-Name=Chrome
    &X-Emby-Device-Id=f4079adb-6e48-4d54-9185-5d92d3b7176b
    &X-Emby-Client-Version=1.0.0
    &X-Emby-Token=${token}
  `.replace(/\s*/g, "");
}

function getShowsUrl (startIdx, limit) {
  return `http://hahnca.com:8096 / emby
          / Users / 894c752d448f45a3a1260ccaabd0adff / Items
    ?SortBy=SortName
    &SortOrder=Ascending
    &IncludeItemTypes=Series
    &Recursive=true
    &Fields=Name %2c Id %2c IsFavorite %2c 
            Played %2c UnplayedItemCount %2c 
            DateCreated %2c ExternalUrls %2c 
            Genres %2c Overview %2c Path %2c 
            People %2c PremiereDate
    &StartIndex=${startIdx}
    &ParentId=4514ec850e5ad0c47b58444e17b6346c
    &GroupItemsIntoCollections=false
    &Limit=${limit}
    &X-Emby-Client=Emby%20Web
    &X-Emby-Device-Name=Chrome
    &X-Emby-Device-Id=f4079adb-6e48-4d54-9185-5d92d3b7176b
    &X-Emby-Client-Version=1.0.0
    &X-Emby-Token=${token}
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