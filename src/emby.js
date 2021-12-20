import axios from "axios"

const u = "https://hahnca.com:8920/emby";
const q = "?api_key=ba7d62f79cbd4a539b675b05b5663607";
const markUsrId = "894c752d448f45a3a1260ccaabd0adff";
const authHdr   = 'UserId="894c752d448f45a3a1260ccaabd0adff", ' +
                  'Client="MyClient", Device="myDevice", '      +
                  'DeviceId="123456", Version="1.0.0"';

// const getUserId = async (name) => {
//   const res = await axios.get(u+"/Users/Public"+q);
//   const user = res.data.filter(obj => (obj.Name == name));
//   return user[0].Id;
// };

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
  // const userId = await getUserId("MARK");
  // if(userId != markUsrId) {
  //   console.log("userId mismatch, exp:", markUsrId, "found", userId);
  //   return;
  // }
  token = await getToken('MARK', '90-NBVcvbasd');
  // console.log({token});

  
}

export async function shows() {
  console.log("loading shows");
  const res = await axios.get(u+"/Users/Public"+q);
  console.log(res);

}
