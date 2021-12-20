import axios from "axios"

const u = "https://hahnca.com:8920/emby";
const q = "?api_key=ba7d62f79cbd4a539b675b05b5663607";
let userId = "";

const getUserId = async (name) => {
  const res = await axios.get(u+"/Users/Public"+q);
  const user = res.data.filter(obj => (obj.Name == name));
  return user[0].Id;
};

export async function init() {
  userId = await getUserId("MARK"));
  console.log('mark', userId);
}


export async function shows() {
  console.log("loading shows");
  const res = await axios.get(u+"/Users/Public"+q);
  console.log(res);

}
