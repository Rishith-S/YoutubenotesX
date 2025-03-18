import axios from "axios";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";
import { Editor } from "../components/Editor";
import LoadingScreen from "../components/LoadingScreen";
import Sidebar from "../components/Sidebar";
import { Playlists } from "./Homescreen";

export default function IndividualPlaylist() {
  const { playlistId } = useParams();
  const [playListDetails, setPlayListVideos] = useState<Playlists>();
  const [loading, setLoading] = useState(true);
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${
          import.meta.env.VITE_SERVER_URL
        }/playList/getPlaylistVideos/${playlistId}`,
        { withCredentials: true }
      );
      setPlayListVideos(
        (res.data as { playListDetails: Playlists }).playListDetails
      );
      localStorage.setItem(
        "playListDetails",
        JSON.stringify(
          (res.data as { playListDetails: Playlists }).playListDetails
        )
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchVideos();
  }, []);
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  return loading ? (
    <LoadingScreen />
  ) : (
    <div>
      <div
        className={`absolute bg-transparent z-50 ${
          showSidebar ? "w-screen" : "w-auto"
        }`}
      >
        <div className="w-full md:w-[55%]">
          <Sidebar
            selectedVideo={selectedVideo}
            showSidebar={showSidebar}
            setSelectedVideo={setSelectedVideo}
            setShowSidebar={setShowSidebar}
          />
        </div>
      </div>
      <div className="pl-14 w-full h-screen transition-all duration-500 ease-in-out overflow-y-auto">
        {selectedVideo >= 0 &&
          playListDetails?.playListContent &&
          selectedVideo < playListDetails?.playListContent.length && (
            <div>
              {/* Video Container */}
              <div className="flex h-[75vh] w-full p-4">
                <ReactPlayer
                  url={`${playListDetails?.playListContent[selectedVideo].videoUrl}?autoplay=1`}
                  width="100%"
                  height="100%"
                  controls={true}
                />
              </div>
              {/* Editor Container */}
              <div className="w-full h-[65vh] py-8 px-4">
                <div className="border-2 h-[50vh] rounded-xl border-orange-400 overflow-auto p-8">
                  <Editor
                    videoId={
                      playListDetails?.playListContent[selectedVideo].videoId
                    }
                    playListId={playlistId as string}
                  />
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
