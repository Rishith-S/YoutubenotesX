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
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const query_string_1 = __importDefault(require("query-string"));
const config_1 = require("../config/config");
const verifyAuth_1 = __importDefault(require("../middlewares/verifyAuth"));
const authRouter = (0, express_1.Router)();
authRouter.get('/hello', (req, res) => {
    res.status(200).json({ "message": "hello" });
});
authRouter.get('/url', (_, res) => {
    res.json({
        url: `${config_1.config.authUrl}?${query_string_1.default.stringify({
            client_id: process.env.GOOGLE_CLIENT_ID,
            redirect_uri: process.env.REDIRECT_URL,
            response_type: 'code',
            scope: 'openid profile email',
            access_type: 'offline',
            state: 'standard_oauth',
            prompt: 'consent',
        })}`,
    });
});
authRouter.get('/refresh', verifyAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.jwt;
    if (!token) {
        res.sendStatus(401);
        return;
    }
    const { email, name, picture } = jsonwebtoken_1.default.decode(token);
    const user = { name, email, picture };
    // Sign a new token
    const accessToken = jsonwebtoken_1.default.sign({
        user
    }, process.env.TOKEN_SECRET, ({ expiresIn: '1d' }));
    res.send({ name: user.name, email: user.email, accessToken });
}));
authRouter.get('/token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    if (!code)
        res.status(400).json({ message: 'Authorization code must be provided' });
    else {
        try {
            const data = {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.REDIRECT_URL,
            };
            const response = yield fetch('https://oauth2.googleapis.com/token', {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json", // Ensure JSON format is recognized
                },
            });
            const access_token_data = yield response.json();
            const id_token = access_token_data.id_token;
            if (!id_token) {
                res.status(400).json({ message: 'Auth error' });
                return;
            }
            const { email, name, picture } = jsonwebtoken_1.default.decode(id_token);
            const user = { name, email, picture };
            // Sign a new token
            const accessToken = jsonwebtoken_1.default.sign({
                user
            }, process.env.TOKEN_SECRET, ({ expiresIn: '1d' }));
            const refreshToken = jsonwebtoken_1.default.sign({
                user
            }, process.env.TOKEN_SECRET, ({ expiresIn: '3d' }));
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                maxAge: 3 * 24 * 60 * 60 * 1000
            });
            res.send({ name: user.name, email: user.email, accessToken });
        }
        catch (err) {
            console.error('Error: ', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
}));
authRouter.get('/logged_in', (req, res) => {
    try {
        // Get token from cookie
        const token = req.cookies.token;
        if (!token)
            res.json({ loggedIn: false });
        else {
            const { user } = jsonwebtoken_1.default.verify(token, config_1.config.tokenSecret);
            const newToken = jsonwebtoken_1.default.sign({ user }, config_1.config.tokenSecret, {
                expiresIn: config_1.config.tokenExpiration,
            });
            // Reset token in cookie
            res.cookie('token', newToken, {
                maxAge: config_1.config.tokenExpiration,
                httpOnly: true,
            });
            res.json({ loggedIn: true, user });
        }
    }
    catch (err) {
        res.json({ loggedIn: false });
    }
});
authRouter.post('/logout', (_, res) => {
    // clear cookie
    res.clearCookie('token').json({ message: 'Logged out' });
});
exports.default = authRouter;
