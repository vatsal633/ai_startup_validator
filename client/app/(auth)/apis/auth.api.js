import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const login = async (FormData) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/auth/login/`,
            FormData
        );

        return response.data;
    } catch (error) {
        console.log("STATUS:", error.response?.status);
        console.log("DATA:", error.response?.data);
        throw error;
    }
};

export const singIn= async(FormData)=>{
    try {
        const response = await axios.post(`${API_URL}/api/auth/register/`,FormData)
        return response?.data
    } catch (error) {
        console.log("STATUS:", error.response?.status);
        console.log("DATA:", error.response?.data);
        throw error        
    }
}

