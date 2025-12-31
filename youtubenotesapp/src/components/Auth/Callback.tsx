import axios from "axios";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setUserDetails, UserDetails } from "../../features/userDetailSlice";
import "react-toastify/dist/ReactToastify.css";

export default function Callback() {
  const location = useLocation();
  console.log(location.pathname);
  const called = useRef(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken")!;
  const dispatch = useDispatch();
  const type = location.pathname.split("/").slice(-1)[0];
  useEffect(() => {
    (async () => {
      if (!accessToken || accessToken.length === 0) {
        try {
          if (called.current) return; // prevent rerender caused by StrictMode
          called.current = true;
          console.log(window.location.search);
          const res = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/auth/token${
              window.location.search
            }&type=${type}`,
            { withCredentials: true }
          );
          const userDetails: UserDetails = res.data as unknown as UserDetails;
          dispatch(
            setUserDetails({
              name: userDetails.name,
              email: userDetails.email,
              accessToken: userDetails.accessToken,
              message: userDetails.message
            })
          );
          localStorage.setItem("name", userDetails.name);
          localStorage.setItem("email", userDetails.email);
          localStorage.setItem("accessToken", userDetails.accessToken);
          navigate("/home");
        } catch (err) {
          console.error(err);
          navigate("/auth");
        }
      } else if (accessToken) {
        navigate("/home");
      }
    })();
  }, [navigate]);
  return (
    <></>
  );
}
