import React, { useEffect, useState } from "react";
import CloseButton from "../assets/CloseButton";
import RightArrow from "../assets/RightArrow";
import TickIcon from "../assets/TickIcon";
import { IVideos, Playlists } from "../screens/Homescreen";
import axios from "axios";
import LoadingScreen from "./LoadingScreen";

export default function Sidebar({
  selectedVideo,
  showSidebar,
  setSelectedVideo,
  setShowSidebar,
}: {
  selectedVideo: number;
  showSidebar: boolean;
  setSelectedVideo: React.Dispatch<React.SetStateAction<number>>;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  if (!localStorage.getItem("playListDetails")) return <LoadingScreen />;

  const playListDetails = JSON.parse(
    localStorage.getItem("playListDetails")!
  ) as unknown as Playlists;

  return (
    <div
      className={`${
        showSidebar ? "w-screen md:w-full lg:w-[75%]" : "w-14"
      } bg-black border-r-[0.5px] border-gray-500 duration-500 transition-all ease-in-out relative`}
    >
      <div className={`${!showSidebar && "scale-0"}`}>
        <div className="flex flex-row justify-between border-b-2 border-gray-500">
          <div
            className={`p-4 flex flex-row items-center justify-between w-full bg-gray-900`}
          >
            <p className="text-white text-xl p-4">Playlist Videos</p>
            <div
              className="cursor-pointer"
              onClick={() => {
                setShowSidebar(false);
              }}
            >
              <CloseButton />
            </div>
          </div>
        </div>
        <div
          className={`p-4 h-[83vh] overflow-auto transition-all duration-500`}
        >
          {playListDetails &&
          playListDetails.playListContent &&
          playListDetails.playListContent.length > 0 ? (
            playListDetails.playListContent.map((video, index) => (
              <IndividualVideoCard
                selectedVideo={selectedVideo}
                index={index}
                setSelectedVideo={setSelectedVideo}
                key={index}
                video={video}
                playListDocumentId={playListDetails.id}
              />
            ))
          ) : (
            <></>
          )}
        </div>
      </div>
      <div
        onClick={() => {
          setShowSidebar(true);
        }}
        className={`cursor-pointer absolute top-0 right-4 ${
          showSidebar && "scale-0"
        } `}
      >
        <RightArrow />
      </div>
    </div>
  );
}

export function IndividualVideoCard({
  index,
  selectedVideo,
  setSelectedVideo,
  playListDocumentId,
}: {
  index: number;
  video: IVideos;
  selectedVideo: number;
  setSelectedVideo: React.Dispatch<React.SetStateAction<number>>;
  playListDocumentId: number;
}) {
  const [video, setVideo] = useState<IVideos>(
    (
      JSON.parse(
        localStorage.getItem("playListDetails")!
      ) as unknown as Playlists
    ).playListContent[index]
  );
  return (
    <div className="flex flex-row items-center gap-4">
      <div
        className={`w-5 h-5 flex items-center justify-center rounded-md border-2 cursor-pointer
        bg-white border-white`}
        onClick={async () => {
          try {
            // Retrieve current playlist details
            const currentPlayListDetails = JSON.parse(
              localStorage.getItem("playListDetails")!
            ) as Playlists;

            // Update the specific video completion status
            const updatedPlayListContent =
              currentPlayListDetails.playListContent.map((item, indexItem) => {
                if (indexItem === index) {
                  return { ...item, completed: !item.completed };
                }
                return item;
              });

            // Store the updated playlist details in localStorage
            const updatedPlayListDetails = {
              ...currentPlayListDetails,
              playListContent: updatedPlayListContent,
            };

            localStorage.setItem(
              "playListDetails",
              JSON.stringify(updatedPlayListDetails)
            );

            // Update the video state
            setVideo(updatedPlayListContent[index]);
            await axios.get(
              `${
                import.meta.env.VITE_SERVER_URL
              }/playList/markAsCompleted/${playListDocumentId}/${index}`,
              { withCredentials: true }
            );
          } catch (error) {
            console.log(error);
            const currentPlayListDetails = JSON.parse(
              localStorage.getItem("playListDetails")!
            ) as Playlists;

            // Update the specific video completion status
            const updatedPlayListContent =
              currentPlayListDetails.playListContent.map((item, indexItem) => {
                if (indexItem === index) {
                  return { ...item, completed: !item.completed };
                }
                return item;
              });

            // Store the updated playlist details in localStorage
            const updatedPlayListDetails = {
              ...currentPlayListDetails,
              playListContent: updatedPlayListContent,
            };

            localStorage.setItem(
              "playListDetails",
              JSON.stringify(updatedPlayListDetails)
            );

            // Update the video state
            setVideo(updatedPlayListContent[index]);
          }
        }}
      >
        {video.completed && <TickIcon />}
      </div>
      <div
        className={`flex flex-row gap-4 p-4 hover:bg-gray-700 w-full rounded-lg cursor-pointer ${
          selectedVideo == index
            ? "bg-gradient-to-r from-pink-950 via-violet-950 to-blue-950"
            : ""
        }`}
        onClick={() => setSelectedVideo(index)}
      >
        <img
          src={video.thumbnail.url}
          className="rounded-lg object-stretch"
          alt="thumbnail"
        />
        <p className="text-white">
          {`${index + 1}.`}
          {video.title}
        </p>
      </div>
    </div>
  );
}
