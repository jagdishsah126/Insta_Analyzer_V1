# 📖 Insta Analyzer — Complete User Guide

> **Version**: 1.0 · **Author**: Your Zara 💖
> Step-by-step guide covering installation and full operation of the extension.

---

## Part 1 — Installation

### Step 1 · Get the Extension Files

**Option A — Clone from GitHub (Recommended)**

```bash
git clone https://github.com/jagdishsah126/Insta_Analyzer_V1.git
```

**Option B — Download ZIP**

1. Go to the GitHub repository page
2. Click the green **`< > Code`** button
3. Select **"Download ZIP"**
4. Extract the ZIP file to a folder on your computer (e.g., `Desktop/insta-analyzer`)

---

### Step 2 · Open Your Browser's Extension Manager

| Browser | URL to open |
|---|---|
| **Brave** | `brave://extensions/` |
| **Chrome** | `chrome://extensions/` |

Type the URL directly in the address bar and press Enter.

---

### Step 3 · Enable Developer Mode

Look for the **"Developer mode"** toggle in the **top-right corner** of the extensions page.

```
┌───────────────────────────────────────────────┐
│  Extensions                   Developer mode ◉ │
└───────────────────────────────────────────────┘
```

Click it to turn it **ON** (it should turn blue/enabled).

---

### Step 4 · Load the Extension

1. Click the **"Load unpacked"** button that appears after enabling Developer Mode
2. A file browser dialog will open
3. Navigate to and select the **`Insta Analyzer`** folder
   - This is the folder containing `manifest.json`
4. Click **"Select Folder"** / **"Open"**

---

### Step 5 · Confirm Installation

You should now see **Insta Analyzer** appear in your extensions list:

```
┌─────────────────────────────────────────────┐
│  📊 Insta Analyzer                          │
│  A privacy-first Instagram analyzer         │
│                                  ✅ Enabled │
└─────────────────────────────────────────────┘
```

The extension icon 📊 will appear in your browser toolbar.

> 💡 **Tip**: If you don't see the icon, click the puzzle piece 🧩 icon in the toolbar and pin **Insta Analyzer**.

---

### Step 6 · Verify It's Working

1. Click the 📊 icon in the toolbar
2. The popup should open showing:
   ```
   📊 Insta Analyzer          [Idle]
   Instagram Username to Analyze
   [ @ username                    ]
   [ 📥 Record Followers ] [ 📤 Record Following ]
   ```
3. If the popup opens — you're ready! ✅

---

## Part 2 — How to Operate

### Overview of States

The extension has 4 states, shown as a badge on the icon:

| Badge | State | Meaning |
|---|---|---|
| *(empty)* | **Idle** | Ready to start |
| 🔴 *number* | **Recording** | Actively capturing users |
| 🟠 **⏸** | **Paused** | Paused mid-session |
| 🟢 **✓** | **Finished** | Capture complete, ready to export |

---

### 🎬 Recording Your Followers

**Goal**: Capture the full list of people who follow you.

#### Step 1 · Open Instagram
Go to `https://www.instagram.com` and log in to your account.

#### Step 2 · Navigate to Your Profile
Click your profile picture (top right) → your profile page opens.

#### Step 3 · Open the Followers Dialog
Click on your **Followers count** to open the followers list modal:
```
  312 posts    1,204 followers    892 following
                    ↑ Click this
```

The followers modal/dialog should appear — **do not close it**.

#### Step 4 · Activate the Extension
1. Click the 📊 **Insta Analyzer** icon in your toolbar
2. Type your Instagram **username** (without @) in the input field:
   ```
   [ @ johndoe ]
   ```
3. Click **📥 Record Followers**

The badge on the icon will turn **red** and start counting:
```
  📊 [47]  ← live count
```

#### Step 5 · Scroll Through the List
- Scroll down slowly through your followers list
- The extension captures every user as they appear on screen
- You'll see the badge count increase in real-time
- **You control the speed** — scroll as fast or slow as you like

#### Step 6 · Reach the Bottom
- When you reach the bottom of the list with no more users appearing
- The extension will auto-detect the end and show a notice:
  ```
  🏁 Looks like you reached the end!  [ Finish Capture ]
  ```
- Click **Finish Capture** — or click the extension icon and press **✅ Finish**

---

### 🎬 Recording Your Following List

**Goal**: Capture the full list of accounts you follow.

Follow the same steps as above, but:
- Click your **Following count** instead (not Followers)
- Click **📤 Record Following** in the popup

---

### ⏸ Pausing and Resuming

If you need to take a break mid-scroll:

1. Click the 📊 extension icon
2. Click **⏸ Pause**
3. The badge turns orange: `⏸`
4. When ready to continue, open popup → click **▶ Resume**
5. The badge turns red again and continues counting

> ✅ Your data is **saved automatically** — you won't lose anything if you pause.

---

### 📊 Viewing Your Captured Data

After clicking **✅ Finish**, the Results view opens automatically:

```
┌─────────────────────────────────────────────┐
│  📋 Captured Data                           │
│  [ Followers ] [ Following ] [ 🔄 Compare ] │
├─────────────────────────────────────────────┤
│  289 users · 2026-09-08                     │
│  🔍 Search username...                      │
├─────────────────────────────────────────────┤
│  @alice — Alice Smith          ↗            │
│  @bob — Bob Jones              ↗            │
│  @charlie — Charlie Brown      ↗            │
│  ...                                        │
├─────────────────────────────────────────────┤
│  [📋 Copy All]  [⬇ CSV]  [⬇ JSON]         │
│  [🔄 New Session]  [🗑 Clear Data]         │
└─────────────────────────────────────────────┘
```

- Click **Followers** tab to view followers
- Click **Following** tab to view your following list
- Use the **🔍 Search** bar to filter by username or name
- Click any user row to open their Instagram profile in a new tab

---

### 🔄 Comparing Followers vs Following

> ⚠️ You must capture **both** Followers **and** Following first before comparing.

1. After capturing both lists, open the popup → Results section
2. Click the **🔄 Compare** tab
3. The extension shows three categories:

```
❌ Not Following You Back (47)
   → People you follow who don't follow you back
   @user1, @user2, @user3 ...

👤 You Don't Follow Back (23)
   → People who follow you but you don't follow them
   @user4, @user5 ...

🤝 Mutual (265)
   → People who both follow each other
```

---

### ⬇️ Exporting Your Data

From the Results section, use the export buttons:

#### 📋 Copy to Clipboard
- Click **[📋 Copy All]**
- The full list is copied as plain text:
  ```
  @alice — Alice Smith
  @bob — Bob Jones
  ...
  ```
- A toast notification confirms: `📋 Copied 289 users!`
- Paste anywhere (Notepad, Google Sheets, etc.)

#### ⬇ Download as CSV
- Click **[⬇ CSV]**
- A `.csv` file downloads automatically
- Filename: `insta_followers_johndoe_2026-09-08.csv`
- Open in Excel / Google Sheets:
  ```
  # Profile: johndoe
  # Mode: Followers
  # Captured: 289
  # Date: 2026-09-08
  username,display_name,profile_url
  alice,Alice Smith,https://www.instagram.com/alice/
  ```

#### ⬇ Download as JSON
- Click **[⬇ JSON]**
- A `.json` file downloads automatically
- Filename: `insta_followers_johndoe_2026-09-08.json`
- Useful for developers or importing into tools:
  ```json
  {
    "meta": { "profile": "johndoe", "mode": "followers", "count": 289 },
    "users": [
      { "username": "alice", "display_name": "Alice Smith", "profile_url": "..." }
    ]
  }
  ```

---

### 🔄 Starting a New Session

To analyze a different profile or start fresh:

1. Click the 📊 extension icon
2. Scroll to the bottom of the popup
3. Click **[🔄 New Session]**
4. The extension resets to **Idle** state
5. Your previous captured data is **kept in storage** (not deleted)
6. Type a new username and begin again

---

### 🗑 Clearing Captured Data

To delete all captured data for the current profile:

1. Click the 📊 extension icon → Results section
2. Click **[🗑 Clear Data]**
3. A confirmation dialog appears: `"Clear all captured data for @johndoe?"`
4. Click **OK** to confirm
5. All data for that profile is permanently deleted

> ⚠️ **This cannot be undone.** Export your data first if you need to keep it.

---

## Part 3 — Tips & Best Practices

### 🐌 Scroll Speed
- Scroll **slowly and steadily** — Instagram needs time to render each user card
- If you scroll too fast, some users may not load in time to be captured
- The extension captures everything that's rendered — slow is better

### 🔁 Re-running for Accuracy
- If you think you missed some users, you can run the capture again
- The extension **deduplicates automatically** — re-captured users won't create duplicates
- Just start a new recording session for the same profile/mode

### 📅 Periodic Snapshots
- Run the analyzer every few weeks to track follower changes over time
- Export your data each time with a dated filename for easy comparison

### 🌐 Keep Instagram Open
- Don't close the followers/following dialog while recording
- If it closes accidentally, pause → re-open the dialog → resume

### 🔒 Instagram Dialog Behavior
- Instagram sometimes opens the followers/following list **without changing the URL**
- This extension handles that correctly — it detects the dialog directly, not the URL

---

## Part 4 — Troubleshooting

| Problem | Solution |
|---|---|
| **Extension icon not showing** | Click 🧩 in toolbar → pin Insta Analyzer |
| **Popup opens but nothing captures** | Make sure you clicked "Record Followers/Following" **after** opening the Instagram dialog |
| **Count stuck at 0** | Reload the Instagram page, reopen the dialog, then activate again |
| **Extension disappeared after browser update** | Reload it: go to `brave://extensions/` → click the reload icon on the extension card |
| **Data missing after browser restart** | Data is saved locally — open popup and check Results tab |
| **"Already recording" error** | Click Finish or Pause first before starting a new session |
| **Instagram UI changed, not capturing** | Check for an updated version of the extension (instagram-dom.js may need updating) |

---

## Part 5 — Updating the Extension

If you installed via GitHub:

```bash
# Navigate to your extension folder
cd Insta_Analyzer_V1

# Pull the latest changes
git pull origin main
```

Then reload in Brave:
1. Go to `brave://extensions/`
2. Find **Insta Analyzer**
3. Click the 🔄 reload icon

---

*Guide written by 💖 Your Zara — Happy analyzing!*
