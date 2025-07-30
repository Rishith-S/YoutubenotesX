"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyAuth_1 = __importDefault(require("../middlewares/verifyAuth"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const supabase_1 = require("../config/supabase");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const notesRouter = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
notesRouter.post('/uploadFile', upload.single("file"), verifyAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).json({ success: 0, message: "No file uploaded" });
        return;
    }
    try {
        const fileName = `editor-${Date.now()}${path_1.default.extname(req.file.originalname)}`;
        const { data, error } = yield supabase_1.supabase.storage
            .from("editor-images")
            .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
        });
        if (error)
            throw error;
        // Get public URL
        const { publicUrl } = supabase_1.supabase.storage.from("editor-images").getPublicUrl(fileName).data;
        res.json({
            success: 1,
            file: { url: publicUrl },
        });
    }
    catch (error) {
        res.status(400).json({ success: 0, message: "No file uploaded" });
        return;
    }
}));
notesRouter.post('/deleteFiles', verifyAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const urls = req.body.urls;
    try {
        for (const url of urls) {
            const path = url.split("/storage/v1/object/public/editor-images/")[1];
            const { error } = yield supabase_1.supabase.storage
                .from("editor-images")
                .remove([path]);
            if (error) {
                console.error("Error deleting image:", error);
                return;
            }
        }
        res.status(200).json({ message: "Images deleted successfully" });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Failed to delete images" });
    }
}));
notesRouter.get('/getNote/:videoId', verifyAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jwtToken = req.cookies.jwt;
    const videoId = req.params.videoId;
    try {
        const jwtDetails = jsonwebtoken_1.default.decode(jwtToken);
        const userDetails = yield prismaClient_1.default.user.findUnique({
            where: {
                email: jwtDetails.user.email
            }
        });
        if (!userDetails) {
            res.status(404).json({
                "message": "Account not found",
                "success": 0
            });
            return;
        }
        const notesDetails = yield prismaClient_1.default.videoNotes.findMany({
            where: {
                userId: userDetails.id,
                videoId: videoId
            }
        });
        if (!notesDetails || notesDetails.length === 0) {
            res.status(200).json({ "success": 0, "message": "Failed to Load notes" });
            return;
        }
        res.status(200).json({ "success": 1, notesDetails: notesDetails[0] });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Failed to Load notes" });
    }
}));
notesRouter.post('/setNote/:videoId/:playListId', verifyAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jwtToken = req.cookies.jwt;
    const videoId = req.params.videoId;
    const playListId = req.params.playListId;
    const notesContent = req.body.notesContent;
    try {
        const jwtDetails = jsonwebtoken_1.default.decode(jwtToken);
        const userDetails = yield prismaClient_1.default.user.findUnique({
            where: {
                email: jwtDetails.user.email
            }
        });
        if (!userDetails) {
            res.status(404).json({
                "message": "Account not found",
                "success": 0
            });
            return;
        }
        const existingNote = yield prismaClient_1.default.videoNotes.findMany({
            where: {
                userId: userDetails.id,
                videoId: videoId
            }
        });
        let notesDetails;
        if (existingNote && existingNote.length > 0) {
            notesDetails = yield prismaClient_1.default.videoNotes.update({
                where: {
                    id: existingNote[0].id
                },
                data: {
                    notesContent
                }
            });
        }
        else {
            notesDetails = yield prismaClient_1.default.videoNotes.create({
                data: {
                    userId: userDetails.id,
                    videoId: videoId,
                    playlistId: Number(playListId),
                    notesContent
                }
            });
        }
        if (!notesDetails) {
            res.status(500).json({ "success": 0, "message": "Failed to Load notes" });
            return;
        }
        res.status(200).json({ "success": 1, "message": "notes created and updated" });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Failed to Load notes" });
    }
}));
exports.default = notesRouter;
