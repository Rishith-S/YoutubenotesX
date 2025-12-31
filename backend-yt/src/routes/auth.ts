import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import queryString from 'query-string';
import { config } from '../config/config';
import prisma from '../config/prismaClient';
import verifyAuth from '../middlewares/verifyAuth';
import { authLimiter } from '../middlewares/rateLimiter';
import bcrypt from 'bcrypt';

const authRouter = Router()

authRouter.get('/hello', (req, res) => {
  res.status(200).json({ "message": "hello" })
})

authRouter.get('/url/:type', (req, res) => {
  const type = req.params.type
  res.json({
    url: `${config.authUrl}?${queryString.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: type === "login" ? process.env.REDIRECT_URL_LOGIN : process.env.REDIRECT_URL_SIGNUP,
      response_type: 'code',
      scope: 'openid profile email',
      access_type: 'offline',
      state: 'standard_oauth',
      prompt: 'consent',
    })}`,
  })
})

authRouter.get('/refresh', verifyAuth, async (req, res) => {
  const token = req.cookies?.jwt;
  if (!token) {
    res.sendStatus(401);
    return
  }
  const { email, name, picture } = jwt.decode(token) as jwt.JwtPayload;
  const user = { name, email, picture }
  const accessToken = jwt.sign(
    {
      user
    },
    process.env.TOKEN_SECRET!, ({ expiresIn: '1d' })
  )
  res.send({ name: user.name, email: user.email, accessToken });
})

authRouter.get('/token', authLimiter, async (req: Request, res: Response) => {
  const { code, type } = req.query
  if (!code) res.status(400).json({ message: 'Authorization code must be provided' })
  else {
    try {
      const data = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: type === "login" ? process.env.REDIRECT_URL_LOGIN : process.env.REDIRECT_URL_SIGNUP,
      }
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json", // Ensure JSON format is recognized
        },
      });
      const access_token_data = await response.json();
      const id_token = access_token_data.id_token
      if (!id_token) {
        res.status(400).json({ message: 'Auth error' });
        return
      }
      const { email, name, picture } = jwt.decode(id_token) as jwt.JwtPayload;
      const user = { name, email, picture }
      let message = '';
      let statusCode = 200;
      if(type === 'login') {
        const userRecord = await prisma.user.findUnique({
          where: {
            email : user.email
          }
        })
        if(!userRecord){
          res.status(404).json({
            "message" : "account not found please signup"
          })
          return
        }
        else {
          statusCode = 200;
          message = "account login successful";
        }
      } else {
        try {
          await prisma.user.create({
            data : {
              name: user.name,
              email: user.email,
              accountType : 'oauth'
            }
          })
          statusCode = 200;
          message = "account created successfully";
        } catch (error) {
          res.status(422).json({
            "message": "problem in account creation"
          })
          return
        }
      }
      const accessToken = jwt.sign(
        {
          user
        },
        process.env.TOKEN_SECRET!, ({ expiresIn: '1d' })
      )
      const refreshToken = jwt.sign(
        {
          user
        },
        process.env.TOKEN_SECRET!, ({ expiresIn: '3d' })
      )
      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });
      res.status(statusCode).send({ name: user.name, email: user.email, accessToken, message });
    } catch (err) {
      console.error('Error: ', err)
      res.status(500).json({ message: 'Server error' })
    }
  }
})

// Apply strict rate limiting to signup endpoint
authRouter.post('/signup', authLimiter, async(req,res)=>{
  const {name,email,password} = req.body
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!name || !email || !password || name === "" || email === "" || password === "" || !emailRegex.test(email)){
    res.status(400).json({
      "message" : "name, email and password are required"
    })
    return
  }
  const hashedPassword = await bcrypt.hash(password,10)
  const user = await prisma.user.create({
    data : {
      name,
      email,
      password : hashedPassword,
      accountType : 'email'
    }
  })
  const accessToken = jwt.sign(
    {
      user
    },
    process.env.TOKEN_SECRET!, ({ expiresIn: '1d' })
  )
  res.status(200).json({
    "message" : "account created successfully",
    "accessToken" : accessToken
  })
})

authRouter.post('/login', authLimiter, async(req,res)=>{
  const {email,password} = req.body
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !password || email === "" || password === "" || !emailRegex.test(email)) {
    res.status(400).json({
      "message" : "email and password are required"
    })
    return
  }
  const user = await prisma.user.findUnique({
    where : {
      email
    }
  })
  if(!user){
    res.status(404).json({
      "message" : "account not found please signup"
    })
    return
  }
  else{}
    const isPasswordValid = await bcrypt.compare(password,user.password!)
    if(!isPasswordValid){
      res.status(401).json({
        "message" : "invalid password"
      })
      return
    }
  
  const accessToken = jwt.sign(
    {
      user
    },
    process.env.TOKEN_SECRET!, ({ expiresIn: '1d' })
  )
  res.status(200).json({
    "message" : "account login successful",
    "accessToken" : accessToken
  })
})

authRouter.post('/logout', (_, res) => {
  res.clearCookie('token').json({ message: 'Logged out' })
})

export default authRouter;