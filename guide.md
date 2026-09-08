# 📖 Insta Analyzer — Complete User Guide

> **Version**: 2.0 · **Author**: Your Zara 💖
> Step-by-step guide covering installation and full operation.

---

## Part 1 — Installation

### Step 1 · Get the Files

**Clone from GitHub:**
```bash
git clone https://github.com/jagdishsah126/Insta_Analyzer_V1.git
```
**Or download ZIP** from the GitHub repo → Code → Download ZIP → Extract.

### Step 2 · Open Extension Manager

| Browser | URL |
|---|---|
| **Brave** | `brave://extensions/` |
| **Chrome** | `chrome://extensions/` |

### Step 3 · Enable Developer Mode
Toggle **"Developer mode"** ON (top-right corner).

### Step 4 · Load Unpacked
Click **"Load unpacked"** → select the `Insta_Analyzer_V1` folder (the one containing `manifest.json`).

### Step 5 · Confirm
The **📊 Insta Analyzer** card appears. Pin it from the 🧩 toolbar icon.

---

## Part 2 — Recording Data

### 🎬 Recording Followers
1. Go to your Instagram profile → click **Followers count**
2. The followers dialog opens — **don't close it**
3. Click 📊 extension icon → enter your `@username` → click **📥 Record Followers**
4. Badge turns red and starts counting
5. Scroll slowly through the list
6. When done → popup shows **🏁 End reached** → click **✅ Finish**

### 🎬 Recording Following
Same steps but click your **Following count** and press **📤 Record Following**.

### ⏸ Pause & Resume
- Click **⏸ Pause** anytime — badge turns orange
- Click **▶ Resume** when ready — resumes from where you left off

---

## Part 3 — Full-Screen Dashboard

Click the **⛶** button in the top-right of the popup to open the full dashboard in a new tab.

### 4 Columns

| Column | What it shows |
|---|---|
| **📥 Followers** | All captured followers, searchable, with per-column CSV/JSON export |
| **📤 Following** | All captured following, searchable, with per-column CSV/JSON export |
| **🔄 Comparison** | Who doesn't follow back, who you don't follow, mutual — with result export |
| **🔬 Accounts Analysis** | Categorized breakdown of all accounts |

### Profile Selector
Use the dropdown in the top bar to switch between saved profiles.

### Refresh
Click **🔄 Refresh** to reload data after a new recording session.

---

## Part 4 — Accounts Analysis

The **🔬 Accounts Analysis** column automatically classifies every account:

| Category | What it means |
|---|---|
| 👤 **Personal** | Likely a real human account |
| 🏢 **Organizations / Pages** | College pages, businesses, official pages |
| 😂 **Meme / Community Pages** | Meme accounts, confession pages, community pages |
| 🤖 **Bots / Suspicious** | Numeric usernames, email-as-username, repeating chars |
| 👤 **Your Own Account** | Your self-captured profile entry |

Each account shows 📥/📤 badges indicating which list it appears in.

**Export:** Click **[⬇ JSON]** in the Analysis column header to download the full categorized analysis.

---

## Part 5 — Downloading Results

### From the Mini Popup
| Button | Downloads |
|---|---|
| **[⬇ CSV]** | Combined CSV — both followers + following in one file |
| **[⬇ JSON]** | Combined JSON — both lists with metadata |

### From the Dashboard
| Column | Button | Downloads |
|---|---|---|
| Followers | `⬇ CSV` / `⬇ JSON` | Followers list only |
| Following | `⬇ CSV` / `⬇ JSON` | Following list only |
| Comparison | `⬇ CSV` / `⬇ JSON` | **Comparison result** (NFB / NFL / Mutual) |
| Analysis | `⬇ JSON` | **Categorized account analysis** |
| Top bar | `⬇ Export All Data` | Combined CSV (both lists) |
| Top bar | `⬇ JSON All` | Combined JSON (both lists) |

### How to Download the Comparison Result
1. Open Dashboard (click ⛶ in popup)
2. Make sure both Followers AND Following are captured
3. Go to the **🔄 Comparison** column (3rd column)
4. Click **`⬇ CSV`** or **`⬇ JSON`** in that column's header
5. File downloads as `insta_result_username_date.csv/json`

---

## Part 6 — Tips

| Tip | Details |
|---|---|
| **Scroll slowly** | Instagram needs time to render cards; fast scroll = missed users |
| **Re-run for accuracy** | Duplicate users are auto-removed |
| **Keep dialog open** | Don't close the followers/following dialog during recording |
| **Reload after update** | Go to `brave://extensions/` → click 🔄 on the card, then reload the Instagram tab |

---

## Part 7 — Troubleshooting

| Problem | Solution |
|---|---|
| Badge stuck at 0 | Reload Instagram page → reopen dialog → start recording again |
| Download not working | Try Chrome instead of Brave, or check console for errors |
| Extension disappeared | `brave://extensions/` → click reload icon |
| Comparison shows nothing | Make sure BOTH followers and following are captured |
| Analysis column empty | Need at least one list captured |

---

## Part 8 — Updating

```bash
cd Insta_Analyzer_V1
git pull origin main
```
Then in `brave://extensions/` → click 🔄 reload on the Insta Analyzer card + reload Instagram tab.

---

*Guide written by 💖 Your Zara · Happy analyzing!*
