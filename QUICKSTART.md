# SweepX - Quick Start Guide

## Installation (3 steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` with your MongoDB URI.

### 3. Run the App
```bash
# Start both frontend and backend
npm run dev:all
```

Visit: http://localhost:3000

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod`
- Or use MongoDB Atlas and update MONGODB_URI in .env

### Nothing Font Missing
- Download from: https://github.com/xeji01/nothingfont
- Place in: `public/fonts/`
- App will work with fallback fonts if missing

### Port Already in Use
- Frontend (3000): Change in next.config.js
- Backend (5000): Change PORT in .env

### TypeScript Errors
- Run: `npm install`
- Restart VS Code
- Errors will resolve once all dependencies are installed

## Default Test Account
After first run, create an account or use guest mode.

## Need Help?
Instagram: @yeagr.art
