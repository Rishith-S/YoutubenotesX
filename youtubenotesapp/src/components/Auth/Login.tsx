import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "../../assets/google_icon.png";
import InputField from "../InputField";

export default function Login() {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const accessToken = localStorage.getItem("accessToken")!;
  const [loginOrSignup, setLoginOrSignup] = useState(true); // true represents login
  const navigate = useNavigate();
  useEffect(() => {
    if (accessToken && accessToken.length !== 0) {
      navigate("/");
    }
  }, [accessToken]);
  const handleLogin = async () => {
    try {
      const response = (await axios.get(`${serverUrl}/auth/url/login`)) as any;
      window.location.assign(response.data.url);
    } catch (err) {
      console.error(err);
    }
  };
  const handleSignUp = async () => {
    try {
      const response = (await axios.get(`${serverUrl}/auth/url/signup`)) as any;
      window.location.assign(response.data.url);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="relative w-full h-screen">
      <div className="z-10 w-screen h-screen flex flex-row">
        <div className="text-white w-1/2 gap-16 flex flex-col items-start justify-center px-8 2xl:px-32">
          <p
            onClick={() => {
              navigate("/");
            }}
            className="cursor-pointer absolute top-0 text-3xl font-extrabold bg-gradient-to-b from-orange-200 via-orange-400 to-orange-800 inline-block text-transparent bg-clip-text py-8"
          >
            YoutubeXnoteS
          </p>
          <div className="text-6xl flex flex-col gap-4">
            <p>Transform Your</p>
            <p className="text-orange-500 font-bold">Learning Experience</p>
            <p>with YoutubeXnoteS</p>
          </div>
          <div className="text-md">
            Every YouTube playlist becomes a structured course tailored
            specifically for you. Track your progress effortlessly, while taking
            detailed notes for each video to ensure full comprehension of every
            concept.
          </div>
        </div>
        <div className="w-1/2 flex items-center justify-center">
          <div className="w-3/4 h-[55%] bg-black rounded-2xl p-8 flex flex-col justify-center gap-4">
            <h3 className="text-white text-3xl font-bold text-center">
              {loginOrSignup ? "Welcome Back" : "Create Your Account"}
            </h3>
            <div className="w-full flex flex-col gap-4">
              <InputField idFor={"email"} placeholder={"Email Address"} />
              <InputField idFor={"password"} placeholder={"Password"} />
              <div className="text-white w-full flex items-center justify-center bg-orange-500 p-2 h-12 rounded-md">
                <p className="font-bold">{loginOrSignup ? "Login" : "Signup"}</p>
              </div>
            </div>
            <div className="flex justify-center">
              <p className="text-white flex flex-row gap-2">
                {loginOrSignup ? "Don't" : "Already"}{" have an account ? "}
                <p onClick={()=>setLoginOrSignup(prev=>!prev)} className="text-orange-500 font-bold underline cursor-pointer">
                  {loginOrSignup ? "SignUp" : "Login"}
                </p>
              </p>
            </div>
            <div className="flex flex-row justify-between items-center gap-4">
              <div className="border-[1px] w-1/2 border-gray-400" />
              <p className="text-gray-200">OR</p>
              <div className="border-[1px] w-1/2 border-gray-400" />
            </div>
            <div className="flex items-center justify-center">
              <div
                onClick={loginOrSignup ? handleLogin : handleSignUp}
                className="flex flex-row gap-2 border-2 rounded-full w-1/2 border-orange-400 p-2 items-center justify-center cursor-pointer "
              >
                <img src={GoogleIcon} className="w-6 h-6" />
                <p className="text-white">{loginOrSignup ? "Login" : "Signup"} with Google</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-1/6 h-1/3 shadow-[0px_0px_100px_160px_rgba(154,52,18,1)] rounded-full bg-orange-600 blur-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[-1]" />
    </div>
  );
}
