"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allowCredentials = (req, res, next) => {
    const origin = req.headers.origin;
    if (origin === 'http://localhost:5173') {
        res.setHeader("Access-Control-Allow-Origin", origin); // Allow only specific origins
        res.setHeader("Access-Control-Allow-Credentials", "true"); // Allow cookies
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        // Handle preflight request
        if (req.method === "OPTIONS") {
            res.sendStatus(204); // Respond OK to preflight
        }
        else {
            next();
        }
    }
    else {
        res.status(403).json({ "message": "No Access" });
    }
};
exports.default = allowCredentials;
