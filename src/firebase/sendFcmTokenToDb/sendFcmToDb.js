import axios from "axios"
import { url, url2 } from "../../lib/api"

export const sendFcmToken=async(fcm_token,id)=>{
    try {
        const response=await axios.post(`${url}/auth/updateUsersFcmToken`,{
            id,
            fcm_token,
          })
        console.log(response)
    } catch (error) {
        console.log(error)
    }
}