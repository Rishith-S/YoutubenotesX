import express, { Request, Response } from "express"
import verifyAuth from "../middlewares/verifyAuth";
import { notesLimiter } from "../middlewares/rateLimiter";
import multer from "multer";
import path from "path";
import { supabase } from "../config/supabase";
import jwt from 'jsonwebtoken'
import { UserJwtToken } from "./playList";
import prisma from "../config/prismaClient";

const notesRouter = express.Router()

notesRouter.use(notesLimiter);

const storage = multer.memoryStorage();
const upload = multer({ storage });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

notesRouter.post('/uploadFile', upload.single("file"), verifyAuth, async (req: MulterRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: 0, message: "No file uploaded" });
    return;
  }
  try {
    const fileName = `editor-${Date.now()}${path.extname(req.file.originalname)}`;
    const { data, error } = await supabase.storage
      .from("editor-images")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error) throw error;
    // Get public URL
    const { publicUrl } = supabase.storage.from("editor-images").getPublicUrl(fileName).data;

    res.json({
      success: 1,
      file: { url: publicUrl },
    });
  } catch (error) {
    res.status(400).json({ success: 0, message: "No file uploaded" });
    return;
  }
})

notesRouter.post('/deleteFiles', verifyAuth, async (req: Request, res: Response) => {
  const urls = req.body.urls
  try {
    for (const url of urls) {
      const path = url.split("/storage/v1/object/public/editor-images/")[1];
      const { error } = await supabase.storage
        .from("editor-images")
        .remove([path]);
      if (error) {
        console.error("Error deleting image:", error);
        return;
      }
    }

    res.status(200).json({ message: "Images deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to delete images" });
  }
})

notesRouter.get('/getNote/:videoId', verifyAuth, async (req, res) => {
  const jwtToken = req.cookies.jwt;
  const videoId = req.params.videoId
  try {
    const jwtDetails = jwt.decode(jwtToken) as unknown as UserJwtToken;
    const userDetails = await prisma.user.findUnique({
      where: {
        email: jwtDetails.user.email
      }
    })
    if (!userDetails) {
      res.status(404).json({
        "message": "Account not found",
        "success": 0
      })
      return
    }
    const notesDetails = await prisma.videoNotes.findMany({
      where: {
        userId: userDetails.id,
        videoId: videoId as string
      }
    })
    if (!notesDetails || notesDetails.length === 0) {
      res.status(200).json({ "success": 0, "message": "Failed to Load notes" });
      return
    }
    res.status(200).json({ "success": 1, notesDetails:notesDetails[0]});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to Load notes" });
  }
})

notesRouter.post('/setNote/:videoId/:playListId', verifyAuth, async (req, res) => {
  const jwtToken = req.cookies.jwt;
  const videoId = req.params.videoId
  const playListId = req.params.playListId
  const notesContent = req.body.notesContent
  try {
    const jwtDetails = jwt.decode(jwtToken) as unknown as UserJwtToken;
    const userDetails = await prisma.user.findUnique({
      where: {
        email: jwtDetails.user.email
      }
    })
    if (!userDetails) {
      res.status(404).json({
        "message": "Account not found",
        "success": 0
      })
      return
    }
    const existingNote = await prisma.videoNotes.findMany({
      where: {
        userId: userDetails.id,
        videoId: videoId as string
      }
    });

    let notesDetails;
    if (existingNote && existingNote.length>0) {
      notesDetails = await prisma.videoNotes.update({
        where: {
          id: existingNote[0].id
        },
        data: {
          notesContent
        }
      });
    } else {
      notesDetails = await prisma.videoNotes.create({
        data: {
          userId: userDetails.id,
          videoId: videoId as string,
          playlistId: Number(playListId),
          notesContent
        }
      });
    }
    if (!notesDetails) {
      res.status(500).json({ "success": 0, "message": "Failed to Load notes" });
      return
    }
    res.status(200).json({ "success": 1, "message": "notes created and updated" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to Load notes" });
  }
})



export default notesRouter;