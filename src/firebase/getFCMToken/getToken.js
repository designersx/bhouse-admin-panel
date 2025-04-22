import { messaging } from '../firebaseConfig/firebaseConfig';
import { getToken } from 'firebase/messaging';

export const getFcmToken = async () => {
    try {
        const currentToken = await getToken(messaging, {
            vapidKey: "BOO5cI9iJjNrju0nVIA7fpRHZEf4nNFBtTsbscin59WZpSuPwbRH_mfqD3Wj7eYd-Fje4uio_DG81pJw9XaEU2I"
        });
        if (currentToken) {
            console.log("Token received:", currentToken);
        
            return currentToken;
        } else {
            console.warn("No token available. Make sure notifications are enabled in your browser settings.");
            return null;
        }
    } catch (error) {
        console.error("An error occurred while retrieving the token:", error);
    }
};
