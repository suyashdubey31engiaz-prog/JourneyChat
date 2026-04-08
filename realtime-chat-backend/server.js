// server.js
require("dotenv").config();
const express  = require("express");
const http     = require("http");
const mongoose = require("mongoose");
const cors     = require("cors");
const Message  = require("./models/Message");

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const allowedOrigins  = [FRONTEND_ORIGIN, "http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
}));

// ── MongoDB connect + auto-fix stale whiteboard index ──────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");

    // FIX: Drop the stale `conversationId_1` unique index that causes
    // E11000 duplicate key errors when saving the whiteboard.
    // This runs every startup but is completely safe — if the index
    // doesn't exist it just logs "already clean" and moves on.
    try {
      const db = mongoose.connection.db;
      const col = db.collection("whiteboardstates");

      // Also remove any orphan docs where boardId is null (leftover junk)
      const deleted = await col.deleteMany({
        $or: [
          { boardId: null },
          { boardId: { $exists: false } },
          { boardId: "" },
        ]
      });
      if (deleted.deletedCount > 0)
        console.log(`🧹 Removed ${deleted.deletedCount} orphan whiteboard doc(s)`);

      // Drop the bad index — error code 27 = "index not found" which is fine
      await col.dropIndex("conversationId_1");
      console.log("✅ Dropped stale whiteboard index (conversationId_1)");
    } catch (e) {
      if (e.code === 27 || e.codeName === "IndexNotFound") {
        // Index didn't exist — whiteboard is already clean, nothing to do
      } else {
        console.warn("⚠️  Could not drop stale whiteboard index:", e.message);
      }
    }
  })
  .catch((err) => console.error("❌ MongoDB error:", err));

app.use("/api/auth",       require("./routes/auth_route"));
app.use("/api/users",      require("./routes/users"));
app.use("/api/messages",   require("./routes/messages"));
app.use("/api/whiteboard", require("./routes/whiteboard"));
app.use("/api/agora",      require("./routes/agora"));

app.get("/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/",     (_req, res) => res.send("🚀 JourneyChat API"));

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET","POST"], credentials: true },
  pingTimeout:  60000,
  pingInterval: 25000,
});

// ── userId → socketId map ──────────────────────────────────────────────────────
const userSocketMap = new Map();
const getSocket = (uid) => userSocketMap.get(String(uid));

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    userSocketMap.set(String(userId), socket.id);
    socket.data.userId = userId;

    // Tell the new user which OTHER users are already online
    const onlineIds = Array.from(userSocketMap.keys()).filter(id => id !== String(userId));
    socket.emit("online-users", onlineIds);

    // Tell everyone else this user just came online
    socket.broadcast.emit("user-online", { userId });
  }

  // ── Private message ───────────────────────────────────────────────────────
  socket.on("privateMessage", async ({ receiverId, content, senderId }) => {
    if (!receiverId || !content || !senderId) return;
    try {
      const msg = await Message.create({ sender: senderId, receiver: receiverId, content });
      const rs  = getSocket(receiverId);
      if (rs) io.to(rs).emit("privateMessage", msg);
      io.to(socket.id).emit("privateMessage", msg);
    } catch (err) {
      console.error("[privateMessage]", err.message);
    }
  });

  // ── Global ────────────────────────────────────────────────────────────────
  socket.on("globalMessage", (payload) => io.emit("globalMessage", payload));

  // ── Typing ────────────────────────────────────────────────────────────────
  socket.on("typing",      ({ to }) => { const s=getSocket(to); if(s) io.to(s).emit("typing",      { from: userId }); });
  socket.on("stop-typing", ({ to }) => { const s=getSocket(to); if(s) io.to(s).emit("stop-typing", { from: userId }); });

  // ── Whiteboard ────────────────────────────────────────────────────────────
  socket.on("join-whiteboard",  (id) => id && socket.join(id));
  socket.on("leave-whiteboard", (id) => id && socket.leave(id));
  socket.on("drawing",          (p)  => p.boardId && socket.to(p.boardId).emit("drawing", p));
  socket.on("clear-whiteboard", (d)  => d.boardId && io.to(d.boardId).emit("clear-whiteboard", d.boardId));

  // ── Tic-tac-toe ───────────────────────────────────────────────────────────
  socket.on("ttt-move", (d) => d.boardId && socket.to(d.boardId).emit("ttt-move", d));

  // ── Call signaling ────────────────────────────────────────────────────────
  socket.on("call-user",   (d) => { const s=getSocket(d?.to); if(s) io.to(s).emit("incoming-call", d); });
  socket.on("accept-call", (d) => { const s=getSocket(d?.to); if(s) io.to(s).emit("call-accepted", d); });
  socket.on("end-call",    (d) => { const s=getSocket(d?.to); if(s) io.to(s).emit("call-ended",    d); });
  socket.on("reject-call", (d) => { const s=getSocket(d?.to); if(s) io.to(s).emit("call-rejected", d); });

  // ── Disconnect ────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const uid = socket.data.userId;
    if (uid && userSocketMap.get(String(uid)) === socket.id) {
      userSocketMap.delete(String(uid));
      socket.broadcast.emit("user-offline", { userId: uid });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

process.on("SIGINT", async () => {
  await mongoose.connection.close().catch(console.error);
  server.close(() => process.exit(0));
});