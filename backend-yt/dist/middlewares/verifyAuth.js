"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const verifyAuth = (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token)
            res.status(401).json({ message: 'Unauthorized' });
        else {
            jsonwebtoken_1.default.verify(token, config_1.config.tokenSecret);
            next();
        }
    }
    catch (err) {
        console.error('Error: ', err);
        res.status(401).json({ message: 'Unauthorized' });
    }
};
exports.default = verifyAuth;
