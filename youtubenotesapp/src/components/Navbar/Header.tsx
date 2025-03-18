import { useNavigate } from 'react-router-dom';
import LogoutIcon from '../../assets/LogoutIcon';
import { useDispatch } from 'react-redux';
import { userLogout } from '../../features/userDetailSlice';

export default function Header() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const logOut = ()=>{
    dispatch(userLogout());
    localStorage.clear();
    navigate('/auth')
  }
  return (
    <div className="h-20 flex items-center border-b-2 border-orange-500 p-4 justify-between w-screen">
        <p onClick={()=>{navigate('/')}} className="cursor-pointer text-2xl font-extrabold bg-gradient-to-b from-orange-400 via-orange-500  to-orange-800 inline-block text-transparent bg-clip-text">YoutubeXnoteS</p>
        <div onClick={logOut} className='flex flex-row gap-2 items-center  hover:cursor-pointer logout'>
          <LogoutIcon />
          <p className='text-white logoutText'>Logout</p>
        </div>
    </div>
  )
}
