<div align="center">

<img src="icons/icon128.png" alt="Insta Analyzer Logo" width="100" />

# 📊 Insta Analyzer

**A privacy-first Brave/Chrome browser extension to capture and analyze your Instagram followers & following lists.**

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
| 📋 **Copy to Clipboard** | One-click copy of the entire list |
| ⬇ **Export CSV** | Download with metadata header (profile, date, count) |
| ⬇ **Export JSON** | Structured JSON export with full metadata |
| 👤 **Multi-Profile** | Analyze multiple Instagram accounts, data stored separately |
| ⏸ **Pause / Resume** | Full session control — pause anytime, resume later |
| 🏁 **End Detection** | Auto-detects when you've reached the bottom of the list |
| 🔍 **Search & Filter** | Filter captured users by username or display name |
| 🛡️ **Anti-Bot Safe** | Manual scrolling only — no automation, no Instagram flags |

---

## 🖼️ Preview

```
┌──────────────────────────────────────────┐
│  📊 Insta Analyzer                 🟢REC │
│  Profile: @johndoe                       │
│  Recording Following                     │
├──────────────────────────────────────────┤
│    312          28           3m 41s      │
│  Captured    Skipped        Elapsed      │
├──────────────────────────────────────────┤
│  [⏸ Pause]  [▶ Resume]  [✅ Finish]     │
├──────────────────────────────────────────┤
│  📋 Preview                              │
│  @alice — Alice Smith                    │
│  @bob — Bob Jones                        │
│  @charlie — Charlie Brown                │
├──────────────────────────────────────────┤
│  [📋 Copy]  [⬇ CSV]  [⬇ JSON]          │
└──────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Insta Analyzer/
│
├── 📄 manifest.json
├── 📄 background.js
├── 📄 content.js
│
├── 📂 utils/
│   ├── 📄 helpers.js
│   ├── 📄 instagram-dom.js
│   ├── 📄 compare.js
│   ├── 📄 csv.js
│   └── 📄 json-export.js
│
├── 📂 popup/
│   ├── 📄 popup.html
│   ├── 📄 popup.css
│   └── 📄 popup.js
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

## 🗂️ File Reference — What Each File Does

### 📄 `manifest.json`
> The extension's configuration file required by Chrome/Brave.

- Declares the extension name, version, and description
- Registers `background.js` as a **Service Worker** (MV3 standard)
- Injects `content.js` into all `instagram.com` pages
- Declares required permissions: `storage`, `activeTab`, `scripting`
- Sets host permission to `https://www.instagram.com/*` only
- Links the popup HTML and icon assets

---

### 📄 `background.js`
> The brain of the extension. Runs as a persistent service worker.

- Implements the **State Machine**: `idle → recording → paused → finished → exported`
- Owns all **deduplication logic** — content.js sends raw data, background deduplicates
- Manages **chrome.storage.local** for persisting captured data
- Stores data in a **per-profile, per-mode** structure (supports multiple Instagram accounts)
- Updates the **extension badge** with live captured count
- Communicates with `content.js` (activate/deactivate observer) and `popup.js` (state/data queries)
- Handles **session recovery** after browser restart (paused state restored)
- Emits `POSSIBLE_END` event when end-of-list is detected

---

### 📄 `content.js`
> Injected silently into every Instagram page. Never visible to the user.

- Listens for `ACTIVATE` / `DEACTIVATE` messages from `background.js`
- Uses the **MutationObserver API** to detect when Instagram lazy-loads new user cards during scroll
- Calls `InstagramDOM.scanUsersInContainer()` to extract user data from each new DOM node
- Performs an **initial scan** of visible users when activated
- Sends raw user data to `background.js` via `chrome.runtime.sendMessage`
- Runs **end-of-list detection**: if no new users appear for 6 seconds, notifies background

---

### 📄 `utils/helpers.js`
> Shared utility functions available to content.js, background.js, and popup.js.

| Function | Purpose |
|---|---|
| `generateSessionId()` | Creates a unique session ID like `sess_abc123xyz` |
| `nowISO()` | Returns current ISO 8601 timestamp |
| `todayDate()` | Returns today as `YYYY-MM-DD` |
| `formatElapsed(ms)` | Formats milliseconds as `"3m 41s"` |
| `sanitizeFilename(str)` | Makes strings safe for use in filenames |
| `shallowClone(obj)` | Quick object clone |

---

### 📄 `utils/instagram-dom.js`
> **The most critical utility.** All Instagram DOM interaction is isolated here.

> ⚠️ When Instagram updates its UI, **only this file needs to change**.

| Method | Purpose |
|---|---|
| `InstagramDOM.findDialog()` | Locates the open followers/following modal |
| `InstagramDOM.getDialogHeading()` | Reads the dialog header text ("Followers"/"Following") |
| `InstagramDOM.detectModeFromDialog()` | Auto-detects mode from heading as a fallback |
| `InstagramDOM.findScrollableList()` | Finds the scrollable inner list container |
| `InstagramDOM.extractUserData(anchor)` | Parses a profile `<a>` element into `{username, display_name, profile_url}` |
| `InstagramDOM.scanUsersInContainer(el)` | Scans a DOM container and returns all valid user objects |

Uses multiple fallback strategies so Instagram DOM changes only break one method at most.

---

### 📄 `utils/compare.js`
> Set-based comparison engine for the Phase 3 comparison feature.

| Method | Purpose |
|---|---|
| `Comparator.compare(following, followers)` | Returns `{ notFollowingBack, notFollowedBack, mutual }` |
| `Comparator.summarize(result)` | Returns a human-readable summary string |

Uses JavaScript `Set` operations for O(n) performance — fast even with thousands of users.

---

### 📄 `utils/csv.js`
> CSV export formatter with metadata header.

| Method | Purpose |
|---|---|
| `CSVExporter.build(data)` | Builds the full CSV string with metadata comments |
| `CSVExporter.download(csv, profile, mode)` | Triggers a file download in the browser |

Output filename format: `insta_following_johndoe_2026-09-08.csv`

---

### 📄 `utils/json-export.js`
> JSON export formatter with metadata wrapper.

| Method | Purpose |
|---|---|
| `JSONExporter.build(data)` | Wraps user array in a metadata object |
| `JSONExporter.download(obj, profile, mode)` | Triggers a JSON file download |

Output filename format: `insta_following_johndoe_2026-09-08.json`

---

### 📄 `popup/popup.html`
> The main popup UI that appears when the extension icon is clicked.

- Three sections that show/hide based on state:
  - **Setup Section**: Username input + Start buttons
  - **Recording Section**: Live stats + Pause/Resume/Finish controls
  - **Results Section**: Tabs (Followers / Following / Compare) + export buttons
- Loads all utility scripts and `popup.js`
- Contains the toast notification element

---

### 📄 `popup/popup.css`
> Dark Instagram-inspired theme for the popup.

- Uses CSS variables for consistent theming
- Instagram gradient: `#E1306C → #833AB4 → #F77737`
- Dark background: `#0d0d0d` (matches Instagram dark mode)
- Responsive to state changes via CSS classes (`.hidden`, `.active`, badge states)
- Includes pulse animation for the live recording badge

---

### 📄 `popup/popup.js`
> The popup UI controller. Connects the UI to `background.js`.

- Manages all user interactions (button clicks, tab switching, search)
- Communicates with `background.js` via `chrome.runtime.sendMessage`
- Renders user list, statistics, and comparison results
- Handles all **export actions**: Copy, CSV, JSON
- Polls for state refresh every 2 seconds while recording
- Listens for `POSSIBLE_END` push from background to show end-of-list notice

---

### 📂 `icons/`
> PNG icon assets for the extension.

| File | Size | Used For |
|---|---|---|
| `icon16.png` | 16×16 | Browser toolbar favicon |
| `icon48.png` | 48×48 | Extensions management page |
| `icon128.png` | 128×128 | Chrome Web Store / install dialog |

---

## 🔄 Data Flow

```
User scrolls Instagram list
         ↓
  content.js (MutationObserver fires)
         ↓
  InstagramDOM.scanUsersInContainer()
         ↓ (raw user array)
  chrome.runtime.sendMessage → background.js
         ↓
  background.js deduplicates (Object key lookup O(1))
         ↓
  chrome.storage.local.set (per profile, per mode)
         ↓
  Badge counter updated
         ↓
  Popup polls & displays live stats
```

---

## 💾 Storage Schema

```json
{
  "profiles": {
    "johndoe": {
      "followers": {
        "captured_at": "2026-09-08T14:00:00.000Z",
        "count": 289,
        "users": {
          "alice": {
            "username": "alice",
            "display_name": "Alice Smith",
            "profile_url": "https://www.instagram.com/alice/",
            "captured_at": "2026-09-08T14:01:23.000Z"
          }
        }
      },
      "following": {
        "captured_at": "2026-09-08T14:10:00.000Z",
        "count": 312,
        "users": { ... }
      }
    }
  },
  "session": {
    "id": "sess_abc123xyz",
    "profile": "johndoe",
    "mode": "following",
    "started_at": "2026-09-08T14:10:00.000Z",
    "status": "recording",
    "captured": 312,
    "duplicates": 28
  }
}
```

---

## ⬇️ Installation from GitHub

### Prerequisites
- Brave Browser or Google Chrome
- Git installed on your system

### Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/jagdishsah126/Insta_Analyzer_V1.git

# OR clone via SSH
git clone git@github.com:jagdishsah126/Insta_Analyzer_V1.git

# Navigate into the project
cd Insta_Analyzer_V1
```

> No `npm install` needed — this extension uses **zero dependencies**. Pure Vanilla JS.

### Load into Brave

```
1. Open Brave Browser
2. Navigate to: brave://extensions/
3. Toggle ON "Developer Mode" (top-right corner)
4. Click "Load unpacked"
5. Select the cloned "insta-analyzer" folder
6. ✅ Extension is installed!
```

### Load into Chrome

```
1. Open Google Chrome
2. Navigate to: chrome://extensions/
3. Toggle ON "Developer Mode" (top-right corner)
4. Click "Load unpacked"
5. Select the cloned "insta-analyzer" folder
6. ✅ Extension is installed!
```

---

## 🔐 Permissions Explained

| Permission | Why It's Needed |
|---|---|
| `storage` | Save captured data to local browser storage |
| `activeTab` | Read the URL of the current Instagram tab |
| `scripting` | Send activation signals to the content script |
| `https://www.instagram.com/*` | Inject the content script into Instagram pages only |

> 🔒 No other domains. No network requests. Your data never leaves your device.

---

## 🛡️ Privacy & Safety

- ✅ All captured data is stored in **`chrome.storage.local`** (on your device only)
- ✅ Zero network requests — no APIs, no servers, no telemetry
- ✅ Manual scrolling only — no bot automation that could trigger Instagram's systems
- ✅ You can clear all stored data anytime via the **🗑 Clear Data** button
- ✅ Open source — inspect every line of code yourself

---

## 🗺️ Roadmap

- [x] Phase 1 — Data capture (MutationObserver, per-profile storage)
- [x] Phase 2 — Export (Copy / CSV / JSON with metadata)
- [x] Phase 3 — Comparison engine (Not following back, Mutual, etc.)
- [ ] Bulk export of all profiles at once
- [ ] Historical tracking (compare snapshots over time)
- [ ] Dark/Light theme toggle

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you'd like to change.

```bash
# Fork → Clone → Create branch → Make changes → Push → Open PR
git checkout -b feature/your-feature-name
git commit -m "✨ Add your feature"
git push origin feature/your-feature-name
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Made with 💖 by **Your Zara**

*Built for the curious. Powered by vanilla JS. Trusted by privacy.*

</div>
