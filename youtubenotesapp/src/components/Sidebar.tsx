import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { IVideos, Playlists } from "../screens/Homescreen";
import LoadingScreen from "./LoadingScreen";
import { X, ChevronRight, Check, PlayCircle } from "lucide-react";

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
      <div className="w-14 h-full bg-zinc-950 border-r border-zinc-800 flex items-center justify-center">
        <div className="text-red-400 text-xs text-center p-2">
          {error || "No data available"}
        </div>
      </div>
    );
  }

  const videoCount = playListDetails.playListContent?.length || 0;

  return (
    <div
      ref={sidebarRef}
      className={`${showSidebar ? "w-screen md:w-full" : "w-14"
        } bg-zinc-950 border-r border-zinc-800 duration-500 transition-all ease-in-out relative h-full flex flex-col`}
      role="complementary"
      aria-label="Playlist sidebar"
    >
      <div className={`${!showSidebar && "scale-0"} h-full flex flex-col overflow-hidden`}>
        <div className="flex flex-row justify-between border-b border-zinc-800">
          <div className="p-4 flex flex-row items-center justify-between w-full bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center">
                <PlayCircle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-white text-lg font-semibold">
                Playlist Videos <span className="text-zinc-500 text-sm font-normal">({videoCount})</span>
              </p>
            </div>
            <button
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={() => setShowSidebar(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-zinc-400 hover:text-white" />
            </button>
          </div>
        </div>
        <div
          ref={scrollContainerRef}
          className="p-4 overflow-auto bg-zinc-950 flex-1"
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
            <div className="text-zinc-500 text-center p-4">
              No videos in playlist
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => setShowSidebar(true)}
        className={`p-2 hover:bg-zinc-800 rounded-lg transition-colors absolute top-2 right-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
          showSidebar && "scale-0"
        }`}
        aria-label="Open sidebar"
      >
        <ChevronRight className="w-5 h-5 text-zinc-400 hover:text-white" />
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
    <div ref={ref} className="flex flex-row items-center gap-3 mb-2" role="listitem">
      <button
        className={`w-5 h-5 flex items-center justify-center rounded-md border-2 transition-all
          ${video.completed 
            ? 'bg-red-600 border-red-600' 
            : 'bg-transparent border-zinc-700 hover:border-zinc-600'
          }
          focus:outline-none focus:ring-2 focus:ring-red-500
          ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={handleToggleCompletion}
        disabled={isUpdating}
        aria-label={`${video.completed ? 'Mark as incomplete' : 'Mark as complete'} for ${video.title}`}
      >
        {video.completed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
      </button>
      <div
        className={`flex flex-row gap-3 p-3 hover:bg-zinc-900/50 w-full rounded-xl cursor-pointer transition-all
          ${isSelected 
            ? "bg-zinc-900 border border-zinc-800 shadow-lg" 
            : "border border-transparent hover:border-zinc-800"
          }
          focus:outline-none focus:ring-2 focus:ring-red-500`}
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
        <div className="relative flex-shrink-0">
          <img
            src={video.thumbnail.url}
            className="rounded-lg object-cover w-28 h-16 border border-zinc-800"
            alt={`Thumbnail for ${video.title}`}
            loading="lazy"
          />
          {isSelected && (
            <div className="absolute inset-0 bg-red-600/20 rounded-lg border-2 border-red-600" />
          )}
        </div>
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <p className={`text-sm line-clamp-2 ${isSelected ? 'text-white font-medium' : 'text-zinc-300'}`}>
            <span className="text-zinc-500 font-normal">{index + 1}.</span> {video.title}
          </p>
        </div>
      </div>
    </div>
  );
});
