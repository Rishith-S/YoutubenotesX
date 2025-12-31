import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "../components/Editor";
import LoadingScreen from "../components/LoadingScreen";
import Sidebar from "../components/Sidebar";
import { Playlists } from "./Homescreen";
import {
  ArrowLeft,
  Pause,
  Square,
  RectangleHorizontal,
  Plus,
} from "lucide-react";

export default function IndividualPlaylist() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [playListDetails, setPlayListVideos] = useState<Playlists>();
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [viewMode, setViewMode] = useState<"split" | "theater" | "default">(
    "split"
  );
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");

  // Custom hook for keyboard navigation
  const useKeyboardNavigation = (
    totalVideos: number,
    setSelectedVideo: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const shiftNHandler = useCallback(
      (event: KeyboardEvent) => {
        if (event.shiftKey && event.key === "N") {
          setSelectedVideo((prev) =>
            prev < totalVideos - 1 ? prev + 1 : prev
          );
        }
      },
      [totalVideos, setSelectedVideo]
    );

    const shiftPHandler = useCallback(
      (event: KeyboardEvent) => {
        if (event.shiftKey && event.key === "P") {
          setSelectedVideo((prev) => (prev > 0 ? prev - 1 : prev));
        }
      },
      [setSelectedVideo]
    );

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
  const [selectedVideo, setSelectedVideo] = useState<number>(() => {
    if (playListDetails?.playListContent) {
      const idx = playListDetails.playListContent.findIndex(
        (video) => !video.completed
      );
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

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const videoIdMatch = newVideoUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    if (!videoId) {
      alert("Invalid YouTube URL");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/playList/addVideoToPlaylist/${playlistId}`,
        { videoId },
        { withCredentials: true }
      );
      
      // Refetch playlist details
      await fetchVideos();
      setShowAddVideoModal(false);
      setNewVideoUrl("");
    } catch (error) {
      console.log(error);
      alert("Failed to add video");
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <LoadingScreen />
  ) : (
    <div
      className="bg-black flex overflow-hidden"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <div
        className={`${
          showSidebar ? "w-[28%]" : "w-14"
        } transition-all duration-500 ease-in-out flex-shrink-0 h-full`}
      >
        <Sidebar
          selectedVideo={selectedVideo}
          showSidebar={showSidebar}
          setSelectedVideo={setSelectedVideo}
          setShowSidebar={setShowSidebar}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/home")}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                aria-label="Back to home"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-400 hover:text-white" />
              </button>
              <h1 className="text-white text-lg font-semibold line-clamp-1">
                {playListDetails?.playListContent[selectedVideo]?.title ||
                  "Video Title"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "default"
                    ? "bg-zinc-800 text-white"
                    : "hover:bg-zinc-800 text-zinc-400"
                }`}
                onClick={() => setViewMode("default")}
                title="Default view"
              >
                <Pause className="w-5 h-5" />
              </button>
              <button
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "split"
                    ? "bg-zinc-800 text-white"
                    : "hover:bg-zinc-800 text-zinc-400"
                }`}
                onClick={() => setViewMode("split")}
                title="Split view"
              >
                <Square className="w-5 h-5" />
              </button>
              <button
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "theater"
                    ? "bg-zinc-800 text-white"
                    : "hover:bg-zinc-800 text-zinc-400"
                }`}
                onClick={() => setViewMode("theater")}
                title="Theater mode"
              >
                <RectangleHorizontal className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-zinc-800" />
              {playListDetails?.playListId.startsWith('custom-') && (
                <button
                  onClick={() => setShowAddVideoModal(true)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                  title="Add video to playlist"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Add Video</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {selectedVideo >= 0 &&
            playListDetails?.playListContent &&
            selectedVideo < playListDetails?.playListContent.length && (
              <div
                className={`h-full flex ${
                  viewMode === "split" ? "flex-row" : "flex-col"
                }`}
              >
                {/* Video Section */}
                <div
                  className={`bg-zinc-950 ${
                    viewMode === "split" ? "w-1/2" : "w-full h-[65%]"
                  } flex flex-col`}
                >
                  {/* Video Player */}
                  <div className="flex-1 flex items-center justify-center bg-zinc-900 p-6">
                    <div className="w-full h-full max-w-5xl">
                      <ReactPlayer
                        url={`${playListDetails?.playListContent[selectedVideo].videoUrl}`}
                        width="100%"
                        height="100%"
                        controls={true}
                        playing={true}
                        className="rounded-xl overflow-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className={`bg-black ${
                  viewMode === 'split' ? 'w-1/2 border-l' : 'w-full h-[35%] border-t'
                } border-zinc-800 flex flex-col overflow-hidden`}>
                  <Editor
                    videoId={playListDetails?.playListContent[selectedVideo].videoId}
                    playListId={playlistId as string}
                    onSave={() => {
                      console.log('Notes saved successfully');
                    }}
                  />
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Add Video Modal */}
      {showAddVideoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add Video to Playlist</h2>
              <button
                className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-zinc-800 rounded-lg"
                onClick={() => {
                  setShowAddVideoModal(false);
                  setNewVideoUrl("");
                }}
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <form onSubmit={handleAddVideo}>
              <div className="mb-5">
                <label
                  htmlFor="video-url"
                  className="block text-zinc-300 text-sm font-medium mb-2"
                >
                  YouTube Video URL
                </label>
                <input
                  id="video-url"
                  type="text"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddVideoModal(false);
                    setNewVideoUrl("");
                  }}
                  className="px-5 py-2.5 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
                >
                  {loading ? "Adding..." : "Add Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
