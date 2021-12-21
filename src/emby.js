import axios from "axios"
import _ from "lodash"

const u = "https://hahnca.com:8920/emby";
const q = "?api_key=ba7d62f79cbd4a539b675b05b5663607";
const markUsrId = "894c752d448f45a3a1260ccaabd0adff";
const authHdr   = 'UserId="894c752d448f45a3a1260ccaabd0adff", ' +
                  'Client="MyClient", Device="myDevice", '      +
                  'DeviceId="123456", Version="1.0.0"';

let token = '';

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

export async function getShows(startIdx) {
  console.log("loading shows");
  const showsRes = await axios.get(getShowsUrl(startIdx));
  const totRecCount = showsRes.data.TotalRecordCount;
  const shows = [];
  for(let key in showsRes.data.Items) {
    const item = showsRes.data.Items[key];
    Object.assign(item, item.UserData);
    delete item.UserData;
    shows.push( _.pick(item, [
      'Name', 'Id', 'IsFavorite', 
      'PlayCount', 'Played', 'UnplayedItemCount'])
    );
  }
  return {shows, totRecCount};
}

function getShowsUrl (startIdx) {
  return `http://hahnca.com:8096/emby/
          Users/894c752d448f45a3a1260ccaabd0adff
  /Items
    ?SortBy=SortName
    &SortOrder=Ascending
    &IncludeItemTypes=Series
    &Recursive=true
    &Fields=BasicSyncInfo%2CCanDelete
    &StartIndex=${startIdx}
    &ParentId=4514ec850e5ad0c47b58444e17b6346c
    &GroupItemsIntoCollections=false
    &Limit=10
    &X-Emby-Client=Emby%20Web
    &X-Emby-Device-Name=Chrome
    &X-Emby-Device-Id=f4079adb-6e48-4d54-9185-5d92d3b7176b
    &X-Emby-Client-Version=1.0.0
    &X-Emby-Token=${token}
  `.replace(/\s*/g, "");
}