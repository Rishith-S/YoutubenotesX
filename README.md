# NoteTube - Distraction-Free YouTube Learning Platform


https://github.com/user-attachments/assets/419d9045-7106-4b6e-828b-4af8b6963091



A minimalist web application designed for serious learners who want to take structured notes while watching YouTube playlists without distractions.

## Project Overview

NoteTube is a full-stack application that provides a clean, focused environment for educational content consumption. The platform eliminates YouTube's ads, recommendations, and other distractions, allowing students and self-learners to concentrate solely on the content that matters.

## Key Features

### Distraction-Free Learning Environment
- Clean interface with no advertisements or recommended videos
- Split-screen layout for simultaneous video viewing and note-taking
- Multiple view modes: theater mode, split view, and default layout
- Dark theme optimized for extended study sessions

### Smart Playlist Management
- Import entire YouTube playlists with a single URL
- Create custom playlists and add individual videos
- Progress tracking with completion checkmarks for each video
- Organized sidebar navigation across all videos in a playlist

### Rich Note-Taking Experience
- Markdown-based editor with support for:
  - Code blocks with syntax highlighting
  - Tables and lists
  - Images and links
  - Headers and formatting
- Auto-save functionality with cloud synchronization
- Notes are permanently linked to specific videos

### User Management
- Secure authentication powered by Supabase
- Persistent login sessions
- Personal workspace for all playlists and notes

## Technology Stack

### Frontend
- React 18 with TypeScript for type-safe component development
- Vite as the build tool for fast development experience
- TailwindCSS for utility-first styling
- Redux for state management
- React Router for client-side routing
- EditorJS for the rich text editing experience
- Lucide React for consistent iconography

### Backend
- Node.js with Express framework
- TypeScript for type safety across the backend
- Prisma ORM for database operations
- PostgreSQL database
- Supabase for authentication and cloud storage
- YouTube Data API v3 for fetching playlist and video metadata

## Project Structure

```
ytnotes/
├── backend-yt/              # Backend API server
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── middlewares/     # Authentication and CORS
│   │   └── routes/          # API endpoints
│   └── prisma/              # Database schema and migrations
│
└── youtubenotesapp/         # Frontend React application
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── screens/         # Page components
    │   ├── features/        # Redux slices
    │   └── hooks/           # Custom React hooks
    └── public/              # Static assets
```

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- YouTube Data API key
- Supabase account

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend-yt
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
DATABASE_URL="your_postgresql_connection_string"
YOUTUBE_API_KEY="your_youtube_api_key"
SUPABASE_URL="your_supabase_url"
SUPABASE_KEY="your_supabase_anon_key"
JWT_SECRET="your_jwt_secret"
```

4. Run Prisma migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd youtubenotesapp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with:
```
VITE_API_URL="http://localhost:3000"
VITE_SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`.

## Usage Guide

### Getting Started
1. Create an account or sign in using the authentication page
2. You'll be redirected to the home dashboard

### Adding Content
1. Click the "Add Video" button on the home screen
2. Choose between:
   - YouTube Playlist: Paste a playlist URL to import all videos
   - Custom Playlist: Create your own playlist with a custom name

### Taking Notes
1. Select any video from your playlists
2. The video will load in the main viewing area
3. Use the notes editor on the right/bottom to write markdown notes
4. Your notes are automatically saved to the cloud
5. Use the view mode buttons to adjust the layout as needed

### Managing Progress
1. Click the checkbox next to any video to mark it as complete
2. Track your progress across entire playlists
3. Return to any video to review or update your notes

## Database Schema

The application uses PostgreSQL with the following main tables:

- **User**: Stores user authentication data
- **PlayList**: Contains playlist metadata and video information
- **Notes**: Stores note content linked to specific videos and users

Refer to `backend-yt/prisma/schema.prisma` for the complete schema definition.

## API Endpoints

### Authentication
- `POST /auth/register` - Create new user account
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

### Playlists
- `GET /playlist/getPlaylists` - Fetch user's playlists
- `POST /playlist/addPlaylist/:playListId` - Import YouTube playlist
- `POST /playlist/createCustomPlaylist` - Create custom playlist
- `POST /playlist/addVideoToPlaylist/:playlistId` - Add video to existing playlist

### Notes
- `GET /notes/getNote/:videoId/:playListId` - Retrieve notes for a video
- `POST /notes/setNote/:videoId/:playListId` - Save or update notes

## Contributing

This project was developed as an academic project. If you're a fellow student or developer interested in contributing:

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Test thoroughly
5. Submit a pull request

## Future Enhancements

- Video timestamp linking in notes
- Export notes to PDF or Markdown files
- Collaborative playlists and shared notes
- Mobile responsive design improvements
- Offline mode with local caching
- Video playback speed controls
- Keyboard shortcuts for common actions


Developed with dedication to improving the online learning experience for students everywhere.
