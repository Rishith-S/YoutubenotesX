"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenParams = exports.authParams = void 0;
const query_string_1 = __importDefault(require("query-string"));
const config_1 = require("./config");
exports.authParams = query_string_1.default.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URL,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline',
    state: 'standard_oauth',
    prompt: 'consent',
});
const getTokenParams = (code) => query_string_1.default.stringify({
    client_id: config_1.config.clientId,
    client_secret: config_1.config.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: config_1.config.redirectUrl,
});
exports.getTokenParams = getTokenParams;
