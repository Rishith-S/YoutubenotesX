"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allowCredentials = (req, res, next) => {
    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.sendStatus(204);
        return;
    }
    const origin = req.headers.origin;
    if (origin === process.env.CLIENT_URL) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        next();
    }
    else {
        res.status(403).json({ message: "No Access" });
        return;
    }
};
exports.default = allowCredentials;
