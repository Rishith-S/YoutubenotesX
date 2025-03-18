import queryString from 'query-string'
import { config } from './config'

export const authParams = queryString.stringify({
  client_id: process.env.GOOGLE_CLIENT_ID,
  redirect_uri: process.env.REDIRECT_URL,
  response_type: 'code',
  scope: 'openid profile email',
  access_type: 'offline',
  state: 'standard_oauth',
  prompt: 'consent',
})
export const getTokenParams = (code: any) =>
  queryString.stringify({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUrl,
  })