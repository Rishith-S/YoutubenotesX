import { useState } from "react";
import { ToastContainer, Bounce, toast } from "react-toastify";
import axios from "axios";
import { X, AlertCircle, List, Video } from "lucide-react";

const YouTubeModal = ({
  loading,
  isOpen,
  setIsOpen,
  setLoading,
  onSuccess,
}: {
  loading: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: () => void;
}) => {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"playlist" | "custom">("playlist");
  const [customPlaylistName, setCustomPlaylistName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const toggleModal = () => {
    setIsOpen(!isOpen);
    setYoutubeLink("");
    setError("");
    setMode("playlist");
    setCustomPlaylistName("");
    setVideoUrl("");
  };

  function getPlaylistIds(url: string) {
    const matches = url.match(/list=([a-zA-Z0-9_-]+)/g);
    if (!matches) return null;
    return matches.map((match: string) => match.split("=")[1]);
  }

  function getVideoId(url: string) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/);
    return match ? match[1] : null;
  }

  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add Content</h2>
              <button
                className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-zinc-800 rounded-lg"
                onClick={toggleModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setMode("playlist")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                  mode === "playlist"
                    ? "bg-red-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
                YouTube Playlist
              </button>
              <button
                type="button"
                onClick={() => setMode("custom")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                  mode === "custom"
                    ? "bg-red-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <Video className="w-4 h-4" />
                Custom Playlist
              </button>
            </div>

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

            {mode === "playlist" ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!loading) {
                    try {
                      setLoading(true);
                      const link = getPlaylistIds(youtubeLink);
                      if (!link) {
                        setError("Link pasted is not Valid");
                        return;
                      }
                      setError("");
                      const res = await axios.get(
                        `${
                          import.meta.env.VITE_SERVER_URL
                        }/playList/addPlaylist/${link}`,
                        {
                          withCredentials: true,
                        }
                      );
                      toast((res.data as { message: string }).message, {
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
                      setYoutubeLink("");
                      onSuccess?.();
                    } catch (error) {
                      console.log(error);
                      toast.error("Failed to add playlist. Please try again.");
                    } finally {
                      setLoading(false);
                      setIsOpen(false);
                    }
                  }
                }}
              >
              <div className="mb-5">
                <label
                  htmlFor="youtube-link"
                  className="block text-zinc-300 text-sm font-medium mb-2"
                >
                  YouTube Playlist URL
                </label>
                <input
                  id="youtube-link"
                  type="text"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=..."
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                  required
                />
                {error && (
                  <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-start gap-2 mb-6 p-3 bg-zinc-950/50 border border-zinc-800 rounded-xl">
                <AlertCircle className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                <p className="text-zinc-400 text-xs">
                  Paste a YouTube playlist URL to import all videos. Maximum 150 videos per playlist.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="px-5 py-2.5 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
                >
                  {loading ? "Adding..." : "Add Playlist"}
                </button>
              </div>
            </form>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!loading) {
                    try {
                      setLoading(true);
                      const videoId = getVideoId(videoUrl);
                      if (!videoId) {
                        setError("Invalid YouTube video URL");
                        setLoading(false);
                        return;
                      }
                      if (!customPlaylistName.trim()) {
                        setError("Please enter a playlist name");
                        setLoading(false);
                        return;
                      }
                      setError("");
                      
                      // Create custom playlist with video
                      const res = await axios.post(
                        `${import.meta.env.VITE_SERVER_URL}/playList/createCustomPlaylist`,
                        {
                          playlistName: customPlaylistName,
                          videoId: videoId
                        },
                        {
                          withCredentials: true,
                        }
                      );
                      
                      toast((res.data as { message: string }).message || "Playlist created successfully!", {
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
                      setCustomPlaylistName("");
                      setVideoUrl("");
                      onSuccess?.();
                    } catch (error: any) {
                      console.log(error);
                      toast.error(error.response?.data?.message || "Failed to create playlist. Please try again.");
                    } finally {
                      setLoading(false);
                      setIsOpen(false);
                    }
                  }
                }}
              >
                <div className="mb-4">
                  <label
                    htmlFor="playlist-name"
                    className="block text-zinc-300 text-sm font-medium mb-2"
                  >
                    Playlist Name
                  </label>
                  <input
                    id="playlist-name"
                    type="text"
                    value={customPlaylistName}
                    onChange={(e) => setCustomPlaylistName(e.target.value)}
                    placeholder="My Learning Playlist"
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                    required
                  />
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="video-url"
                    className="block text-zinc-300 text-sm font-medium mb-2"
                  >
                    First Video URL
                  </label>
                  <input
                    id="video-url"
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                    required
                  />
                  {error && (
                    <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-start gap-2 mb-6 p-3 bg-zinc-950/50 border border-zinc-800 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <p className="text-zinc-400 text-xs">
                    Create a custom playlist with your own name. You can add more videos to it later.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={toggleModal}
                    className="px-5 py-2.5 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
                  >
                    {loading ? "Creating..." : "Create Playlist"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeModal;
