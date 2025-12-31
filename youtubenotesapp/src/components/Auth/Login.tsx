import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "../../assets/google_icon.png";
import { toast } from "react-toastify";
import { ArrowLeft, Loader2, Mail, Video, Lock } from "lucide-react";

export default function Login() {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const accessToken = localStorage.getItem("accessToken")!;
  const [loginOrSignup, setLoginOrSignup] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (accessToken && accessToken.length !== 0) {
      navigate("/home");
    }
  }, [accessToken]);
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const response = (await axios.get(`${serverUrl}/auth/url/login`)) as any;
      window.location.assign(response.data.url);
    } catch (err: any) {
      console.error("OAuth login error:", err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to start Google login. Please try again.");
      }
      setIsLoading(false);
    }
  };
  const handleSignUp = async () => {
    try {
      setIsLoading(true);
      const response = (await axios.get(`${serverUrl}/auth/url/signup`)) as any;
      window.location.assign(response.data.url);
    } catch (err: any) {
      console.error("OAuth signup error:", err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to start Google signup. Please try again.");
      }
      setIsLoading(false);
    }
  };
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${serverUrl}/auth/${loginOrSignup ? "login" : "signup"}`,
        loginOrSignup ? { email, password } : { name, email, password }
      );
      const data: any = response.data;
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        console.log(data.accessToken);
        toast.success(loginOrSignup ? "Login successful!" : "Account created successfully!");
        navigate("/home");
      } else if (data.message) {
        toast.error(data.message);
      } else {
        toast.error("Authentication failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Handle different error scenarios
      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.message || err.response.data?.error || "Authentication failed";
        toast.error(errorMessage);
      } else if (err.request) {
        // Request was made but no response received
        toast.error("Cannot connect to server. Please check your connection.");
      } else {
        // Something else happened
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 text-zinc-500 hover:text-zinc-200 transition-colors flex items-center gap-2 text-sm font-medium z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Video className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            {loginOrSignup ? "Welcome Back" : "Create Your Account"}
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">Sign in to continue to your workspace</p>
        </div>
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            {!loginOrSignup && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 ml-1">Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {loginOrSignup ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                loginOrSignup ? 'Sign In' : 'Sign Up'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-zinc-400 text-sm">
              {loginOrSignup ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setLoginOrSignup((prev) => !prev)}
                className="text-red-500 hover:text-red-400 font-medium transition-colors"
              >
                {loginOrSignup ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900/50 px-2 text-zinc-500">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={loginOrSignup ? handleLogin : handleSignUp}
            disabled={isLoading}
            className="w-full bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <img src={GoogleIcon} className="w-4 h-4" alt="Google" />
            Google
          </button>
        </div>
      </div>
    </div>
  );
}
