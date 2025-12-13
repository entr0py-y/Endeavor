# SweepX - Real-World Cleanup Game (Nothing UI Edition)

A gamified environmental cleanup application with Nothing OS-inspired design.

## Features

- **Nothing UI Design**: Ultra-minimal black/white/red aesthetic with dot-matrix typography
- **Global Cursor Glow**: Smooth red cursor effect (desktop only)
- **User Authentication**: Username/password login with secure hashed passwords
- **Quest System**: Post trash locations, complete cleanup quests, earn XP
- **Interactive Map**: Real-time quest locations with Leaflet integration
- **Social Features**: Friends system with real-time 1-on-1 chat
- **Leaderboards**: Compete with other users based on XP
- **User Profiles**: Customizable profiles with stats and badges
- **Responsive Design**: Works perfectly on all devices, Safari compatible

## Tech Stack

### Frontend
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Zustand (state management)
- Leaflet (maps)
- Socket.IO Client (real-time chat)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO (WebSocket server)
- JWT authentication
- bcrypt (password hashing)

## Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
MONGODB_URI=mongodb://localhost:27017/sweepx
JWT_SECRET=your_secret_key_change_in_production
PORT=5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. **Install Nothing Font:**
Download the Nothing font from: https://github.com/xeji01/nothingfont
Place the font files in `/public/fonts/`:
- `NothingFont-Regular.woff2`
- `NothingFont-Regular.woff`
- `NothingFont-Bold.woff2`
- `NothingFont-Bold.woff`

4. **Start MongoDB:**
```bash
# If using local MongoDB
mongod
```

5. **Run the application:**

Development mode (both frontend and backend):
```bash
npm run dev:all
```

Or run separately:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run dev
```

6. **Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

### First Time Setup

1. Visit http://localhost:3000
2. Click "SIGN UP" to create an account
3. Or click "CONTINUE AS GUEST" to explore

### Posting Quests

1. Navigate to Dashboard
2. Click "POST A QUEST"
3. Fill in title and description
4. Allow location access
5. Submit quest

### Completing Quests

1. View open quests on Dashboard or Map
2. Click on a quest to view details
3. Upload an "after" photo
4. Earn XP instantly

### Social Features

1. Go to "FRIENDS" page
2. Search for users by username
3. Send friend requests
4. Chat with friends in real-time

## Project Structure

```
/
├── components/          # React components
│   ├── Card.tsx        # Reusable card component
│   ├── CursorGlow.tsx  # Global cursor effect
│   ├── Footer.tsx      # Footer component
│   └── Map.tsx         # Leaflet map component
├── pages/              # Next.js pages
│   ├── index.tsx       # Login page
│   ├── dashboard.tsx   # Main dashboard
│   ├── profile.tsx     # User profile
│   ├── leaderboard.tsx # Rankings
│   ├── friends.tsx     # Social features
│   └── support.tsx     # Support page
├── server/             # Backend
│   ├── index.js        # Express + Socket.IO server
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   └── middleware/     # Auth middleware
├── store/              # State management
├── lib/                # Utilities
├── styles/             # Global CSS
└── public/             # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/guest` - Guest login

### Users
- `GET /api/users/profile/:username` - Get profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/leaderboard` - Get rankings
- `GET /api/users/search` - Search users

### Quests
- `GET /api/quests` - List quests
- `POST /api/quests` - Create quest
- `POST /api/quests/:id/complete` - Complete quest
- `DELETE /api/quests/:id` - Delete quest

### Friends
- `GET /api/friends` - List friends
- `GET /api/friends/requests` - Get friend requests
- `POST /api/friends/request/:username` - Send request
- `POST /api/friends/accept/:userId` - Accept request
- `POST /api/friends/decline/:userId` - Decline request
- `DELETE /api/friends/:userId` - Remove friend

### Chat
- `GET /api/chat/:userId` - Get conversation
- `POST /api/chat` - Send message
- `GET /api/chat/unread/count` - Unread count
- `GET /api/chat/conversations/list` - List conversations

## Design Philosophy

### Nothing UI Principles
- Pure black/white/red color scheme
- Dot-matrix typography
- Thin borders (1px, rgba(255,255,255,0.15))
- Large spacing (3rem padding, 3rem margins)
- Maximum 3 cards per row
- Subtle, intentional animations
- Human-crafted feel (no AI-looking designs)

### Humanization
All UI text, buttons, and interactions use natural, human language:
- "Welcome back!" instead of "Login successful"
- "Something went wrong" instead of "Error: 500"
- "Let others help clean it up" instead of "Submit location data"

## Browser Compatibility

Tested and optimized for:
- Safari (MacBook Air M1) ✓
- Chrome ✓
- Firefox ✓
- Edge ✓
- Mobile browsers ✓

## Support

For support or inquiries, connect with the developer:
- Instagram: [@yeagr.art](https://instagram.com/yeagr.art)

## License

© 2025 SweepX - All Rights Reserved

---

Built with care for a cleaner planet 🌍
