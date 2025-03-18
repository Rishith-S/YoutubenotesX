import { useDispatch} from "react-redux";
import axios from "axios";
import { setUserDetails, UserDetails } from "../features/userDetailSlice";
import { useNavigate } from "react-router-dom";

const useRefreshToken= ()=>{

    const dispatch = useDispatch();
    const navigate = useNavigate()
    const refresh = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/auth/refresh`);
            if (res.data) {
                const userDetailsRes = res.data as unknown as UserDetails;
                dispatch(setUserDetails({
                    name: userDetailsRes.name,
                    email: userDetailsRes.email,
                    accessToken: userDetailsRes.accessToken,
                    message: userDetailsRes.message
                }));
                return userDetailsRes.accessToken;
            } else {
                console.error("Invalid response format");
                return null;
            }
        } catch (error) {
          navigate('/auth')
        }
    };
    
    return refresh;
}

export default  useRefreshToken;