import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bounce, ToastContainer, toast } from "react-toastify";
import DeleteIcon from "../assets/DeleteIcon";
import LoadingScreen from "../components/LoadingScreen";
import YouTubeModal from "../components/YoutubeModal";
import { UserDetails, clearMessage } from "../features/userDetailSlice";

export interface IVideos {
  videoUrl: string;
  videoId: string;
  title: string;
  thumbnail: { url: string; height: number; width: number };
  completed: boolean;
}
export interface Playlists {
  id: number;
  userId: number;
  playListId: string;
  playListTitle: string;
  playListImage: string;
  playListContent: IVideos[];
  completedCount: number;
}

export default function Homescreen() {
  const [playListVideos, setPlayListVideos] = useState<Playlists[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const name = localStorage.getItem("name");
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");
  const message = useSelector((state: UserDetails) => state.message);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/playList/getPlaylists`,
          { withCredentials: true }
        );
        setPlayListVideos(
          (res.data as unknown as { playLists: Playlists[] }).playLists
        );
        console.log((res.data as unknown as { playLists: Playlists[] }).playLists)
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isOpen]);

  useEffect(() => {
    const currentHour = new Date().getHours();
    let newGreeting;
    if (currentHour < 12) {
      newGreeting = "Good Morning";
    } else if (currentHour < 18) {
      newGreeting = "Good Afternoon";
    } else {
      newGreeting = "Good Evening";
    }
    setGreeting(newGreeting);
    if (message.length != 0) {
      toast(message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      dispatch(clearMessage());
    }
  }, []);

  const handleDelete = async (playListDocumentId: number) => {
    try {
      setLoading(true)
      const res = await axios.delete(
        `${
          import.meta.env.VITE_SERVER_URL
        }/playList/deletePlaylist/${playListDocumentId}`,{
          withCredentials:true
        }
      );
      const message = (res.data as { message: string }).message;
      if (message.length != 0) {
        toast(message, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
        dispatch(clearMessage());
      }
      setPlayListVideos(prev=>prev.filter(item=>item.id!=playListDocumentId))
    } catch (error) {
      console.log(error)
    } finally{
      setLoading(false)
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="p-4 xl:px-32 xl:py-16">
      <YouTubeModal
        loading={loading}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setLoading={setLoading}
      />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      <p className="text-white text-4xl mb-4">
        {greeting}, {name}
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-4">
        <div
          onClick={() => {
            setIsOpen(true);
          }}
          className={`w-100 ${
            playListVideos.length === 0 ? "h-[250px]" : "h-auto"
          } rounded-xl flex items-center justify-center border border-gray-700 bg-gray-900 hover:bg-gray-800 transition-colors cursor-pointer`}
        >
          <p className="text-gray-400 text-md font-light">
            + Add video/playlist
          </p>
        </div>
        {playListVideos.map((item, index) => (
          <div
            key={item.id}
            className="rounded-xl flex flex-col border border-gray-700 bg-gray-900 hover:bg-gray-800 transition-colors cursor-pointer text-wrap"
          >
            <img
              onClick={() => {
                navigate(`/${item.id}`);
              }}
              className="w-full rounded-t-xl object-fill"
              src={item.playListImage}
              alt="Random"
            />
            <div
              onClick={() => {
                navigate(`/${item.id}`);
              }}
              className="w-full bg-gray-200 h-1 dark:bg-gray-700"
            >
              <div
                className="bg-orange-600 h-1"
                style={{
                  width: `${
                    (item.completedCount / item.playListContent.length) * 100
                  }%`,
                }}
              />
            </div>

            <div className="flex flex-row px-4 py-2 items-center justify-center">
              <p
                onClick={() => {
                  navigate(`/${item.id}`);
                }}
                key={index}
                className="w-full text-white cursor-pointer break-words text-wrap"
              >
                {item.playListTitle.length > 20
                  ? item.playListTitle.slice(0, 20) + "..."
                  : item.playListTitle}
              </p>
              <div
                onClick={() => handleDelete(item.id)}
                className="w-10 h-10 rounded-lg p-2 hover:bg-black"
              >
                <DeleteIcon fill={"#ee6b6e"} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
