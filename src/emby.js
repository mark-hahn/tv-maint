import axios from "axios"
import _ from "lodash"

const u = "https://hahnca.com:8920/emby";
const q = "?api_key=ba7d62f79cbd4a539b675b05b5663607";
const markUsrId = "894c752d448f45a3a1260ccaabd0adff";
const authHdr   = 'UserId="894c752d448f45a3a1260ccaabd0adff", ' +
                  'Client="MyClient", Device="myDevice", '      +
                  'DeviceId="123456", Version="1.0.0"';

const getToken = async (name, pwd) => {
  const config = {
    method: 'post',
    url: u+"/Users/AuthenticateByName"+q,
    headers: { Authorization: authHdr },
    data: { Username: name, Pw: pwd },
  };
  const res = await axios(config);
  const token = res.data.AccessToken;
  return token;
}

let token = '';

export async function init() {
  token = await getToken('MARK', '90-NBVcvbasd');
  // console.log({token});
  // axios.get(u+'/openapi');
}

export async function shows() {
  console.log("loading shows");
  const res = await axios.get(getSeriesUrl());
  const totRecCount = res.data.TotalRecordCount;
  const shows = [];
  for(let key in res.data.Items) {
    const item = res.data.Items[key];
    for(let key in item) {
      Object.assign(item, item.UserData);
      delete item.UserData;
    }
    shows.push( _.pick(item, [
      'Name', 'Id', 'IsFavorite', 
      'PlayCount', 'Played', 'UnplayedItemCount'])
    );
  }
  console.log({res, totRecCount, shows});
}

function getSeriesUrl () {
  return `http://hahnca.com:8096/emby/
          Users/894c752d448f45a3a1260ccaabd0adff
  /Items
    ?SortBy=SortName
    &SortOrder=Ascending
    &IncludeItemTypes=Series
    &Recursive=true
    &Fields=BasicSyncInfo%2CCanDelete%2CPrimaryImageAspectRatio
    &ImageTypeLimit=1
    &EnableImageTypes=Primary%2CBackdrop%2CThumb
    &StartIndex=0
    &ParentId=4514ec850e5ad0c47b58444e17b6346c
    &GroupItemsIntoCollections=true
    &Limit=10
    &X-Emby-Client=Emby%20Web
    &X-Emby-Device-Name=Chrome
    &X-Emby-Device-Id=f4079adb-6e48-4d54-9185-5d92d3b7176b
    &X-Emby-Client-Version=4.6.4.0
    &X-Emby-Token=${token}
  `.replace(/\s*/g, "");
}