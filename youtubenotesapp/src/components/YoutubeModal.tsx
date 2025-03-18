import { useState } from "react";
import { ToastContainer, Bounce, toast } from "react-toastify";
import axios from "axios";

const YouTubeModal = ({
  loading,
  isOpen,
  setIsOpen,
  setLoading,
}: {
  loading: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [linkType, setLinkType] = useState("playlist");
  const [error, setError] = useState("");

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  function getPlaylistIds(url: string) {
    const matches = url.match(/list=([a-zA-Z0-9_-]+)/g);
    if (!matches) return null;
    return matches.map((match: string) => match.split("=")[1]);
  }

  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add YouTube Link</h2>
              <button
                className="text-gray-400 hover:text-white transition-colors"
                onClick={toggleModal}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
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
            <form
              onSubmit={async (e) => {
                if (!loading) {
                  e.preventDefault();
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
                  } catch (error) {
                    console.log(error);
                  } finally {
                    setLoading(false);
                    setIsOpen(false);
                  }
                }
              }}
            >
              <div className="mb-4">
                <label
                  htmlFor="youtube-link"
                  className="block text-gray-300 mb-2"
                >
                  YouTube Link
                </label>
                <input
                  id="youtube-link"
                  type="text"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
              </div>

              <div className="mb-6">
                <p className="text-gray-300 mb-2">Link Type</p>
                <div className="flex space-x-4">
                  <label className="flex items-center text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="linkType"
                      value="playlist"
                      checked={linkType === "playlist"}
                      onChange={() => setLinkType("playlist")}
                      className="mr-2 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                    />
                    Playlist
                  </label>
                  <label className="flex items-center text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="linkType"
                      value="video"
                      checked={linkType === "video"}
                      onChange={() => setLinkType("video")}
                      className="mr-2 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                    />
                    Video
                  </label>
                </div>
              </div>
              <div className="flex flex-row gap-1 mb-2">
                <p className="text-red-400 text-2xl">*</p>
                <p className="text-white">
                  The limit for number of videos in a playlist is 150
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="px-4 py-2 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeModal;
