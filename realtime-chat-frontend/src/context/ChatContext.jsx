import React, {
  createContext, useState, useEffect,
  useContext, useCallback, useRef
} from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import {
  getAllUsers,
  getMessages as getMessagesAPI,
  deleteMessage as deleteMessageAPI,
} from "../utils/api";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user }    = useContext(AuthContext);
  const socketRef   = useRef(null);

  const [contacts,        setContacts]        = useState([]);
  const [onlineUsers,     setOnlineUsers]      = useState(new Set());
  const [selectedContact, setSelectedContact]  = useState(null);
  const [messages,        setMessages]         = useState({});   // { contactId: [...msgs] }
  const [unreadCounts,    setUnreadCounts]      = useState({});   // { contactId: number }
  const [globalMessages,  setGlobalMessages]   = useState([]);
  const [incomingCall,    setIncomingCall]      = useState(null);
  const [isCallActive,    setIsCallActive]      = useState(false);
  const [callContact,     setCallContact]       = useState(null);
  const [typingUsers,     setTypingUsers]       = useState(new Set());

  // Track which contact is currently open so we don't increment unread for it
  const selectedContactRef = useRef(null);
  useEffect(() => { selectedContactRef.current = selectedContact; }, [selectedContact]);

  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, {
      query:                { userId: user._id },
      reconnection:         true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    // Load contacts
    getAllUsers().then(res => setContacts(res.data)).catch(console.error);

    // ── FIX: Receive the full list of already-online users on connect ─────────
    socket.on("online-users", (ids) => {
      setOnlineUsers(new Set(ids.map(String)));
    });

    // ── Someone came online ───────────────────────────────────────────────────
    socket.on("user-online", ({ userId }) => {
      setOnlineUsers(prev => new Set([...prev, String(userId)]));
    });

    // ── Someone went offline ──────────────────────────────────────────────────
    socket.on("user-offline", ({ userId }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(String(userId));
        return next;
      });
    });

    // ── Private message ───────────────────────────────────────────────────────
    socket.on("privateMessage", (msg) => {
      const senderId   = String(msg.sender?._id || msg.sender);
      const receiverId = String(msg.receiver?._id || msg.receiver);
      const myId       = String(user._id);
      // The contact on the other side
      const contactId  = senderId === myId ? receiverId : senderId;

      setMessages(prev => {
        // Deduplicate
        if (prev[contactId]?.some(m => m._id === msg._id)) return prev;
        return { ...prev, [contactId]: [...(prev[contactId] || []), msg] };
      });

      // ── FIX: Increment unread only if this conv is NOT currently open ───────
      if (senderId !== myId) {
        const openId = selectedContactRef.current?._id;
        if (String(openId) !== String(contactId)) {
          setUnreadCounts(prev => ({
            ...prev,
            [contactId]: (prev[contactId] || 0) + 1,
          }));
        }
      }
    });

    // ── Global message ────────────────────────────────────────────────────────
    socket.on("globalMessage", (msg) => {
      setGlobalMessages(prev => [...prev, { ...msg, _id: `${Date.now()}-${Math.random()}` }]);
    });

    // ── Typing ────────────────────────────────────────────────────────────────
    socket.on("typing",      ({ from }) => setTypingUsers(prev => new Set([...prev, String(from)])));
    socket.on("stop-typing", ({ from }) => setTypingUsers(prev => { const s=new Set(prev); s.delete(String(from)); return s; }));

    // ── Call signaling ────────────────────────────────────────────────────────
    socket.on("incoming-call", ({ from, callType }) => {
      setContacts(cur => {
        const caller = cur.find(c => String(c._id) === String(from));
        if (caller) setIncomingCall({ from: caller, callType: callType || "video" });
        return cur;
      });
    });
    socket.on("call-accepted", () => setIsCallActive(true));
    socket.on("call-rejected", () => {
      setIsCallActive(false);
      setCallContact(null);
    });
    socket.on("call-ended", () => {
      setIsCallActive(false);
      setCallContact(null);
      setIncomingCall(null);
    });

    return () => socket.disconnect();
  }, [user]);

  // ── Fetch message history ─────────────────────────────────────────────────
  const fetchMessages = useCallback(async (contact) => {
    setSelectedContact(contact);
    // Clear unread when opening
    setUnreadCounts(prev => ({ ...prev, [contact._id]: 0 }));

    if (!messages[contact._id]) {
      try {
        const res = await getMessagesAPI(contact._id);
        setMessages(prev => ({ ...prev, [contact._id]: res.data }));
      } catch (err) {
        console.error("fetchMessages:", err);
      }
    }
  }, [messages]);

  const selectGlobal = () => {
    setSelectedContact({ _id: "global", name: "Global Chat" });
  };

  // ── Send messages ─────────────────────────────────────────────────────────
  const sendMessage = (receiverId, content) => {
    if (!socketRef.current) return;
    socketRef.current.emit("privateMessage", { receiverId, content, senderId: user._id });
  };

  const sendGlobalMessage = (content) => {
    if (!socketRef.current) return;
    socketRef.current.emit("globalMessage", { senderName: user.name, content });
  };

  // ── Delete message ────────────────────────────────────────────────────────
  const deleteMessage = async (messageId, contactId) => {
    try {
      await deleteMessageAPI(messageId);
      setMessages(prev => ({
        ...prev,
        [contactId]: (prev[contactId] || []).filter(m => m._id !== messageId),
      }));
    } catch (err) {
      console.error("deleteMessage:", err);
    }
  };

  // ── Typing events ─────────────────────────────────────────────────────────
  const emitTyping     = (to) => socketRef.current?.emit("typing",      { to });
  const emitStopTyping = (to) => socketRef.current?.emit("stop-typing", { to });

  // ── Call controls ─────────────────────────────────────────────────────────
  const startCall = (contact, callType = "video") => {
    socketRef.current?.emit("call-user", { to: contact._id, from: user._id, callType });
    setCallContact({ ...contact, callType });
  };

  const acceptCall = () => {
    if (!incomingCall) return;
    socketRef.current?.emit("accept-call", { to: incomingCall.from._id });
    setCallContact(incomingCall.from);
    setIsCallActive(true);
    setIncomingCall(null);
  };

  const rejectCall = () => {
    if (incomingCall)
      socketRef.current?.emit("reject-call", { to: incomingCall.from._id });
    setIncomingCall(null);
  };

  const endCall = () => {
    const target = callContact || incomingCall?.from;
    if (target) socketRef.current?.emit("end-call", { to: target._id });
    setIsCallActive(false);
    setCallContact(null);
    setIncomingCall(null);
  };

  return (
    <ChatContext.Provider value={{
      socket: socketRef.current,
      contacts, onlineUsers, typingUsers,
      selectedContact, messages, globalMessages,
      unreadCounts,
      fetchMessages, selectGlobal,
      sendMessage, sendGlobalMessage, deleteMessage,
      emitTyping, emitStopTyping,
      incomingCall, isCallActive, callContact,
      startCall, acceptCall, rejectCall, endCall,
    }}>
      {children}
    </ChatContext.Provider>
  );
};