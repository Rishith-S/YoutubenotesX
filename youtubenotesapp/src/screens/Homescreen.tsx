import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bounce, ToastContainer, toast } from "react-toastify";
import LoadingScreen from "../components/LoadingScreen";
import YouTubeModal from "../components/YoutubeModal";
import { UserDetails, clearMessage } from "../features/userDetailSlice";
import { Plus, Trash2, Grid2x2 } from "lucide-react";

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
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const name = localStorage.getItem("name");
  const navigate = useNavigate();
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
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setShouldRefetch(false);
      }
    };
    fetch();
  }, [shouldRefetch]);

  useEffect(() => {
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
      setLoading(true);
      const res = await axios.delete(
        `${
          import.meta.env.VITE_SERVER_URL
        }/playList/deletePlaylist/${playListDocumentId}`,
        {
          withCredentials: true,
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
      setPlayListVideos((prev) =>
        prev.filter((item) => item.id != playListDocumentId)
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-black pt-20 px-6 pb-8">
      <YouTubeModal
        loading={loading}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setLoading={setLoading}
        onSuccess={() => setShouldRefetch(true)}
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

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-3">
          <div className="flex gap-2 items-center">
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800">
              <Grid2x2 color="white" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">All Notes</h1>
              <p className="text-zinc-400 text-sm">
                {playListVideos.length} videos • Welcome back, {name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-red-900/20"
          >
            <Plus className="w-5 h-5" />
            Add Playlist
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {playListVideos.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-2xl overflow-hidden bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex flex-col"
          >
            {/* Thumbnail */}
            <div
              onClick={() => navigate(`/${item.id}`)}
              className="relative aspect-video overflow-hidden"
            >
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                src={item.playListImage}
                alt={item.playListTitle}
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content */}
            <div onClick={() => navigate(`/${item.id}`)} className="p-4 pb-3 flex-grow">
              <h3 className="text-white font-semibold text-base mb-2 line-clamp-2">
                {item.playListTitle}
              </h3>
              <p className="text-zinc-500 text-sm">
                {item.playListContent.length} videos
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="px-4 pb-4 space-y-2 mt-auto">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Progress</span>
                <span className="text-zinc-400">
                  {item.completedCount || 0}/{item.playListContent.length}
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-red-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      item.playListContent.length > 0
                        ? ((item.completedCount || 0) / item.playListContent.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.id);
              }}
              className="absolute top-3 right-3 w-8 h-8 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:border-red-600"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
