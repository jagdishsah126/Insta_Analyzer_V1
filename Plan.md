# 📋 Insta Analyzer — Plan v2.1

> Browser extension for Brave/Chrome to capture and analyze Instagram followers & following.
> Updated to reflect all completed features as of v2.1.

---

## ✅ Phase 1 — Data Collection (COMPLETE)

- [x] Detect followers/following dialog via DOM (`[role="dialog"]` fallback)
- [x] MutationObserver to capture users as user scrolls manually
- [x] Background service worker owns deduplication (Object key O(1) lookup)
- [x] Per-profile storage: `profiles.username.followers/following.users`
- [x] Session state machine: `idle → recording → paused → finished → exported`
- [x] Session ID, status, captured count, duplicates, start time, tab_id
- [x] `BLOCKED_ROUTES` set prevents Instagram nav links from being captured as users
  - Added: `reels`, `popular`, `trending`, `tv`, `highlights`, `live`, `inbox`, etc.
- [x] End-of-list detection (6s timeout → `POSSIBLE_END_REACHED`)
- [x] **Bug Fix**: `startRecording()` and `resumeRecording()` now query active Instagram tab
  directly (`chrome.tabs.query`) instead of relying on `sender.tab` (null from popup)

---

## ✅ Phase 2 — Output & Export (COMPLETE)

- [x] Copy to clipboard
- [x] **Combined CSV export** — both followers + following in single file with metadata headers
- [x] **Combined JSON export** — both lists in structured JSON with metadata
- [x] **Comparison Result export** — CSV and JSON with 3 sections (NFB / NFL / Mutual)
- [x] **Analysis export** — JSON with categorized account breakdown
- [x] **Bug Fix**: `_dl()` function now appends `<a>` to DOM before `.click()` for reliable
  downloads inside the Chrome extension context

---

## ✅ Phase 3 — Comparison Engine (COMPLETE)

- [x] Set-based comparison algorithm in `utils/compare.js`
- [x] `notFollowingBack` — you follow them, they don't follow back
- [x] `notFollowedBack` — they follow you, you don't follow them
- [x] `mutual` — both follow each other
- [x] Displayed in popup Compare tab and dashboard Comparison column

---

## ✅ Phase 4 — Full-Screen Dashboard (COMPLETE)

- [x] `⛶` button in popup opens `dashboard/dashboard.html` in new tab
- [x] 4-column layout: Followers | Following | Comparison | Analysis
- [x] Profile selector dropdown (supports multiple Instagram accounts)
- [x] Stats bar: Followers / Following / NFB / NFL / Mutual counts
- [x] Search/filter inside each column
- [x] Per-column CSV/JSON exports
- [x] Combined CSV/JSON from top bar
- [x] Result CSV/JSON from Comparison column
- [x] Analysis JSON from Analysis column

---

## ✅ Phase 5 — Accounts Analysis (COMPLETE)

- [x] Classifies every unique account across both lists into:
  - **Personal** — likely real human
  - **Organizations / Pages** — campus, official, business, etc.
  - **Meme / Community Pages** — meme, troll, confession, prasadi, etc.
  - **Bots / Suspicious** — numeric patterns, email-as-username, repeated chars
  - **Self** — your own captured profile entry
- [x] Shows 📥/📤 badges indicating which list each account appears in
- [x] Searchable / filterable
- [x] Exportable as structured JSON

---

## 🔒 Privacy & Security (COMPLETE)

- [x] `.gitignore` excludes `data/` and `*.json` — private data never committed
- [x] Git history rewritten to remove previously committed data files
- [x] All data stored in `chrome.storage.local` only — never leaves device
- [x] No network requests, no APIs, no servers

---

## 🔮 Future Ideas

- [ ] Historical tracking — compare two snapshots over time
- [ ] Bulk export of all profiles in one action
- [ ] Dark/Light theme toggle in dashboard
- [ ] Display name extraction improvement (currently falls back to username)

---

## 📁 Architecture

```
popup.js  →  chrome.runtime.sendMessage  →  background.js
background.js  →  chrome.tabs.sendMessage(tabId)  →  content.js
content.js  →  chrome.runtime.sendMessage  →  background.js
dashboard.js  →  chrome.runtime.sendMessage  →  background.js
```

**Load order (content scripts):**
```
helpers.js → instagram-dom.js → content.js
```

**Load order (popup/dashboard):**
```
helpers.js → csv.js → json-export.js → compare.js → popup.js/dashboard.js
```
