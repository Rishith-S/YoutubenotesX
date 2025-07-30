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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const axios_1 = __importDefault(require("axios"));
const playListRouter = express_1.default.Router();
playListRouter.get('/addPlaylist/:playListId', verifyAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const playListId = req.params.playListId;
    const jwtToken = req.cookies.jwt;
    try {
        const jwtDetails = jsonwebtoken_1.default.decode(jwtToken);
        const userDetails = yield prismaClient_1.default.user.findUnique({
            where: {
                email: jwtDetails.user.email
            }
        });
        if (!userDetails) {
            res.status(404).json({
                "message": "Account not found"
            });
            return;
        }
        const checkIfPlaylistExists = yield prismaClient_1.default.playlist.findMany({
            where: {
                userId: userDetails.id,
                playListId: playListId
            }
        });
        if (checkIfPlaylistExists && checkIfPlaylistExists.length > 0) {
            res.status(404).json({
                "message": "Playlist already exists"
            });
            return;
        }
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playListId}&key=${process.env.YOUTUBE_API_KEY}`;
        const url2 = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playListId}&key=${process.env.YOUTUBE_API_KEY}`;
        let nextPageToken = "";
        const response = yield axios_1.default.get(url);
        const response2 = yield axios_1.default.get(url2);
        const playListTitle = response2.data.items[0].snippet.title;
        const thumbnails = response2.data.items[0].snippet.thumbnails;
        const playListImage = (thumbnails.maxres && thumbnails.maxres.url) ||
            (thumbnails.high && thumbnails.high.url) ||
            (thumbnails.medium && thumbnails.medium.url) ||
            (thumbnails.default && thumbnails.default.url) ||
            "";
        const data = response.data;
        if (data && data.items) {
            let videoList = data.items.map((item) => ({
                title: item.snippet.title,
                videoId: item.snippet.resourceId.videoId,
                videoUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
                thumbnail: item.snippet.thumbnails.default,
                completed: false
            }));
            nextPageToken = data.nextPageToken;
            while (nextPageToken && videoList.length <= 150) {
                const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=${nextPageToken}&playlistId=${playListId}&key=${process.env.YOUTUBE_API_KEY}`;
                const response1 = yield axios_1.default.get(url);
                nextPageToken = response1.data.nextPageToken;
                let videoList1 = response1.data.items.map((item) => ({
                    title: item.snippet.title,
                    videoId: item.snippet.resourceId.videoId,
                    videoUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
                    thumbnail: item.snippet.thumbnails.default,
                    completed: false
                }));
                videoList = [...videoList, ...videoList1];
            }
            yield prismaClient_1.default.playlist.create({
                data: {
                    userId: userDetails.id,
                    playListId,
                    playListTitle,
                    playListImage,
                    playListContent: videoList
                }
            });
            res.status(200).json({
                "message": "Playlist Added"
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            "message": "Internal Server error"
        });
    }
}));
playListRouter.get('/getPlaylists', verifyAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jwtToken = req.cookies.jwt;
    try {
        const jwtDetails = jsonwebtoken_1.default.decode(jwtToken);
        const userDetails = yield prismaClient_1.default.user.findUnique({
            where: {
                email: jwtDetails.user.email
            }
        });
        if (!userDetails) {
            res.status(404).json({
                "message": "Account not found"
            });
            return;
        }
        const userPlayLists = yield prismaClient_1.default.playlist.findMany({
            where: {
                userId: userDetails.id
            }
        });
        res.status(200).json({
            "playLists": userPlayLists
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            "message": "Internal Server error"
        });
    }
}));
playListRouter.get('/getPlaylistVideos/:documentId', verifyAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const documentId = req.params.documentId;
    try {
        const playListDetails = yield prismaClient_1.default.playlist.findUnique({
            where: {
                id: Number(documentId)
            }
        });
        res.status(200).json({
            "playListDetails": playListDetails
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            "message": "Internal Server error"
        });
    }
}));
playListRouter.delete('/deletePlaylist/:playlistDocumentId', verifyAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const documentId = req.params.playlistDocumentId;
    const jwtToken = req.cookies.jwt;
    try {
        const jwtDetails = jsonwebtoken_1.default.decode(jwtToken);
        const userDetails = yield prismaClient_1.default.user.findUnique({
            where: {
                email: jwtDetails.user.email
            }
        });
        if (!userDetails) {
            res.status(404).json({
                "message": "Account not found"
            });
            return;
        }
        yield prismaClient_1.default.playlist.delete({
            where: {
                id: Number(documentId),
                userId: userDetails === null || userDetails === void 0 ? void 0 : userDetails.id
            }
        });
        res.status(200).json({
            "message": "Playlist Deleted"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            "message": "Internal Server error"
        });
    }
}));
playListRouter.get('/markAsCompleted/:playListDocumentId/:videoIndex', verifyAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const playListDocumentId = req.params.playListDocumentId;
    const videoIndex = req.params.videoIndex;
    const jwtToken = req.cookies.jwt;
    try {
        const playListDetails = yield prismaClient_1.default.playlist.findUnique({
            where: {
                id: Number(playListDocumentId)
            }
        });
        const jwtDetails = jsonwebtoken_1.default.decode(jwtToken);
        const userDetails = yield prismaClient_1.default.user.findUnique({
            where: {
                email: jwtDetails.user.email
            }
        });
        if (!userDetails) {
            res.status(404).json({
                "message": "Account not found"
            });
            return;
        }
        if (!playListDetails) {
            res.status(404).json({
                "message": "PlayList not found"
            });
            return;
        }
        // console.log(playListDetails.playListContent)
        const completedStatus = playListDetails.playListContent[Number(videoIndex)].completed;
        yield prismaClient_1.default.playlist.update({
            where: {
                id: Number(playListDocumentId)
            },
            data: {
                playListContent: playListDetails.playListContent.map((item, index) => {
                    if (index === Number(videoIndex)) {
                        return Object.assign(Object.assign({}, item), { completed: !item.completed });
                    }
                    return Object.assign(Object.assign({}, item), { completed: item.completed });
                }),
                completedCount: !completedStatus ? playListDetails.completedCount + 1 : playListDetails.completedCount - 1
            }
        });
        res.status(200).json({ "message": "List Updated" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            "message": "Internal Server error"
        });
    }
}));
exports.default = playListRouter;
