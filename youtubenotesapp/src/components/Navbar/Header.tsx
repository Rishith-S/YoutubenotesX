import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userLogout } from '../../features/userDetailSlice';
import {Play, LogOut} from "lucide-react"

export default function Header() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const logOut = ()=>{
    dispatch(userLogout());
    localStorage.clear();
    navigate('/auth')
  }
  return (
    <nav className="border-b border-zinc-800/50 backdrop-blur-sm fixed w-full z-50 bg-zinc-950/80">
        <div className="mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white font-display cursor-pointer" onClick={()=>navigate("/home")}>
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/20">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            NoteTube
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={logOut}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-red-50 rounded-lg transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>
  )
}
