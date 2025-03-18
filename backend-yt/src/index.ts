import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import allowCredentials from "./middlewares/allowCredentials";
import authRouter from "./routes/auth";
import playListRouter from "./routes/playList";
import notesRouter from "./routes/notes";

const app = express()

dotenv.config()
app.use(cors({
  origin: process.env.CLIENT_URL!,
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use(allowCredentials)

app.get('/',(req,res)=>{
  res.status(200).json({'message':'hello'})
})

app.use('/auth', authRouter)
app.use('/playList', playListRouter)
app.use('/notes', notesRouter)

app.listen(process.env.PORT,()=>{
  console.log(`connected to port ${process.env.PORT}`)
})