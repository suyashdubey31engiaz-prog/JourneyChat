// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useRef, useCallback } from "react";
import { getLoggedInUser } from "../utils/api";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const RAW_API  = axios.create({ baseURL: `${BASE_URL}/api` });

export const AuthContext = createContext();

// ── LocalStorage keys ─────────────────────────────────────────────────────────
const TOKEN_KEY    = "token";
const EXPIRY_KEY   = "jc_token_expiry";
const REMEMBER_KEY = "jc_remember";
const ACCOUNTS_KEY = "jc_saved_accounts";

// ── Saved-accounts helpers ────────────────────────────────────────────────────
const loadAccounts = () => {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]"); }
  catch (e) { return []; }
};
const saveAccounts  = (list) => localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
const upsertAccount = (entry) => {
  const list = loadAccounts();
  const idx  = list.findIndex(a => a.email === entry.email);
  if (idx >= 0) list[idx] = { ...list[idx], ...entry };
  else list.push(entry);
  saveAccounts(list);
};
const removeAccount = (email) => saveAccounts(loadAccounts().filter(a => a.email !== email));

// Refresh token 30 min before it expires
const REFRESH_BUFFER = 30 * 60 * 1000;

// ══════════════════════════════════════════════════════════════════════════════
export const AuthProvider = ({ children }) => {
  const [user,          setUser]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [savedAccounts, setSavedAccounts] = useState(loadAccounts);
  const refreshTimer = useRef(null);

  // ── Hard logout (token fully expired) ──────────────────────────────────────
  const hardLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    setUser(null);
  }, []);

  // ── Silent token refresh ───────────────────────────────────────────────────
  const doRefresh = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const res = await RAW_API.post("/auth/refresh", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem(TOKEN_KEY,  res.data.token);
      localStorage.setItem(EXPIRY_KEY, String(res.data.expiresAt));
      scheduleRefresh(res.data.expiresAt);
    } catch (err) {
      hardLogout();
    }
  }, [hardLogout]); // eslint-disable-line

  const scheduleRefresh = useCallback((expiresAt) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    if (!expiresAt) return;
    const delay = expiresAt - Date.now() - REFRESH_BUFFER;
    if (delay <= 0) { doRefresh(); return; }
    refreshTimer.current = setTimeout(doRefresh, delay);
  }, [doRefresh]);

  // ── Restore session on app load ────────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      const token     = localStorage.getItem(TOKEN_KEY);
      const expiresAt = Number(localStorage.getItem(EXPIRY_KEY) || "0");
      const remember  = localStorage.getItem(REMEMBER_KEY) === "true";

      if (!token) { setLoading(false); return; }

      // Expired + no remember → boot them out
      if (expiresAt && Date.now() > expiresAt && !remember) {
        hardLogout(); setLoading(false); return;
      }

      // Expired + remember → try to refresh
      if (expiresAt && Date.now() > expiresAt && remember) {
        await doRefresh(); setLoading(false); return;
      }

      // Still valid — fetch full profile
      try {
        const res = await getLoggedInUser();
        setUser(res.data);
        scheduleRefresh(expiresAt || null);
      } catch (err) {
        hardLogout();
      }
      setLoading(false);
    };
    restore();
    return () => { if (refreshTimer.current) clearTimeout(refreshTimer.current); };
  }, []); // eslint-disable-line

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (loginData, remember = false) => {
    localStorage.setItem(TOKEN_KEY,    loginData.token);
    localStorage.setItem(EXPIRY_KEY,   String(loginData.expiresAt || 0));
    localStorage.setItem(REMEMBER_KEY, String(remember));
    try {
      const res = await getLoggedInUser();
      const u   = res.data;
      setUser(u);
      scheduleRefresh(loginData.expiresAt || null);
      if (remember) {
        upsertAccount({
          email:     u.email,
          name:      u.name,
          avatar:    u.avatar || "",
          token:     loginData.token,
          expiresAt: loginData.expiresAt || 0,
        });
        setSavedAccounts(loadAccounts());
      }
    } catch (err) {
      console.error("login profile load:", err);
    }
  }, [scheduleRefresh]);

  // ── Logout ─────────────────────────────────────────────────────────────────
  // keepInList=true  → removes session but keeps email in the switcher
  // keepInList=false → removes from switcher too
  const logout = useCallback((keepInList = true) => {
    if (!keepInList && user?.email) removeAccount(user.email);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    setUser(null);
    setSavedAccounts(loadAccounts());
  }, [user]);

  // ── Switch account ─────────────────────────────────────────────────────────
  const switchAccount = useCallback(async (saved) => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    setUser(null);

    if (saved.token && saved.expiresAt > Date.now()) {
      localStorage.setItem(TOKEN_KEY,    saved.token);
      localStorage.setItem(EXPIRY_KEY,   String(saved.expiresAt));
      localStorage.setItem(REMEMBER_KEY, "true");
      try {
        const res = await getLoggedInUser();
        setUser(res.data);
        scheduleRefresh(saved.expiresAt);
        return true;
      } catch (err) {
        // Token silently rejected — fall through to login redirect
      }
    }
    // Token expired — redirect to login with email pre-filled
    window.location.href = `/login?email=${encodeURIComponent(saved.email)}`;
    return false;
  }, [scheduleRefresh]);

  // ── Forget a saved account ─────────────────────────────────────────────────
  const forgetAccount = useCallback((email) => {
    removeAccount(email);
    setSavedAccounts(loadAccounts());
  }, []);

  // ── Update user fields in context (after profile edits) ───────────────────
  const updateUser = useCallback((fields) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...fields };
      upsertAccount({ email: updated.email, name: updated.name, avatar: updated.avatar || "" });
      setSavedAccounts(loadAccounts());
      return updated;
    });
  }, []);

  // ── Set status with optional auto-reset timer ──────────────────────────────
  const setStatus = useCallback(async (status, durationHours = null) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const res = await RAW_API.post("/auth/status", { status, durationHours }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateUser({ status: res.data.status, statusExpiry: res.data.statusExpiry });
    } catch (err) {
      console.error("setStatus:", err);
    }
  }, [updateUser]);

  // ── Re-fetch user from server ──────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await getLoggedInUser();
      setUser(res.data);
    } catch (err) {
      // silently ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, savedAccounts,
      login, logout, switchAccount, forgetAccount,
      updateUser, refreshUser, setStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
};