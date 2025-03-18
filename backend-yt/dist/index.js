"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const allowCredentials_1 = __importDefault(require("./middlewares/allowCredentials"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)({
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(allowCredentials_1.default);
app.get('/', (req, res) => {
    res.status(200).json({ 'message': 'hello' });
});
app.use('/auth', auth_1.default);
app.listen(process.env.PORT, () => {
    console.log(`connected to port ${process.env.PORT}`);
});
