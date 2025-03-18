import express from "express"
import verifyAuth from "../middlewares/verifyAuth"
import jwt from 'jsonwebtoken'
import prisma from "../config/prismaClient"
import axios from "axios"

const playListRouter = express.Router()

export interface UserJwtToken {
  user: {
    name: string,
    email: string,
    picture: string,
  }
  iat: number,
  exp: number
}

playListRouter.get('/addPlaylist/:playListId', verifyAuth, async (req, res) => {
  const playListId = req.params.playListId
  const jwtToken = req.cookies.jwt
  try {
    const jwtDetails = jwt.decode(jwtToken) as unknown as UserJwtToken;
    const userDetails = await prisma.user.findUnique({
      where: {
        email: jwtDetails.user.email
      }
    })
    if (!userDetails) {
      res.status(404).json({
        "message": "Account not found"
      })
      return
    }
    const checkIfPlaylistExists = await prisma.playlist.findMany({
      where: {
        userId: userDetails.id,
        playListId: playListId
      }
    })
    if (checkIfPlaylistExists && checkIfPlaylistExists.length > 0) {
      res.status(404).json({
        "message": "Playlist already exists"
      })
      return
    }
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playListId}&key=${process.env.YOUTUBE_API_KEY}`;
    const url2 = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playListId}&key=${process.env.YOUTUBE_API_KEY}`;
    let nextPageToken = "";
    const response = await axios.get(url);
    const response2 = await axios.get(url2);
    const playListTitle = response2.data.items[0].snippet.title;
    const playListImage = response2.data.items[0].snippet.thumbnails.maxres.url;
    const data = response.data;
    if (data && (data as unknown as any).items) {
      let videoList = (data as unknown as any).items.map(
        (item: {
          snippet: {
            title: string;
            resourceId: { videoId: string };
            thumbnails: {
              default: { url: string; height: number; width: number };
            };
          };
        }) => ({
          title: item.snippet.title,
          videoId: item.snippet.resourceId.videoId,
          videoUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
          thumbnail: item.snippet.thumbnails.default,
          completed: false
        })
      );
      nextPageToken = (data as unknown as any).nextPageToken;
      while (nextPageToken && videoList.length <= 150) {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=${nextPageToken}&playlistId=${playListId}&key=${process.env.YOUTUBE_API_KEY}`;
        const response1 = await axios.get(url);
        nextPageToken = (response1.data as unknown as any).nextPageToken;
        let videoList1 = (response1.data as unknown as any).items.map(
          (item: {
            snippet: {
              title: string;
              resourceId: { videoId: string };
              thumbnails: {
                default: { url: string; height: number; width: number };
              };
            };
          }) => ({
            title: item.snippet.title,
            videoId: item.snippet.resourceId.videoId,
            videoUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
            thumbnail: item.snippet.thumbnails.default,
            completed: false
          })
        );
        videoList = [...videoList, ...videoList1];
      }
      await prisma.playlist.create({
        data: {
          userId: userDetails.id,
          playListId,
          playListTitle,
          playListImage,
          playListContent: videoList
        }
      })
      res.status(200).json({
        "message": "Playlist Added"
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      "message": "Internal Server error"
    })
  }
})

playListRouter.get('/getPlaylists', verifyAuth, async (req, res) => {
  const jwtToken = req.cookies.jwt
  try {
    const jwtDetails = jwt.decode(jwtToken) as unknown as UserJwtToken;
    const userDetails = await prisma.user.findUnique({
      where: {
        email: jwtDetails.user.email
      }
    })
    if (!userDetails) {
      res.status(404).json({
        "message": "Account not found"
      })
      return
    }
    const userPlayLists = await prisma.playlist.findMany({
      where: {
        userId: userDetails.id
      }
    })
    res.status(200).json({
      "playLists": userPlayLists
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      "message": "Internal Server error"
    })
  }
})

playListRouter.get('/getPlaylistVideos/:documentId', verifyAuth, async (req, res) => {
  const documentId = req.params.documentId
  try {
    const playListDetails = await prisma.playlist.findUnique({
      where: {
        id: Number(documentId)
      }
    })
    res.status(200).json({
      "playListDetails": playListDetails
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      "message": "Internal Server error"
    })
  }
})

playListRouter.delete('/deletePlaylist/:playlistDocumentId', verifyAuth, async (req, res) => {
  const documentId = req.params.playlistDocumentId;
  const jwtToken = req.cookies.jwt;
  try {
    const jwtDetails = jwt.decode(jwtToken) as unknown as UserJwtToken;
    const userDetails = await prisma.user.findUnique({
      where: {
        email: jwtDetails.user.email
      }
    })
    if (!userDetails) {
      res.status(404).json({
        "message": "Account not found"
      })
      return
    }
    await prisma.playlist.delete({
      where: {
        id: Number(documentId),
        userId: userDetails?.id
      }
    })
    res.status(200).json({
      "message": "Playlist Deleted"
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      "message": "Internal Server error"
    })
  }
})

playListRouter.get('/markAsCompleted/:playListDocumentId/:videoIndex', verifyAuth, async (req, res) => {
  const playListDocumentId = req.params.playListDocumentId;
  const videoIndex = req.params.videoIndex;
  const jwtToken = req.cookies.jwt
  try {
    const playListDetails = await prisma.playlist.findUnique({
      where: {
        id: Number(playListDocumentId)
      }
    }) as { playListContent: { completed: boolean }[], completedCount: number } | null;
    const jwtDetails = jwt.decode(jwtToken) as unknown as UserJwtToken;
    const userDetails = await prisma.user.findUnique({
      where: {
        email: jwtDetails.user.email
      }
    })
    if (!userDetails) {
      res.status(404).json({
        "message": "Account not found"
      })
      return
    }
    if (!playListDetails) {
      res.status(404).json({
        "message": "PlayList not found"
      })
      return
    }
    // console.log(playListDetails.playListContent)
    const completedStatus = playListDetails.playListContent[Number(videoIndex)].completed;
    await prisma.playlist.update({
      where: {
        id: Number(playListDocumentId)
      },
      data: {
        playListContent: playListDetails.playListContent.map((item: { completed: boolean }, index: number) => {
          if (index === Number(videoIndex)) {
            return { ...item, completed: !item.completed };
          }
          return { ...item, completed: item.completed };
        }),
        completedCount: !completedStatus ? playListDetails.completedCount + 1 : playListDetails.completedCount - 1
      }
    })
    res.status(200).json({ "message": "List Updated" })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      "message": "Internal Server error"
    })
  }
})

export default playListRouter