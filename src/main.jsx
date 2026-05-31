import React from "react";
import { createRoot } from "react-dom/client";
import Forge from "./forge.jsx";

if (!window.storage) {
  window.storage = {
    async get(k){ const v = localStorage.getItem(k); if (v === null) throw new Error("missing"); return { key:k, value:v }; },
    async set(k, val){ localStorage.setItem(k, val); return { key:k, value:val }; },
    async delete(k){ localStorage.removeItem(k); return { key:k, deleted:true }; },
    async list(prefix=""){ return { keys: Object.keys(localStorage).filter(x => x.startsWith(prefix)) }; },
  };
}
window.__ALLOY_CLAUDE_PROXY__ = "https://nvjizahtcqgmfhiodtej.supabase.co/functions/v1/claude-proxy";

createRoot(document.getElementById("root")).render(<Forge />);