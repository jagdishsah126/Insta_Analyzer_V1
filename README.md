<div align="center">

<img src="icons/icon128.png" alt="Insta Analyzer Logo" width="100" />

# 📊 Insta Analyzer

**A privacy-first Brave/Chrome browser extension to capture, analyze and compare your Instagram followers & following lists.**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue?style=flat-square)](#)
[![Brave Compatible](https://img.shields.io/badge/Brave-Compatible-orange?style=flat-square)](#)
[![Chrome Compatible](https://img.shields.io/badge/Chrome-Compatible-yellow?style=flat-square)](#)
[![Vanilla JS](https://img.shields.io/badge/Built%20With-Vanilla%20JS-f7df1e?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#)

> 🔒 **100% Local** — No data ever leaves your browser. No servers. No tracking.

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📥 **Capture Followers** | Record every follower as you scroll manually |
| 📤 **Capture Following** | Record every account you follow as you scroll |
| 🔄 **Compare Lists** | Find who doesn't follow you back (and vice versa) |
| 🔬 **Accounts Analysis** | Categorize accounts: Personal / Org / Meme Pages / Bots |
| ⛶ **Full-Screen Dashboard** | Open data in a beautiful 4-column full-screen view |
| 📋 **Copy to Clipboard** | One-click copy of the entire list |
| ⬇ **Combined Export** | Download both lists together in one CSV/JSON |
| ⬇ **Result Download** | Download comparison result (who doesn't follow back, etc.) |
| ⬇ **Analysis Export** | Download categorized account analysis as JSON |
| 👤 **Multi-Profile** | Analyze multiple Instagram accounts stored separately |
| ⏸ **Pause / Resume** | Full session control — pause anytime, resume later |
| 🏁 **End Detection** | Auto-detects when you've scrolled to the last user |
| 🔍 **Search & Filter** | Filter any column by username or display name |
| 🛡️ **Anti-Bot Safe** | Manual scrolling only — no automation, no Instagram flags |

---

## 🖥️ Full-Screen Dashboard

Click the **⛶** button in the popup to open the full-screen dashboard in a new tab:

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  📥 Followers│  📤 Following│  🔄 Comparison│ 🔬 Analysis  │
│  195 users   │  189 users   │ NFB / NFL /M  │ Personal/Bot │
│  🔍 Search   │  🔍 Search   │  🔍 Search   │  🔍 Filter   │
│              │              │              │              │
│  @alice ↗   │  @bob  ↗    │ ❌ NFB (12)  │ 👤 Personal  │
│  @bob   ↗   │  @alice ↗   │  @user1 ↗   │  @alice ↗   │
│  ...         │  ...         │ 👤 NFL (8)  │ 🏢 Org/Pages │
│              │              │  @user4 ↗   │  @wrc...  ↗  │
│ [⬇CSV][⬇JSON]│[⬇CSV][⬇JSON]│ [⬇CSV][⬇JSON]│  [⬇ JSON]   │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 📁 Project Structure

```
Insta Analyzer/
│
├── 📄 manifest.json          — MV3 config, permissions, content script
├── 📄 background.js          — Service worker: state machine, storage, dedup
├── 📄 content.js             — MutationObserver DOM scanner
├── 📄 .gitignore             — Excludes data/ and *.json from git
│
├── 📂 utils/
│   ├── 📄 helpers.js         — Shared utilities (generateId, nowISO, formatElapsed...)
│   ├── 📄 instagram-dom.js   — ALL Instagram DOM selectors isolated here
│   ├── 📄 compare.js         — Set-based follower comparison engine
│   ├── 📄 csv.js             — CSV export: single, combined, result
│   └── 📄 json-export.js     — JSON export: single, combined, result
│
├── 📂 popup/
│   ├── 📄 popup.html         — Mini popup UI (recording + results)
│   ├── 📄 popup.css          — Dark Instagram-themed styles
│   └── 📄 popup.js           — Popup controller + ⛶ dashboard button
│
├── 📂 dashboard/
│   ├── 📄 dashboard.html     — Full-screen 4-column data view
│   ├── 📄 dashboard.css      — Dashboard styles
│   └── 📄 dashboard.js       — Dashboard controller + analysis engine
│
├── 📂 icons/
│   ├── 🖼️ icon16.png
│   ├── 🖼️ icon48.png
│   └── 🖼️ icon128.png
│
├── 📄 Plan.md
├── 📄 README.md
└── 📄 guide.md
```

---

## 🗂️ File Reference

### 📄 `manifest.json`
Declares the extension, registers the service worker, injects content script into Instagram, sets minimal permissions: `storage`, `activeTab`, `scripting`.

### 📄 `background.js`
The brain — implements the state machine (`idle → recording → paused → finished → exported`), deduplicates captured users, manages `chrome.storage.local`, updates the badge counter, and routes messages between popup and content script. **Fixed**: queries active Instagram tab directly instead of relying on `sender.tab` (which is null from popup context).

### 📄 `content.js`
Injected silently into every Instagram page. Uses `MutationObserver` to detect new user cards as you scroll. Sends raw data to background.js. Detects end-of-list after 6 seconds of no new users.

### 📄 `utils/helpers.js`
Shared utilities: `generateSessionId()`, `nowISO()`, `todayDate()`, `formatElapsed()`, `sanitizeFilename()`.

### 📄 `utils/instagram-dom.js`
**Most critical file.** All Instagram selectors isolated here — `findDialog()`, `findScrollableList()`, `extractUserData()`, `scanUsersInContainer()`. Extended `BLOCKED_ROUTES` set prevents Instagram nav links (`/reels/`, `/popular/`, etc.) from being captured as real users.

### 📄 `utils/compare.js`
Set-based comparison: `Comparator.compare(followingUsers, followersUsers)` → `{ notFollowingBack, notFollowedBack, mutual }`.

### 📄 `utils/csv.js`
Three export modes:
- `build()` / `download()` — single mode
- `buildCombined()` / `downloadCombined()` — both lists in one file
- `buildResult()` / `downloadResult()` — comparison result

### 📄 `utils/json-export.js`
Same three modes as csv.js but JSON format. **Fixed**: uses `document.body.appendChild(a)` before `.click()` for reliable downloads in extension context.

### 📄 `popup/popup.html` + `popup.css` + `popup.js`
Mini popup (360px). Three sections: Setup → Recording → Results. Includes **⛶ fullscreen button** that opens `dashboard/dashboard.html` in a new tab. Export buttons download **combined** (both lists) CSV/JSON.

### 📄 `dashboard/dashboard.html` + `dashboard.css` + `dashboard.js`
Full-screen 4-column dashboard:
1. **📥 Followers** — scrollable list, search, per-column CSV/JSON
2. **📤 Following** — scrollable list, search, per-column CSV/JSON
3. **🔄 Comparison** — Not Following Back / Not Followed Back / Mutual + result export
4. **🔬 Accounts Analysis** — categorizes ALL accounts into Personal / Organizations / Meme Pages / Bots / Self. Searchable. Exports JSON.

---

## 🔬 Accounts Analysis

The dashboard automatically classifies every account across both lists:

| Category | Detection Method |
|---|---|
| 👤 **Personal** | No matching patterns — likely a real human |
| 🏢 **Organizations / Pages** | Keywords: `official`, `campus`, `wrc`, `nepal`, `market`, `store`, etc. |
| 😂 **Meme / Community Pages** | Keywords: `meme`, `troll`, `confession`, `prasadi`, `bekar`, etc. |
| 🤖 **Bots / Suspicious** | Patterns: 5+ digit sequences, email-as-username, repeating chars, known bot usernames |
| 👤 **Your Own Account** | Matches the profile username you entered |

---

## 🔄 Data Flow

```
User scrolls Instagram list
         ↓
  content.js (MutationObserver fires)
         ↓ InstagramDOM.scanUsersInContainer()
         ↓ chrome.runtime.sendMessage → background.js
         ↓ Dedup + chrome.storage.local.set
         ↓ Badge updated
         ↓ Popup polls → shows live stats
         ↓ Dashboard → renders all 4 columns on open
```

---

## 💾 Storage Schema

```json
{
  "profiles": {
    "yourusername": {
      "followers": { "captured_at": "...", "count": 195, "users": { "alice": {...} } },
      "following":  { "captured_at": "...", "count": 189, "users": { "bob": {...}   } }
    }
  },
  "session": {
    "id": "sess_abc123", "profile": "yourusername", "mode": "followers",
    "status": "recording", "captured": 195, "tab_id": 42
  }
}
```

---

## ⬇️ Installation from GitHub

```bash
# Clone
git clone https://github.com/jagdishsah126/Insta_Analyzer_V1.git
cd Insta_Analyzer_V1
```

> No `npm install` needed — pure Vanilla JS, zero dependencies.

**Load in Brave:**
```
brave://extensions/ → Developer Mode ON → Load unpacked → select folder
```

**Load in Chrome:**
```
chrome://extensions/ → Developer Mode ON → Load unpacked → select folder
```

---

## 🔐 Permissions Explained

| Permission | Why |
|---|---|
| `storage` | Save captured data locally |
| `activeTab` | Read the current Instagram tab |
| `scripting` | Send activation signals to content script |
| `https://www.instagram.com/*` | Inject content script into Instagram only |

> 🔒 Zero network requests. No APIs. No servers. All data stays on your device.

---

## 🗺️ Roadmap

- [x] Phase 1 — Data capture (MutationObserver, per-profile storage)
- [x] Phase 2 — Export (Copy / Combined CSV / JSON with metadata)
- [x] Phase 3 — Comparison engine (Not following back, Mutual, etc.)
- [x] Phase 4 — Full-screen Dashboard (4-column view)
- [x] Phase 5 — Accounts Analysis (Personal / Org / Meme / Bot classification)
- [ ] Historical tracking (compare snapshots over time)
- [ ] Bulk export of all profiles
- [ ] Dark/Light theme toggle

---

## 📄 License

MIT License

---

<div align="center">
Made with 💖 by <strong>Your Zara</strong> · Built for the curious · Powered by vanilla JS
</div>
