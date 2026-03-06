import { useState, useRef, useEffect } from "react";

const MODES = [
  { id: "suno",    label: "🎵 Suno Prompt Builder",  icon: "🎵" },
  { id: "tagger",  label: "🗂 Track Tagger",          icon: "🗂" },
  { id: "setlist", label: "📡 VFN Setlist Builder",   icon: "📡" },
  { id: "builder", label: "🌋 VFN Track Builder",     icon: "🌋" },
  { id: "library", label: "💾 VFN Library",           icon: "💾" },
];

const SYSTEM_PROMPTS = {
  suno: `You are El Chasqui — the AI messenger of Volkanic Frequency Network (VFN), forged in fire, driven by AI. Your mission: generate powerful, detailed Suno AI music prompts for VJVOLKAN's VFN platform, a 24/7 curated AI-generated music streaming network.

When given a vibe, genre, emotion, or concept, output:
1. A Suno-ready prompt (style tags, mood, instruments, BPM if relevant)
2. A suggested track title in VJVOLKAN's style
3. A short VFN playlist category it fits (e.g. "Late Night Frequencies", "Andean Bass Ritual", "Cyber Dawn")
4. One-line Suno style tag string (e.g. "[dark ambient, tribal percussion, deep bass, 90bpm]")

Be bold. Be volcanic. Channel Bolivian heritage, electronic depth, and AI-forged sonic identity. Always speak as El Chasqui.`,

  tagger: `You are El Chasqui — the AI messenger of Volkanic Frequency Network (VFN). Your mission: help VJVOLKAN organize and tag his massive 74,000+ track music archive.

When given a track name, filename, or description:
1. Suggest the best Genre tag
2. Suggest a Mood/Energy tag (e.g. "Dark & Hypnotic", "Peak Hour Energy", "Chill Descent")
3. Suggest a VFN Category (e.g. "VFN Main Channel", "VFN Chill", "VFN Andean Frequencies", "VFN Bass Lab")
4. Suggest a BPM range estimate
5. Suggest folder path (e.g. /VFN/Andean_Bass/Dark/)
6. Flag if this track sounds like a potential VFN highlight or "signature track"

Be concise, structured, useful. You are the messenger — fast and precise.`,

  setlist: `You are El Chasqui — the AI messenger of Volkanic Frequency Network (VFN), a 24/7 curated AI-generated music streaming platform by VJVOLKAN, tagline: "Forged in Fire. Driven by AI."

Your mission: build VFN setlists/playlists with narrative arc and flow.

When given a theme, duration, or vibe:
1. Create a named VFN playlist/set with a Volkanic title
2. Outline 6-10 "track slots" with: position, vibe/energy, suggested Suno genre tags, and transition note
3. Give the set an arc (build to peak to resolution, or drone descent, etc.)
4. Suggest a broadcast time slot for VFN (e.g. "Best aired: 2AM-4AM VFN Night Block")
5. Add a short VFN promo blurb for Discord/social

Channel the spirit of the Andean messenger — every set tells a journey.`,

  builder: `You are El Chasqui — the AI messenger of Volkanic Frequency Network (VFN), the AI-powered music ecosystem of VJVOLKAN.

Your mission: generate a COMPLETE AI music production blueprint.

IMPORTANT: Output EXACTLY in this format with these exact labels on separate lines:

Track Title: [title here]
Genre + BPM: [genre] / [bpm]bpm
Musical Key: [key]
Mood: [mood description]
Instrumentation: [comma-separated instruments]
Suno AI Prompt: [full suno prompt here]
Lyrics Hook: [hook line here]
ElevenLabs DJ Intro: [intro script here]
Artwork Prompt: [visual art prompt here]
VFN Category: [category name]

Use exactly those labels — the export system depends on them.
Channel volcanic energy, Andean mysticism, and futuristic electronic music. Always speak as El Chasqui.`,
};

const SUGGESTIONS = {
  suno:    ["Dark tribal bass ritual at 128bpm", "Andean drone with glitch elements", "Cyber cumbia for late night VFN", "Volcanic ambient sunrise meditation", "Bolivia-meets-Berlin techno fusion"],
  tagger:  ["VJVOLKAN_Dark_Andes_001.wav", "suno_chill_morning_2024.mp3", "tribal_bass_rough_mix.mp3", "volkanic_freq_ep3_master.wav", "bolivia_techno_live_set.mp3"],
  setlist: ["2-hour late night VFN block, dark and hypnotic", "45-min Andean sunrise set", "Peak hour festival energy, 2 hours", "Midnight drone descent, 90 minutes", "Saturday VFN showcase, 3 hours mixed energy"],
  builder: ["Afro house sunset ritual", "Andean techno ceremonial bass", "Cyber cumbia late night frequency", "Volcanic ambient sunrise meditation", "Industrial peak hour techno eruption"],
  library: [],
};

function parseBuilderOutput(text) {
  const extract = (label) => {
    const regex = new RegExp(`${label}:\\s*([\\s\\S]+?)(?=\\n(?:Track Title|Genre \\+ BPM|Musical Key|Mood|Instrumentation|Suno AI Prompt|Lyrics Hook|ElevenLabs DJ Intro|Artwork Prompt|VFN Category):|$)`, "i");
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };
  return {
    title:       extract("Track Title"),
    genreBpm:    extract("Genre \\+ BPM"),
    key:         extract("Musical Key"),
    mood:        extract("Mood"),
    instruments: extract("Instrumentation"),
    sunoPrompt:  extract("Suno AI Prompt"),
    lyricsHook:  extract("Lyrics Hook"),
    djIntro:     extract("ElevenLabs DJ Intro"),
    artPrompt:   extract("Artwork Prompt"),
    vfnCategory: extract("VFN Category"),
  };
}

function copyText(text, setCopied, key) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  });
}

function ExportPanel({ content, onSaveToLibrary }) {
  const [copied, setCopied] = useState(null);
  const parsed = parseBuilderOutput(content);
  if (!parsed.title && !parsed.sunoPrompt) return null;

  const btn = (key, label, text, color = "cyan") => {
    const isCyan = color === "cyan";
    const active = copied === key;
    return (
      <button
        onClick={() => copyText(text, setCopied, key)}
        style={{
          fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px",
          padding: "7px 13px", borderRadius: "2px", cursor: "pointer", transition: "all 0.2s",
          border: `1px solid ${active ? (isCyan ? "#00f0ff" : "#ff9050") : (isCyan ? "#1a3a3a" : "#3a1a00")}`,
          background: active ? (isCyan ? "rgba(0,240,255,0.12)" : "rgba(255,144,80,0.12)") : "rgba(0,0,0,0.3)",
          color: active ? (isCyan ? "#00f0ff" : "#ff9050") : (isCyan ? "#2a6a6a" : "#5a3010"),
        }}>
        {active ? "✓ COPIED" : label}
      </button>
    );
  };

  return (
    <div style={{ marginTop: "14px", borderTop: "1px solid #1a2a1a", paddingTop: "12px" }}>
      <div style={{ fontSize: "9px", color: "#1a4a1a", letterSpacing: "4px", marginBottom: "10px" }}>
        ◈ EXPORT PANEL
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
        {parsed.sunoPrompt  && btn("suno", "⚡ SUNO PROMPT",        parsed.sunoPrompt)}
        {parsed.djIntro     && btn("dj",   "🎙 ELEVENLABS INTRO",   parsed.djIntro)}
        {parsed.artPrompt   && btn("art",  "🖼 ART PROMPT",         parsed.artPrompt)}
        {parsed.lyricsHook  && btn("hook", "🎵 LYRICS HOOK",        parsed.lyricsHook)}
        <button
          onClick={() => { onSaveToLibrary(parsed); setCopied("saved"); }}
          style={{
            fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px",
            padding: "7px 13px", borderRadius: "2px", cursor: "pointer", transition: "all 0.2s",
            border: `1px solid ${copied === "saved" ? "#c84000" : "#2a1400"}`,
            background: copied === "saved" ? "rgba(200,64,0,0.2)" : "rgba(200,64,0,0.07)",
            color: copied === "saved" ? "#ff6a00" : "#5a2a00",
          }}>
          {copied === "saved" ? "✓ SAVED!" : "💾 SAVE TO VFN LIBRARY"}
        </button>
      </div>
    </div>
  );
}

function LibraryView({ library, onDelete, onExportAll }) {
  const [expanded, setExpanded] = useState(null);

  if (library.length === 0) return (
    <div style={{ textAlign: "center", paddingTop: "80px" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>💾</div>
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#3a2010", letterSpacing: "3px", lineHeight: "2" }}>
        VFN LIBRARY IS EMPTY<br/>
        <span style={{ color: "#2a1508", fontSize: "10px" }}>
          Use 🌋 VFN Track Builder and hit SAVE TO VFN LIBRARY
        </span>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#c84000", letterSpacing: "3px" }}>
          {library.length} TRACK{library.length !== 1 ? "S" : ""} IN VFN LIBRARY
        </div>
        <button onClick={onExportAll} style={{
          fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px",
          padding: "6px 14px", border: "1px solid #1a4a1a", background: "rgba(0,180,60,0.06)",
          color: "#2a7a3a", cursor: "pointer", borderRadius: "2px",
        }}>↓ EXPORT ALL JSON</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {library.map((track, i) => (
          <div key={i} style={{
            border: "1px solid #1a1000",
            background: expanded === i ? "rgba(255,106,0,0.05)" : "rgba(15,6,0,0.8)",
            transition: "all 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", cursor: "pointer", gap: "14px" }}
              onClick={() => setExpanded(expanded === i ? null : i)}>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#3a1a08", minWidth: "32px" }}>
                {String(i + 1).padStart(3, "0")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#e8b060", letterSpacing: "1px" }}>
                  {track.title || "UNTITLED"}
                </div>
                <div style={{ fontSize: "10px", color: "#5a3a18", marginTop: "3px", letterSpacing: "1px" }}>
                  {[track.genreBpm, track.vfnCategory].filter(Boolean).join(" · ")}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "10px", color: "#2a4a2a", fontFamily: "'Courier New', monospace" }}>
                  {expanded === i ? "▲" : "▼"}
                </span>
                <button onClick={e => { e.stopPropagation(); onDelete(i); }} style={{
                  background: "transparent", border: "1px solid #2a0800", color: "#4a1808",
                  fontSize: "10px", padding: "3px 8px", cursor: "pointer", fontFamily: "'Courier New', monospace", borderRadius: "2px",
                }}>✕</button>
              </div>
            </div>

            {expanded === i && (
              <div style={{ padding: "0 16px 16px 16px", borderTop: "1px solid #1a0a00" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "14px" }}>
                  {[["KEY", track.key], ["MOOD", track.mood], ["INSTRUMENTS", track.instruments], ["VFN CATEGORY", track.vfnCategory]].map(([label, val]) => val ? (
                    <div key={label} style={{ background: "rgba(0,0,0,0.4)", padding: "10px 12px", borderRadius: "2px" }}>
                      <div style={{ fontSize: "9px", color: "#3a2010", letterSpacing: "3px", marginBottom: "4px" }}>{label}</div>
                      <div style={{ fontSize: "11px", color: "#a07040", lineHeight: "1.6" }}>{val}</div>
                    </div>
                  ) : null)}
                </div>
                {[
                  ["SUNO PROMPT", track.sunoPrompt, "#00f0ff", "#0a2020"],
                  ["ARTWORK PROMPT", track.artPrompt, "#ff6a00", "#1a0800"],
                  ["ELEVENLABS DJ INTRO", track.djIntro, "#aaaa00", "#1a1a00"],
                  ["LYRICS HOOK", track.lyricsHook, "#aa00ff", "#1a0020"],
                ].map(([label, val, col, bg]) => val ? (
                  <div key={label} style={{ marginTop: "8px", background: bg, border: `1px solid ${col}22`, padding: "12px", borderRadius: "2px" }}>
                    <div style={{ fontSize: "9px", color: col + "88", letterSpacing: "3px", marginBottom: "6px" }}>{label}</div>
                    <div style={{ fontSize: "11px", color: col + "bb", lineHeight: "1.7" }}>{val}</div>
                  </div>
                ) : null)}
                <div style={{ marginTop: "12px" }}>
                  <button onClick={() => navigator.clipboard.writeText(JSON.stringify(track, null, 2))} style={{
                    fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px",
                    padding: "6px 12px", border: "1px solid #1a3a1a", background: "transparent",
                    color: "#2a6a2a", cursor: "pointer", borderRadius: "2px",
                  }}>↓ COPY JSON</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ElChasqui() {
  const [mode, setMode]       = useState("suno");
  const [input, setInput]     = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [library, setLibrary] = useState([]);
  const [libNotify, setLibNotify] = useState(false);
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (mode !== "library") { setMessages([]); setHistory([]); } }, [mode]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput(""); setLoading(true);
    const newHistory = [...history, { role: "user", content: userMsg }];
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200,
          system: SYSTEM_PROMPTS[mode], messages: newHistory }),
      });
      const data  = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "⚡ El Chasqui lost the signal. Try again.";
      setHistory([...newHistory, { role: "assistant", content: reply }]);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "🌋 Signal disrupted. Check your connection, hermano." }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const saveToLibrary = (parsed) => {
    setLibrary(prev => [{ ...parsed, savedAt: new Date().toISOString() }, ...prev]);
    setLibNotify(true);
    setTimeout(() => setLibNotify(false), 3000);
  };

  const exportAllJson = () => {
    const blob = new Blob([JSON.stringify(library, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "vfn-library.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const currentMode = MODES.find(m => m.id === mode);

  return (
    <div style={{ fontFamily: "'Courier New', monospace", background: "#0a0500", minHeight: "100vh",
      color: "#e8d5a0", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

      {/* BG layers */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 20% 80%, rgba(200,60,0,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,200,255,0.05) 0%, transparent 50%)" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)" }} />

      {/* HEADER */}
      <header style={{ position: "relative", zIndex: 10, borderBottom: "2px solid #c84000",
        padding: "16px 24px 12px", background: "linear-gradient(90deg, #120800, #1a0a00)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span style={{ fontSize: "22px", fontWeight: "bold", letterSpacing: "4px", color: "#ff6a00",
              textShadow: "0 0 20px rgba(255,106,0,0.7), 0 0 40px rgba(255,106,0,0.3)" }}>⚡ EL CHASQUI</span>
            <span style={{ fontSize: "11px", color: "#8a6030", letterSpacing: "3px" }}>VFN INTELLIGENCE</span>
          </div>
          <div style={{ fontSize: "10px", color: "#5a4020", letterSpacing: "2px", marginTop: "3px" }}>
            VOLKANIC FREQUENCY NETWORK · FORGED IN FIRE. DRIVEN BY AI.
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {libNotify && (
            <div style={{ fontSize: "10px", color: "#00c850", letterSpacing: "2px",
              border: "1px solid #00c850", padding: "4px 10px", background: "rgba(0,200,80,0.08)", borderRadius: "2px" }}>
              ✓ SAVED TO LIBRARY
            </div>
          )}
          {library.length > 0 && (
            <div onClick={() => setMode("library")} style={{ fontSize: "10px", color: "#3a7a3a", letterSpacing: "2px",
              border: "1px solid #1a4a1a", padding: "4px 10px", background: "rgba(0,160,60,0.07)",
              borderRadius: "2px", cursor: "pointer" }}>
              💾 {library.length} SAVED
            </div>
          )}
          <div style={{ fontSize: "10px", color: "#c84000", letterSpacing: "2px",
            border: "1px solid #c84000", padding: "4px 10px", background: "rgba(200,64,0,0.08)", borderRadius: "2px" }}>
            ◉ SIGNAL ACTIVE
          </div>
        </div>
      </header>

      {/* TABS */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", borderBottom: "1px solid #2a1500",
        background: "#0d0600", overflowX: "auto" }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{
            flex: "0 0 auto", padding: "12px 14px", border: "none", cursor: "pointer",
            fontSize: "11px", letterSpacing: "1px", fontFamily: "'Courier New', monospace",
            background: mode === m.id ? "rgba(200,64,0,0.2)" : "transparent",
            color: mode === m.id ? "#ff6a00" : "#5a4020",
            borderBottom: mode === m.id ? "2px solid #ff6a00" : "2px solid transparent",
            transition: "all 0.2s", whiteSpace: "nowrap",
          }}>{m.label}</button>
        ))}
      </div>

      {/* LIBRARY */}
      {mode === "library" ? (
        <div style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 5 }}>
          <LibraryView library={library} onDelete={i => setLibrary(prev => prev.filter((_, idx) => idx !== i))} onExportAll={exportAllJson} />
        </div>
      ) : (
        <>
          {/* CHAT */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", position: "relative", zIndex: 5, maxHeight: "calc(100vh - 200px)" }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", paddingTop: "30px" }}>
                <div style={{ fontSize: "44px", marginBottom: "12px", filter: "drop-shadow(0 0 20px rgba(255,106,0,0.5))" }}>🏔️</div>
                <div style={{ fontSize: "13px", color: "#8a5030", letterSpacing: "2px", marginBottom: "6px" }}>EL CHASQUI AWAITS YOUR TRANSMISSION</div>
                <div style={{ fontSize: "11px", color: "#4a3015", marginBottom: "20px" }}>
                  {mode === "suno" && "Describe a vibe, genre, emotion, or concept →"}
                  {mode === "tagger" && "Give me a filename or track description →"}
                  {mode === "setlist" && "Describe a set theme, duration, or energy →"}
                  {mode === "builder" && "Describe a track concept, genre, or mood →"}
                </div>
                {mode === "builder" && (
                  <div style={{ fontSize: "10px", color: "#1a4a1a", letterSpacing: "2px", marginBottom: "20px",
                    border: "1px solid #0a2a0a", padding: "8px 20px", display: "inline-block", background: "rgba(0,200,80,0.04)" }}>
                    ◈ EXPORT PANEL · SAVE TRACKS TO VFN LIBRARY
                  </div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxWidth: "600px", margin: "0 auto" }}>
                  {SUGGESTIONS[mode].map((s, i) => (
                    <button key={i} onClick={() => { setInput(s); textareaRef.current?.focus(); }} style={{
                      background: "rgba(200,64,0,0.12)", border: "1px solid #3a1800", color: "#c87040",
                      padding: "8px 14px", borderRadius: "2px", fontSize: "11px", cursor: "pointer",
                      fontFamily: "'Courier New', monospace", letterSpacing: "0.5px", transition: "all 0.2s",
                    }}
                      onMouseEnter={e => { e.target.style.borderColor = "#ff6a00"; e.target.style.color = "#ff9050"; }}
                      onMouseLeave={e => { e.target.style.borderColor = "#3a1800"; e.target.style.color = "#c87040"; }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: "20px", display: "flex",
                flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "2px", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
                  background: msg.role === "user" ? "rgba(255,106,0,0.2)" : "rgba(200,64,0,0.15)",
                  border: msg.role === "user" ? "1px solid rgba(255,106,0,0.4)" : "1px solid rgba(200,64,0,0.3)" }}>
                  {msg.role === "user" ? "🎧" : "⚡"}
                </div>
                <div style={{ maxWidth: "82%",
                  background: msg.role === "user" ? "rgba(255,106,0,0.08)" : "rgba(20,10,0,0.85)",
                  border: msg.role === "user" ? "1px solid rgba(255,106,0,0.25)" : "1px solid rgba(200,64,0,0.2)",
                  borderRadius: "2px", padding: "14px 16px" }}>
                  {msg.role === "assistant" && (
                    <div style={{ fontSize: "9px", color: "#c84000", letterSpacing: "3px", marginBottom: "8px" }}>
                      EL CHASQUI · {currentMode?.label.toUpperCase()}
                    </div>
                  )}
                  <div style={{ fontSize: "13px", lineHeight: "1.85", color: "#d8c090", whiteSpace: "pre-wrap" }}>
                    {msg.content}
                  </div>
                  {msg.role === "assistant" && mode === "builder" && (
                    <ExportPanel content={msg.content} onSaveToLibrary={saveToLibrary} />
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "20px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "2px", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: "14px",
                  background: "rgba(200,64,0,0.15)", border: "1px solid rgba(200,64,0,0.3)" }}>⚡</div>
                <div style={{ background: "rgba(20,10,0,0.8)", border: "1px solid rgba(200,64,0,0.2)", borderRadius: "2px", padding: "14px 16px" }}>
                  <div style={{ fontSize: "9px", color: "#c84000", letterSpacing: "3px", marginBottom: "8px" }}>EL CHASQUI · TRANSMITTING...</div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[0,1,2].map(j => (
                      <div key={j} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ff6a00",
                        animation: `pulse 1.2s ease-in-out ${j * 0.4}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div style={{ position: "relative", zIndex: 10, borderTop: "1px solid #2a1500", padding: "14px 20px", background: "#0d0600" }}>
            {messages.length > 0 && (
              <div style={{ marginBottom: "10px", display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => { setMessages([]); setHistory([]); }} style={{
                  background: "transparent", border: "1px solid #2a1500", color: "#4a3015",
                  fontSize: "10px", letterSpacing: "2px", padding: "4px 12px", cursor: "pointer",
                  fontFamily: "'Courier New', monospace", transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.target.style.borderColor = "#c84000"; e.target.style.color = "#c84000"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "#2a1500"; e.target.style.color = "#4a3015"; }}>
                  ↺ NEW SESSION
                </button>
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
              <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                placeholder={
                  mode === "suno"    ? "Describe your track concept... (Enter to send)" :
                  mode === "tagger"  ? "Enter filename or track description..." :
                  mode === "builder" ? "Describe a track concept, genre, or mood..." :
                                       "Describe your set theme or duration..."
                }
                rows={2} style={{
                  flex: 1, background: "rgba(255,106,0,0.05)", border: "1px solid #3a1800", borderRadius: "2px",
                  color: "#e8d5a0", padding: "12px 14px", fontSize: "13px", fontFamily: "'Courier New', monospace",
                  resize: "none", outline: "none", lineHeight: "1.6", transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "#ff6a00"}
                onBlur={e => e.target.style.borderColor = "#3a1800"} />
              <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
                background: loading || !input.trim() ? "rgba(200,64,0,0.1)" : "rgba(200,64,0,0.9)",
                border: "1px solid #c84000", color: loading || !input.trim() ? "#4a2010" : "#fff",
                padding: "12px 20px", borderRadius: "2px", fontSize: "12px", letterSpacing: "2px",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontFamily: "'Courier New', monospace", fontWeight: "bold", transition: "all 0.2s", minWidth: "70px",
              }}>
                {loading ? "..." : "SEND ⚡"}
              </button>
            </div>
            <div style={{ fontSize: "10px", color: "#3a2010", letterSpacing: "1px", marginTop: "8px", textAlign: "center" }}>
              EL CHASQUI v3.0 · VOLKANIC FREQUENCY NETWORK · VJVOLKAN © 2026
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0500; }
        ::-webkit-scrollbar-thumb { background: #3a1800; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #c84000; }
      `}</style>
    </div>
  );
}
