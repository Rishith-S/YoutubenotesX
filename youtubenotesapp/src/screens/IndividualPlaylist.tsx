import axios from "axios";
import { useCallback, useEffect, useState } from "react";
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
  const [showSidebar, setShowSidebar] = useState(true);

  // Custom hook for keyboard navigation
  const useKeyboardNavigation = (
    totalVideos: number,
    setSelectedVideo: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const shiftNHandler = useCallback((event: KeyboardEvent) => {
      if (event.shiftKey && event.key === "N") {
        setSelectedVideo(prev => prev < totalVideos - 1 ? prev + 1 : prev);
      }
    }, [totalVideos, setSelectedVideo]);

    const shiftPHandler = useCallback((event: KeyboardEvent) => {
      if (event.shiftKey && event.key === "P") {
        setSelectedVideo(prev => prev > 0 ? prev - 1 : prev);
      }
    }, [setSelectedVideo]);

    useEffect(() => {
      window.addEventListener("keydown", shiftNHandler);
      window.addEventListener("keydown", shiftPHandler);
      return () => {
        window.removeEventListener("keydown", shiftNHandler);
        window.removeEventListener("keydown", shiftPHandler);
      };
    }, [shiftNHandler, shiftPHandler]);
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL
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
  const [selectedVideo, setSelectedVideo] = useState<number>(() => {
    // Try to find the first incomplete video
    if (playListDetails?.playListContent) {
      const idx = playListDetails.playListContent.findIndex(
        (video) => !video.completed
      );
      // If all videos are completed, default to 0
      return idx === -1 ? 0 : idx;
    }
    return 0;
  });

  // Update selectedVideo when playListDetails changes
  useEffect(() => {
    if (playListDetails?.playListContent) {
      const idx = playListDetails.playListContent.findIndex(
        (video) => !video.completed
      );
      setSelectedVideo(idx === -1 ? 0 : idx);
    }
  }, [playListDetails]);

  useKeyboardNavigation(
    playListDetails?.playListContent?.length || 0,  
    setSelectedVideo
  );


  return loading ? (
    <LoadingScreen />
  ) : (
    <div>
      <div
        className={`absolute bg-transparent z-50 ${showSidebar ? "w-screen" : "w-auto"
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
                  url={`${playListDetails?.playListContent[selectedVideo].videoUrl}`}
                  width="100%"
                  height="100%"
                  controls={true}
                  playing={true}
                  playbackRate={2}
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
