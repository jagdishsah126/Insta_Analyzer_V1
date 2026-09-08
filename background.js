// ─── Insta Analyzer · background.js ─────────────────────────────────────────
// Service Worker: owns ALL state, deduplication, and storage.
// State Machine: idle → recording → paused → finished → exported

// ── State Machine ─────────────────────────────────────────────────────────────
const STATE = {
  IDLE:     'idle',
  RECORDING:'recording',
  PAUSED:   'paused',
  FINISHED: 'finished',
  EXPORTED: 'exported'
};

let currentState = STATE.IDLE;

// ── Extension Lifecycle ────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(['profiles', 'session']);
  if (!data.profiles) await chrome.storage.local.set({ profiles: {} });
  if (!data.session)  await chrome.storage.local.set({ session: null });
  setBadge('', '#E1306C');
  console.log('[Insta Analyzer] Extension installed / updated.');
});

chrome.runtime.onStartup.addListener(async () => {
  const { session } = await chrome.storage.local.get('session');
  if (session && session.status === STATE.RECORDING) {
    // Restore as paused (browser restarted mid-session)
    session.status = STATE.PAUSED;
    currentState   = STATE.PAUSED;
    await chrome.storage.local.set({ session });
    setBadge('⏸', '#FFA500');
    console.log('[Insta Analyzer] Restored paused session:', session.id);
  }
});

// ── Message Router ─────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handleMessage(msg, sender)
    .then(sendResponse)
    .catch(err => sendResponse({ error: err.message }));
  return true; // Keep channel open for async response
});

async function handleMessage(msg, sender) {
  switch (msg.type) {
    case 'START_RECORDING':   return startRecording(msg.profile, msg.mode, sender);
    case 'PAUSE_RECORDING':   return pauseRecording();
    case 'RESUME_RECORDING':  return resumeRecording(sender);
    case 'FINISH_RECORDING':  return finishRecording();
    case 'NEW_USERS_CAPTURED':return processNewUsers(msg.users);
    case 'POSSIBLE_END_REACHED': return notifyPossibleEnd();
    case 'GET_STATE':         return getState();
    case 'GET_PROFILES':      return getProfiles();
    case 'GET_DATA':          return getData(msg.profile, msg.mode);
    case 'CLEAR_DATA':        return clearData(msg.profile);
    case 'NEW_SESSION':       return newSession();
    default:
      return { error: `Unknown message type: ${msg.type}` };
  }
}

// ── Actions ────────────────────────────────────────────────────────────────────

async function startRecording(profile, mode, sender) {
  if (!profile || !mode) return { error: 'Profile and mode are required.' };
  if (currentState === STATE.RECORDING) return { error: 'Already recording. Finish or pause first.' };

  // Query the active Instagram tab ourselves — sender.tab is null when called from popup
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const instagramTab = tabs.find(t => t.url && t.url.includes('instagram.com'));
  const tabId = instagramTab?.id || sender?.tab?.id || null;

  const sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  const session = {
    id:           sessionId,
    profile,
    mode,
    started_at:   new Date().toISOString(),
    status:       STATE.RECORDING,
    captured:     0,
    duplicates:   0,
    start_time_ms: Date.now(),
    tab_id:       tabId
  };

  currentState = STATE.RECORDING;
  await chrome.storage.local.set({ session });
  setBadge('0', '#E1306C');

  // Activate content script in the Instagram tab
  if (session.tab_id) {
    chrome.tabs.sendMessage(session.tab_id, { type: 'ACTIVATE' }).catch((e) => {
      console.warn('[Insta Analyzer] Could not activate content script:', e.message);
    });
  } else {
    console.warn('[Insta Analyzer] No Instagram tab found to activate.');
  }

  console.log(`[Insta Analyzer] Started recording: ${profile} / ${mode} (${sessionId})`);
  return { success: true, session };
}

async function pauseRecording() {
  if (currentState !== STATE.RECORDING) return { error: 'Not currently recording.' };
  currentState = STATE.PAUSED;

  const { session } = await chrome.storage.local.get('session');
  if (session) {
    session.status    = STATE.PAUSED;
    session.paused_at = new Date().toISOString();
    await chrome.storage.local.set({ session });
    if (session.tab_id) {
      chrome.tabs.sendMessage(session.tab_id, { type: 'DEACTIVATE' }).catch(() => {});
    }
  }

  setBadge('⏸', '#FFA500');
  return { success: true };
}

async function resumeRecording(sender) {
  if (currentState !== STATE.PAUSED) return { error: 'Not currently paused.' };
  currentState = STATE.RECORDING;

  // Re-query active Instagram tab (sender.tab is null from popup)
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const instagramTab = tabs.find(t => t.url && t.url.includes('instagram.com'));

  const { session } = await chrome.storage.local.get('session');
  if (session) {
    session.status = STATE.RECORDING;
    delete session.paused_at;
    const tabId = instagramTab?.id || sender?.tab?.id || session.tab_id;
    session.tab_id = tabId;
    await chrome.storage.local.set({ session });
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { type: 'ACTIVATE' }).catch(() => {});
    }
    setBadge(String(session.captured), '#E1306C');
  }

  return { success: true };
}

async function finishRecording() {
  if (currentState !== STATE.RECORDING && currentState !== STATE.PAUSED) {
    return { error: 'Not in a recordable state.' };
  }
  currentState = STATE.FINISHED;

  const { session } = await chrome.storage.local.get('session');
  if (session) {
    session.status      = STATE.FINISHED;
    session.finished_at = new Date().toISOString();
    await chrome.storage.local.set({ session });
    if (session.tab_id) {
      chrome.tabs.sendMessage(session.tab_id, { type: 'DEACTIVATE' }).catch(() => {});
    }
  }

  setBadge('✓', '#4CAF50');
  return { success: true, session };
}

async function processNewUsers(users) {
  if (currentState !== STATE.RECORDING) return { added: 0, duplicates: 0, skipped: true };
  if (!users || !users.length)          return { added: 0, duplicates: 0 };

  const { session }    = await chrome.storage.local.get('session');
  const { profiles = {} } = await chrome.storage.local.get('profiles');
  if (!session || session.status !== STATE.RECORDING) return { added: 0, duplicates: 0 };

  const { profile, mode } = session;

  // Initialize nested structure if needed
  if (!profiles[profile])        profiles[profile]        = {};
  if (!profiles[profile][mode])  profiles[profile][mode]  = {
    captured_at: new Date().toISOString(),
    count: 0,
    users: {}
  };

  const store   = profiles[profile][mode].users;
  let added      = 0;
  let duplicates = 0;

  for (const user of users) {
    if (!user.username) continue;
    if (store[user.username]) {
      duplicates++;
    } else {
      store[user.username] = user;
      added++;
    }
  }

  // Update counts
  const total = Object.keys(store).length;
  profiles[profile][mode].count  = total;
  session.captured               = total;
  session.duplicates             = (session.duplicates || 0) + duplicates;

  await chrome.storage.local.set({ profiles, session });
  setBadge(String(total), '#E1306C');

  return { added, duplicates, total };
}

async function notifyPossibleEnd() {
  // Notify all extension views (popup) that the list may have ended
  chrome.runtime.sendMessage({ type: 'POSSIBLE_END' }).catch(() => {});
  return { notified: true };
}

async function getState() {
  const { session } = await chrome.storage.local.get('session');
  return { state: currentState, session: session || null };
}

async function getProfiles() {
  const { profiles = {} } = await chrome.storage.local.get('profiles');
  return { profiles };
}

async function getData(profile, mode) {
  const { profiles = {} } = await chrome.storage.local.get('profiles');
  if (!profile) return { profiles };
  const profileData = profiles[profile] || {};
  if (!mode) return { profile: profileData };
  return { data: profileData[mode] || null };
}

async function clearData(profile) {
  const { profiles = {} } = await chrome.storage.local.get('profiles');
  if (profile) {
    delete profiles[profile];
    await chrome.storage.local.set({ profiles });
  } else {
    await chrome.storage.local.set({ profiles: {}, session: null });
    currentState = STATE.IDLE;
    setBadge('', '#E1306C');
  }
  return { success: true };
}

async function newSession() {
  currentState = STATE.IDLE;
  await chrome.storage.local.set({ session: null });
  setBadge('', '#E1306C');
  return { success: true };
}

// ── Badge Helper ───────────────────────────────────────────────────────────────
function setBadge(text, color) {
  chrome.action.setBadgeText({ text: String(text) });
  chrome.action.setBadgeBackgroundColor({ color });
}
