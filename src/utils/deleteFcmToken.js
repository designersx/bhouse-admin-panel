import axios from "axios";
import { url } from "../lib/api";
export const deleteFcmToken = async (id) => {
    const data = { id: id }
    try {
        const res = await axios.post(`${url}/auth/deleteUsersFcmToken`, data);
        console.log(res)
    } catch (error) {
        return null;
    }
};
