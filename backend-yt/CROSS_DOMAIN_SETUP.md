# Cross-Domain Cookie Setup

## Environment Variables Required

Add these to your `.env` file:

```env
# Database
DATABASE_URL="your_database_url_here"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# URLs
CLIENT_URL="http://localhost:5173"  # Your frontend URL
REDIRECT_URL_LOGIN="http://localhost:3000/auth/callback/login"
REDIRECT_URL_SIGNUP="http://localhost:3000/auth/callback/signup"

# JWT
TOKEN_SECRET="your_jwt_secret_here"

# Server
PORT=3000

# Cookie Domain (for cross-domain cookies)
# For production with different domains, set this to your domain
# Example: .yourdomain.com (note the leading dot for subdomain support)
# For local development, you can leave this empty or set to localhost
COOKIE_DOMAIN=""
```

## Changes Made

1. **Cookie Settings Updated**:
   - `sameSite: 'none'` - Allows cross-site cookies
   - `secure: true` - Required for cross-site cookies (HTTPS only)
   - `domain: process.env.COOKIE_DOMAIN` - Optional domain setting

2. **CORS Configuration**: Already properly configured in `index.ts`

## Important Notes

### For Development:
- Set `COOKIE_DOMAIN=""` or omit it
- Use HTTPS in development (required for `secure: true`)
- Or temporarily set `secure: false` for HTTP development

### For Production:
- Set `COOKIE_DOMAIN=".yourdomain.com"` (with leading dot)
- Ensure both frontend and backend use HTTPS
- Keep `secure: true`

### Frontend Requirements:
- Ensure your frontend makes requests with `credentials: 'include'`
- Example:
```javascript
fetch('/api/auth/refresh', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
```

## Troubleshooting

1. **Cookies not being sent**: Check that frontend requests include `credentials: 'include'`
2. **CORS errors**: Verify `CLIENT_URL` matches your frontend domain exactly
3. **HTTPS required**: For production, both domains must use HTTPS
4. **Domain mismatch**: Ensure cookie domain is set correctly for your domain structure 