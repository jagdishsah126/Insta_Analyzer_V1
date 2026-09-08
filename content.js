// ─── Insta Analyzer · content.js ─────────────────────────────────────────────
// Injected into all instagram.com pages.
// Observes the DOM, extracts user cards, and sends raw data to background.js.
// All deduplication and storage is handled by background.js.

(function () {
  'use strict';

  let observer        = null;
  let isActive        = false;
  let lastNewUserTime = Date.now();
  let endCheckTimer   = null;

  const END_DETECT_TIMEOUT_MS = 6000; // 6s with no new users = possible end of list

  // ── Message Listener ──────────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    switch (msg.type) {
      case 'ACTIVATE':
        activateObserver();
        sendResponse({ success: true, active: true });
        break;
      case 'DEACTIVATE':
        deactivateObserver();
        sendResponse({ success: true, active: false });
        break;
      case 'PING':
        sendResponse({ alive: true, url: window.location.href });
        break;
      default:
        sendResponse({ error: 'Unknown message' });
    }
    return false;
  });

  // ── Observer Lifecycle ─────────────────────────────────────────────────────────
  function activateObserver() {
    if (isActive) return;
    isActive        = true;
    lastNewUserTime = Date.now();

    const target = InstagramDOM.findScrollableList() || document.body;

    observer = new MutationObserver((mutations) => {
      if (!isActive) return;

      const newUsers = [];
      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const found = InstagramDOM.scanUsersInContainer(node);
          newUsers.push(...found);
          // Also check if the node itself is an anchor
          if (node.tagName === 'A') {
            const user = InstagramDOM.extractUserData(node);
            if (user) newUsers.push(user);
          }
        }
      }

      if (newUsers.length > 0) {
        lastNewUserTime = Date.now();
        sendToBg(newUsers);
        resetEndDetection();
      }
    });

    observer.observe(target, { childList: true, subtree: true });

    // Perform an immediate scan of what's already visible
    performInitialScan();

    // Start end-of-list detection
    startEndDetection();

    console.log('[Insta Analyzer] Observer activated.');
  }

  function deactivateObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (endCheckTimer) {
      clearInterval(endCheckTimer);
      endCheckTimer = null;
    }
    isActive = false;
    console.log('[Insta Analyzer] Observer deactivated.');
  }

  // ── Initial Scan ─────────────────────────────────────────────────────────────
  function performInitialScan() {
    const dialog = InstagramDOM.findDialog() || document.body;
    const users  = InstagramDOM.scanUsersInContainer(dialog);
    if (users.length > 0) sendToBg(users);
  }

  // ── End-of-List Detection ────────────────────────────────────────────────────
  function startEndDetection() {
    if (endCheckTimer) clearInterval(endCheckTimer);
    endCheckTimer = setInterval(() => {
      if (!isActive) { clearInterval(endCheckTimer); return; }
      const elapsed = Date.now() - lastNewUserTime;
      if (elapsed > END_DETECT_TIMEOUT_MS) {
        chrome.runtime.sendMessage({ type: 'POSSIBLE_END_REACHED' }).catch(() => {});
        clearInterval(endCheckTimer);
        endCheckTimer = null;
      }
    }, 1500);
  }

  function resetEndDetection() {
    lastNewUserTime = Date.now();
    startEndDetection();
  }

  // ── Communication ─────────────────────────────────────────────────────────────
  function sendToBg(users) {
    chrome.runtime.sendMessage({ type: 'NEW_USERS_CAPTURED', users }).catch(() => {});
  }

})();
