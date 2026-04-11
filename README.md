# 💬 JourneyChat

> **A full-stack real-time chat application** with video calls, whiteboards, voice messages, and beautiful seasonal themes.

![JourneyChat Banner](https://img.shields.io/badge/JourneyChat-v1.0.0-00F5FF?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-React-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## ✨ Features

### 💬 Messaging
- **Private one-on-one chats** — real-time delivery via Socket.IO
- **Global chat room** — talk to all online users simultaneously
- **Message reactions** — quick emoji reactions (👍 ❤️ 😂 😮 😢 🙏 🔥 ✨)
- **Reply to messages** — inline threading with quoted context
- **Voice messages** — record and send audio clips
- **Image & file sharing** — upload photos and documents (Cloudinary)
- **Message editing** — local edit with "edited" indicator
- **Message deletion** — sender can delete their own messages
- **Typing indicators** — animated dots when someone is typing
- **Read receipts** & **online presence** indicators

### 📹 Video & Audio Calls
- **HD video calls** powered by [Agora SDK](https://www.agora.io/)
- **Audio-only calls** for lightweight conversations
- **Incoming call screen** with accept / decline
- **Mute / camera toggle / speaker toggle** during call
- **Picture-in-picture** local video preview

### 🎨 Collaborative Tools
- **Real-time shared whiteboard** — draw together using pen, marker, shapes, text, eraser, fill
- **11 drawing tools** — pen, marker, line, arrow, rectangle, circle, triangle, text, eraser, fill, select
- **Tic-Tac-Toe game** embedded in the whiteboard panel
- **Sticky Notes** — personal notepad that lives in the app
- **Board persistence** — whiteboard state saved to MongoDB

### 🎨 16 Themes + 4 Seasonal Particle Themes
| Theme | Style |
|---|---|
| 🌐 Cyber Neon | Electric blue & cyan (default) |
| 🌙 Midnight Purple | Deep violet & rose |
| 🌊 Ocean Deep | Navy & teal waves |
| 💻 Matrix | Enter the simulation |
| 🌅 Sunset Blaze | Orange & pink fire |
| 🌌 Aurora | Northern lights dance |
| 💎 Rose Gold | Warm rose & amber |
| 🌌 Galaxy | Deep space & stars |
| 🩸 Blood Moon | Crimson & amber |
| 🧊 Arctic | Clean ice & light (light mode) |
| 🌿 Forest Dark | Emerald & gold |
| 🌋 Volcano | Lava & dark obsidian |
| 🌸 **Sakura** | Cherry blossom petals rain down |
| ☀️ **Summer** | Golden sparkles & sun flares |
| ❄️ **Winter** | Beautiful snowflakes fall |
| 🌿 **Spring** | Leaves & flower petals drift |

> Seasonal themes feature **live particle animations** — petals, snowflakes, sparkles, and leaves rain across the entire app in real time.

### 🔤 12 Font Options
Poppins · Sora · Orbitron · Space Grotesk · DM Sans · Outfit · Nunito · Raleway · Exo 2 · Plus Jakarta Sans · Josefin Sans · Cabin

### 🔐 Authentication
- JWT-based auth with **"Keep me signed in"** (15-day tokens) or session-only (24h)
- **Multi-account switcher** — save and switch between accounts
- **Avatar upload** via Cloudinary
- **Profile editing** — name, bio, photo
- **Password change** with strength meter
- **Token auto-refresh** on background tab activity

---

## 🗂️ Project Structure

```
ChattingApp/
├── realtime-chat-backend/          # Express + Socket.IO server
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── WhiteboardState.js
│   ├── routes/
│   │   ├── auth_route.js
│   │   ├── users.js
│   │   ├── messages.js
│   │   ├── agora.js
│   │   └── whiteboard.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── .env
│
└── realtime-chat-frontend/         # React + Vite frontend
    └── src/
        ├── App.jsx                 # Router + SeasonalParticles mount point
        ├── index.css               # Global styles + 12 font imports
        ├── components/
        │   ├── auth/
        │   │   ├── Login.jsx
        │   │   └── Register.jsx
        │   ├── chat/
        │   │   ├── ChatWindow.jsx
        │   │   ├── DateSeparator.jsx
        │   │   ├── ReplyBar.jsx
        │   │   └── VoiceRecorder.jsx
        │   ├── SeasonalParticles.jsx   # ✨ Seasonal particle engine
        │   ├── Sidebar.jsx
        │   ├── ChatBubble.jsx
        │   ├── VideoCall.jsx
        │   ├── Whiteboard.jsx
        │   ├── StickyNotes.jsx
        │   ├── IncomingCall.jsx
        │   ├── SettingsPanel.jsx
        │   └── AvatarUploader.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   ├── ChatContext.jsx
        │   └── ThemeContext.jsx        # 16 themes, 12 fonts, particle config
        ├── pages/
        │   └── Dashboard.jsx
        └── utils/
            └── api.js
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **MongoDB Atlas** account (free tier works perfectly)
- **Agora** account — for video/audio calls ([agora.io](https://www.agora.io/))
- **Cloudinary** account — for image/avatar uploads ([cloudinary.com](https://cloudinary.com/))

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/JourneyChat.git
cd JourneyChat
```

---

### 2. Backend setup

```bash
cd realtime-chat-backend
npm install
```

Create a `.env` file:

```env
# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/chatApp?retryWrites=true&w=majority

# JWT — generate a strong secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_here

# Agora (video calls) — get from https://console.agora.io
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate

# Cloudinary (image uploads) — get from https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
```

Start the backend:

```bash
npm run dev    # development (nodemon)
# or
npm start      # production
```

---

### 3. Frontend setup

```bash
cd ../realtime-chat-frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔧 Environment Variables Reference

### Backend (`realtime-chat-backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `AGORA_APP_ID` | ✅ | Agora App ID for calls |
| `AGORA_APP_CERTIFICATE` | ✅ | Agora certificate for token generation |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `FRONTEND_ORIGIN` | ✅ | Frontend URL for CORS |
| `PORT` | ✅ | Backend port (default: 5000) |

### Frontend (`realtime-chat-frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend API URL |

---

## 🎨 Customising Themes

The theme engine lives in `src/context/ThemeContext.jsx`.

### Adding a new theme

1. Add an entry to the `THEMES` array:

```js
{
  id: "my-theme",
  label: "My Theme",
  desc: "Short description",
  preview: ["#BG_COLOR", "#PRIMARY", "#SECONDARY"],
  dark: true,
  particles: null,   // or "sakura" | "summer" | "winter" | "spring"
}
```

2. Add the corresponding CSS variable map to `THEME_VARS`:

```js
"my-theme": {
  "--t-bg":        "#...",
  "--t-primary":   "#...",
  // ... (see existing themes for all required vars)
}
```

### Adding a new particle effect

Add a config object to `CONFIGS` in `src/components/SeasonalParticles.jsx`:

```js
"my-particle": {
  count: 40,
  colors: ["#color1", "#color2"],
  draw(ctx, p) { /* Canvas 2D drawing code */ },
  sizeRange: [4, 10],
  speedRange: [0.5, 1.5],
  swayRange: [0.4, 1.0],
  rotSpeedRange: [0.005, 0.025],
}
```

Then set `particles: "my-particle"` on your theme entry.

---

## 📱 Mobile Support

JourneyChat is fully responsive. The sidebar collapses to a slide-out drawer on small screens, accessible via the ☰ hamburger button. All features work on mobile browsers.

---

## 🛡️ Security Notes

- Passwords are hashed with **bcrypt** (rounds: 10)
- All protected API routes require a valid JWT via `Authorization: Bearer <token>`
- Expired tokens return `401` with a `code` field — the frontend automatically clears the token and redirects to `/login`
- CORS is locked to `FRONTEND_ORIGIN` only
- **Never commit your `.env` files** — both are in `.gitignore`

---

## 🐛 Troubleshooting

### Redirected to wrong page on load
Make sure you have **no other local apps** running on port 5173 sharing `localStorage`. Open DevTools → Application → Local Storage → clear `token` and `jc_*` keys if needed, then hard-refresh.

### Video call shows "Call Failed"
1. Check that `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` are correct in `.env`.
2. Ensure you've allowed camera/microphone permissions in the browser.
3. Agora requires HTTPS in production — test locally with Chrome's dev tools.

### Whiteboard not saving
The server auto-drops and recreates the `conversationId_1` index on startup. If you see E11000 errors, restart the backend — the `server.js` startup script handles cleanup automatically.

### Avatar upload fails
Verify your Cloudinary credentials in `.env`. The free tier supports up to 25 GB of storage and 25 GB bandwidth/month.

---

## 🗺️ Roadmap

- [ ] End-to-end encryption for private messages
- [ ] Message forwarding
- [ ] Disappearing messages
- [ ] Group chats
- [ ] Push notifications (PWA)
- [ ] Dark/light auto-detection from OS preference
- [ ] More seasonal themes (Halloween 🎃, Christmas 🎄, Diwali 🪔)
- [ ] Custom emoji packs

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Realtime | Socket.IO 4.8 |
| Backend | Express 5, Node.js 18+ |
| Database | MongoDB Atlas + Mongoose 8 |
| Auth | JSON Web Tokens (jsonwebtoken) |
| Video Calls | Agora RTC SDK |
| File Storage | Cloudinary + multer-storage-cloudinary |
| Passwords | bcryptjs |

---

## 📄 License

MIT © 2024 Suyash Dubey

---

<div align="center">

Made with ❤️ and lots of ☕

**[⭐ Star this repo if you like it!](https://github.com/YOUR_USERNAME/JourneyChat)**

</div>