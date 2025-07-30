import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CloseButton from "../assets/CloseButton";
import RightArrow from "../assets/RightArrow";
import TickIcon from "../assets/TickIcon";
import { IVideos, Playlists } from "../screens/Homescreen";
import LoadingScreen from "./LoadingScreen";

// Custom hook for safe localStorage access
const useLocalStorage = <T,>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [value, setStoredValue] as const;
};

// Custom hook for click outside detection
const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void, isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, handler, isActive]);
};

interface SidebarProps {
  selectedVideo: number;
  showSidebar: boolean;
  setSelectedVideo: React.Dispatch<React.SetStateAction<number>>;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({
  selectedVideo,
  showSidebar,
  setSelectedVideo,
  setShowSidebar,
}: SidebarProps) {
  const [playListDetails, setPlayListDetails] = useLocalStorage<Playlists | null>("playListDetails", null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Initialize data
  useEffect(() => {
    try {
      const stored = localStorage.getItem("playListDetails");
      if (!stored) {
        setError("No playlist data found");
        setIsLoading(false);
        return;
      }
      
      const parsed = JSON.parse(stored) as Playlists;
      if (!parsed || !parsed.playListContent) {
        setError("Invalid playlist data");
        setIsLoading(false);
        return;
      }
      
      setPlayListDetails(parsed);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load playlist data");
      setIsLoading(false);
    }
  }, [setPlayListDetails]);

  // Scroll to selected video when it changes
  useEffect(() => {
    if (selectedVideo >= 0 && videoRefs.current[selectedVideo] && scrollContainerRef.current) {
      const selectedElement = videoRefs.current[selectedVideo];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }
  }, [selectedVideo]);

  // Handle clicks outside sidebar
  useClickOutside(sidebarRef, () => setShowSidebar(false), showSidebar);

  // Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Error state
  if (error || !playListDetails) {
    return (
      <div className="w-14 bg-black border-r-[0.5px] border-gray-500 flex items-center justify-center">
        <div className="text-red-500 text-xs text-center p-2">
          {error || "No data available"}
        </div>
      </div>
    );
  }

  const videoCount = playListDetails.playListContent?.length || 0;

  return (
    <div
      ref={sidebarRef}
      className={`${showSidebar ? "w-screen md:w-full lg:w-[75%]" : "w-14"
        } bg-black border-r-[0.5px] border-gray-500 duration-500 transition-all ease-in-out relative`}
      role="complementary"
      aria-label="Playlist sidebar"
    >
      <div className={`${!showSidebar && "scale-0"}`}>
        <div className="flex flex-row justify-between border-b-2 border-gray-500">
          <div className="p-4 flex flex-row items-center justify-between w-full bg-gray-900">
            <p className="text-white text-xl p-4">
              Playlist Videos ({videoCount})
            </p>
            <button
              className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              onClick={() => setShowSidebar(false)}
              aria-label="Close sidebar"
            >
              <CloseButton />
            </button>
          </div>
        </div>
        <div
          ref={scrollContainerRef}
          className="p-4 h-[83vh] overflow-auto transition-all duration-500"
          role="list"
          aria-label="Video list"
        >
          {playListDetails.playListContent && playListDetails.playListContent.length > 0 ? (
            playListDetails.playListContent.map((video, index) => (
              <IndividualVideoCard
                selectedVideo={selectedVideo}
                index={index}
                setSelectedVideo={setSelectedVideo}
                key={`video-${index}`}
                video={video}
                playListDocumentId={playListDetails.id}
                playListDetails={playListDetails}
                setPlayListDetails={setPlayListDetails}
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
              />
            ))
          ) : (
            <div className="text-gray-400 text-center p-4">
              No videos in playlist
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => setShowSidebar(true)}
        className={`cursor-pointer absolute top-0 right-4 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${
          showSidebar && "scale-0"
        }`}
        aria-label="Open sidebar"
      >
        <RightArrow />
      </button>
    </div>
  );
}

interface IndividualVideoCardProps {
  index: number;
  video: IVideos;
  selectedVideo: number;
  setSelectedVideo: React.Dispatch<React.SetStateAction<number>>;
  playListDocumentId: number;
  playListDetails: Playlists;
  setPlayListDetails: (details: Playlists) => void;
}

export const IndividualVideoCard = React.forwardRef<
  HTMLDivElement,
  IndividualVideoCardProps
>(({ 
  index, 
  selectedVideo, 
  setSelectedVideo, 
  playListDocumentId, 
  video: initialVideo,
  playListDetails,
  setPlayListDetails
}, ref) => {
  const [video, setVideo] = useState<IVideos>(initialVideo);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleCompletion = useCallback(async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      // Optimistic update
      const updatedVideo = { ...video, completed: !video.completed };
      setVideo(updatedVideo);

      // Update playlist in localStorage
      const updatedPlayListContent = playListDetails.playListContent.map((item, idx) => 
        idx === index ? updatedVideo : item
      );
      
      const updatedPlayListDetails = {
        ...playListDetails,
        playListContent: updatedPlayListContent,
      };
      
      setPlayListDetails(updatedPlayListDetails);

      // API call
      await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/playList/markAsCompleted/${playListDocumentId}/${index}`,
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Failed to update video completion:", error);
      
      // Revert optimistic update
      setVideo(initialVideo);
      
      // Revert playlist update
      setPlayListDetails(playListDetails);
    } finally {
      setIsUpdating(false);
    }
  }, [video, playListDetails, setPlayListDetails, index, playListDocumentId, initialVideo]);

  const isSelected = selectedVideo === index;

  return (
    <div ref={ref} className="flex flex-row items-center gap-4" role="listitem">
      <button
        className={`w-5 h-5 flex items-center justify-center rounded-md border-2 cursor-pointer
          bg-white border-white focus:outline-none focus:ring-2 focus:ring-blue-500
          ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleToggleCompletion}
        disabled={isUpdating}
        aria-label={`${video.completed ? 'Mark as incomplete' : 'Mark as complete'} for ${video.title}`}
      >
        {video.completed && <TickIcon />}
      </button>
      <div
        className={`flex flex-row gap-4 p-4 hover:bg-gray-700 w-full rounded-lg cursor-pointer 
          ${isSelected ? "bg-gradient-to-r from-pink-950 via-violet-950 to-blue-950" : ""}
          focus:outline-none focus:ring-2 focus:ring-blue-500`}
        onClick={() => setSelectedVideo(index)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedVideo(index);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Select video ${index + 1}: ${video.title}`}
        aria-selected={isSelected}
      >
        <img
          src={video.thumbnail.url}
          className="rounded-lg object-stretch w-24 h-16"
          alt={`Thumbnail for ${video.title}`}
          loading="lazy"
        />
        <p className="text-white text-sm line-clamp-2">
          {`${index + 1}. `}{video.title}
        </p>
      </div>
    </div>
  );
});
