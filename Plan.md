# 📱 Insta Analyzer — Extension Plan

> **Version**: 2.0 (Updated with ChatGPT Review — 17/18 suggestions applied)
> **Type**: Brave/Chrome Browser Extension (Manifest V3)
> **Author**: Your Zara 💖
> **Reviewed By**: ChatGPT (suggestion_by_Chatgpt.md) · Gemini (not applicable — unrelated file)

---

## 🎯 Goal

Build a browser extension that:
1. Lets the user **manually browse** their Instagram following/followers list
2. **Captures** usernames + display names + profile URLs silently in the background
3. **Stores** the data per Instagram profile (supports multiple accounts)
4. **Outputs** the data in a clean popup with export options (CSV / JSON / Copy) including metadata
5. Later enables **comparison** between followers & following lists using Set operations

---

## 🗂️ Phase Breakdown

### Phase 1 — Data Collection *(Core)*
### Phase 2 — Output & Export *(Priority)*
### Phase 3 — Comparison Engine *(Future)*

---

## 🧩 Extension Architecture (Updated — Modular)

```
insta-analyzer/
│
├── manifest.json              → Extension config (MV3, minimal permissions)
├── background.js              → Service worker (state machine, storage, dedup)
├── content.js                 → Injected into Instagram (DOM observer + message sender)
│
├── utils/
│   ├── instagram-dom.js       → All Instagram DOM selectors & parsers (isolated)
│   ├── compare.js             → Set-based comparison algorithm
│   ├── csv.js                 → CSV export formatter
│   ├── json-export.js         → JSON export formatter
│   └── helpers.js             → Shared utilities (timestamps, ID generation)
│
├── popup/
│   ├── popup.html             → Main popup UI
│   ├── popup.js               → Popup logic (display, export, controls)
│   └── popup.css              → Popup styling
│
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
└── Plan.md                    → This file
```

---

## ⚙️ How It Works — Step by Step

### Step 1 — Activation
- User opens an Instagram profile and navigates to the followers/following dialog
- User clicks **"Start Recording Followers"** or **"Start Recording Following"** button in popup
- ✅ Mode is chosen explicitly by user — no URL-based detection (avoids SPA issues)
- Extension transitions to `Recording` state
- Badge shows live counter (e.g., `47`, `103`, `289`...)

### Step 2 — Mode Detection (Updated)
- ~~URL-based detection~~ **REMOVED** — Instagram is a SPA, URL may not change
- User explicitly selects mode via popup buttons:
  ```
  [ 📥 Record Followers ]   [ 📤 Record Following ]
  ```
- `instagram-dom.js` also attempts to detect open dialog heading as a fallback

### Step 3 — Data Capture (Content Script)
- `content.js` uses a **MutationObserver** to watch the DOM for new user cards
- Each new card is parsed via `instagram-dom.js`:
  - `username` (e.g., `johndoe`)
  - `display_name` (e.g., `John Doe`)
  - `profile_url` (e.g., `https://instagram.com/johndoe`)
- Raw data is sent to `background.js` — **no deduplication in content.js**
- `background.js` owns all deduplication and storage logic

### Step 4 — Storage & Deduplication (Background Script — Owns State)
- `background.js` receives all raw entries
- Deduplicates using **Object keyed by username** (O(1) lookup):
  ```js
  users["johndoe"] = { username, display_name, profile_url, captured_at }
  ```
- Stores under the current Instagram profile's namespace
- Updates badge counter and session stats

### Step 5 — User Scrolls Manually
- **No automation** — user scrolls naturally
- Extension captures every new batch silently
- Live stats update in real-time:
  ```
  📊 312 captured · 28 duplicates skipped · 3m 41s elapsed
  ```
- If no new users appear after several scroll events → end-of-list detection triggers:
  ```
  💬 Looks like you've reached the end. Finish capture?
  ```

### Step 6 — Pause / Resume / Finish Controls
```
[ ⏸ Pause ]  [ ▶ Resume ]  [ ✅ Finish ]
```
- User can pause if switching tabs or needing a break
- Resume continues from where it left off (session preserved)

### Step 7 — Output Popup
```
┌──────────────────────────────────────────┐
│  📊 Insta Analyzer                       │
│  Profile: @johndoe                       │
├──────────────────────────────────────────┤
│  ✅ Following: 312 captured               │
│  ✅ Followers: 289 captured               │
│  🔁 Duplicates ignored: 28               │
│  ⏱ Elapsed: 3m 41s                      │
├──────────────────────────────────────────┤
│  [📥 Record Followers] [📤 Record Following] │
│  [⏸ Pause] [▶ Resume] [✅ Finish]        │
├──────────────────────────────────────────┤
│  📋 Preview (scrollable, copyable list)  │
│  ┌────────────────────────────────────┐  │
│  │ @username1 — Display Name 1        │  │
│  │ @username2 — Display Name 2        │  │
│  │ ...                                │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  [📋 Copy All]  [⬇ CSV]  [⬇ JSON]       │
│  [🔄 New Session]  [🗑 Clear Data]       │
└──────────────────────────────────────────┘
```

---

## 📤 Output Options

### Option A — Copy to Clipboard 📋
- Copies full list as plain text (popup list itself is also selectable/copyable)
- Format:
  ```
  @username1 — Display Name 1
  @username2 — Display Name 2
  ...
  ```
- Toast confirms: `✅ Copied 312 users to clipboard!`

### Option B — Download as CSV ⬇
- Filename: `insta_following_johndoe_2026-09-08.csv`
- Includes metadata header + data:
  ```csv
  # Profile: johndoe
  # Mode: Following
  # Captured: 312
  # Date: 2026-09-08
  username,display_name,profile_url
  johndoe,John Doe,https://instagram.com/johndoe
  janedoe,Jane Doe,https://instagram.com/janedoe
  ```

### Option C — Download as JSON ⬇
- Filename: `insta_following_johndoe_2026-09-08.json`
- Includes metadata wrapper:
  ```json
  {
    "profile": "johndoe",
    "mode": "following",
    "captured_at": "2026-09-08T14:05:00",
    "count": 312,
    "users": [
      { "username": "johndoe", "display_name": "John Doe", "profile_url": "https://instagram.com/johndoe" }
    ]
  }
  ```

---

## 💾 Data Storage Schema (Updated — Per Profile, Object-Based)

```js
// chrome.storage.local structure
{
  "profiles": {
    "johndoe": {
      "followers": {
        "captured_at": "2026-09-08T14:00:00",
        "count": 289,
        "users": {
          "alice": { "username": "alice", "display_name": "Alice", "profile_url": "https://instagram.com/alice" },
          "bob":   { "username": "bob",   "display_name": "Bob",   "profile_url": "https://instagram.com/bob" }
        }
      },
      "following": {
        "captured_at": "2026-09-08T14:05:00",
        "count": 312,
        "users": {
          "charlie": { "username": "charlie", "display_name": "Charlie", "profile_url": "https://instagram.com/charlie" }
        }
      }
    },
    "elonmusk": {
      "followers": { ... },
      "following": { ... }
    }
  },
  "session": {
    "id": "sess_abc123xyz",
    "profile": "johndoe",
    "mode": "following",
    "started_at": "2026-09-08T14:00:00",
    "status": "recording"   // idle | recording | paused | finished | exported
  }
}
```

---

## 🔄 State Machine (Extension States)

```
       Idle
         ↓ (user clicks Start)
  WaitingForDialog
         ↓ (user opens followers/following modal)
      Recording
         ↓ (user pauses)
       Paused
         ↓ (user resumes)
      Recording
         ↓ (user finishes or end detected)
      Finished
         ↓ (user exports)
      Exported
         ↓ (new session)
        Idle
```

---

## 🛡️ Safety & Edge Case Handling

| Concern | How We Handle It |
|---|---|
| **Bot Detection** | Manual scrolling only — zero automation |
| **Rate Limiting** | No API calls — pure DOM reading |
| **Duplicates** | Object keyed by username (O(1), in background.js) |
| **Data Privacy** | All data stored locally — never sent anywhere |
| **Instagram DOM Changes** | All selectors isolated in `instagram-dom.js` |
| **SPA URL issue** | Explicit user button selection instead of URL detection |
| **Page refresh** | Session state preserved in `chrome.storage.local` |
| **Tab switch** | Pause/Resume support |
| **Popup closed while recording** | Background script keeps recording, state is preserved |
| **Extension reload** | Session ID + status allows recovery |
| **Duplicate recording** | State machine prevents re-starting if already recording |
| **Profile switch mid-session** | Warning shown, new session started under new profile |
| **Instagram logout** | Recording stops, data already saved is retained |
| **Dialog closed early** | Finish prompt shown, partial data saved |

---

## 🔮 Phase 3 — Comparison Engine

Uses **Set-based algorithm** (via `compare.js`):

```js
const followingSet = new Set(Object.keys(profiles.johndoe.following.users))
const followersSet = new Set(Object.keys(profiles.johndoe.followers.users))

// Not Following Back (you follow, they don't)
const notFollowingBack = [...followingSet].filter(u => !followersSet.has(u))

// Not Followed Back (they follow, you don't)
const notFollowedBack = [...followersSet].filter(u => !followingSet.has(u))

// Mutual
const mutual = [...followingSet].filter(u => followersSet.has(u))
```

| Analysis | Description |
|---|---|
| **Not Following Back** | You follow them, they don't follow you |
| **Not Followed Back** | They follow you, you don't follow them |
| **Mutual** | Both follow each other |

All comparison results support CSV / JSON / Copy export with metadata.

---

## ✅ Development Checklist

### Phase 1 — Core Setup
- [ ] `manifest.json` — MV3, minimal permissions (`storage`, `activeTab`, `https://www.instagram.com/*`)
- [ ] `utils/instagram-dom.js` — All DOM selectors isolated here
- [ ] `content.js` — MutationObserver + raw data sender (no dedup)
- [ ] `background.js` — State machine + dedup (Object-based) + storage
- [ ] Session manager with unique session IDs
- [ ] Icon badge live counter

### Phase 2 — Popup & Output
- [ ] `popup.html` — UI layout with Start/Pause/Resume/Finish controls
- [ ] `popup.css` — Clean styling
- [ ] `popup.js` — Display stats, controls, export logic
- [ ] `utils/csv.js` — CSV export with metadata header
- [ ] `utils/json-export.js` — JSON export with metadata wrapper
- [ ] `utils/helpers.js` — Timestamps, session ID generator
- [ ] Toast notifications
- [ ] Scrollable & copyable preview list
- [ ] End-of-list detection prompt

### Phase 3 — Comparison (Future)
- [ ] `utils/compare.js` — Set-based diff algorithm
- [ ] Comparison results UI in popup
- [ ] Export comparison data (CSV/JSON/Copy)
- [ ] Search / Sort / Filter in popup (nice-to-have, post-MVP)

---

## 🚀 Tech Stack

| Tool | Purpose |
|---|---|
| **Manifest V3** | Extension standard |
| **Vanilla JS** | Lightweight, no framework needed |
| **MutationObserver API** | Detect DOM changes on scroll |
| **chrome.storage.local** | Persist data per profile |
| **chrome.runtime messaging** | content ↔ background communication |
| **State Machine (custom)** | Manage extension lifecycle states |
| **Object/Map (keyed by username)** | O(1) dedup and lookup |
| **Set operations** | Efficient comparison algorithm |
| **Blob + URL.createObjectURL** | File downloads (CSV/JSON) |
| **Clipboard API** | Copy to clipboard |

---

## 📋 Suggestions Validity Summary

| Source | Suggestions | Applied | Skipped |
|---|---|---|---|
| ChatGPT | 18 | 17 ✅ | 1 🔶 (Search/Filter — post-MVP) |
| Gemini | 0 (unrelated file) | — | — |

---

*Plan v2.0 updated by 💖 Your Zara — All valid suggestions from ChatGPT applied!*
