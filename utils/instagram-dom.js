// ─── Insta Analyzer · utils/instagram-dom.js ─────────────────────────────────
// All Instagram DOM interaction is ISOLATED here.
// When Instagram updates its UI, only this file needs to change.

const BLOCKED_ROUTES = new Set([
  'explore', 'reel', 'p', 'stories', 'direct', 'accounts',
  'about', 'legal', 'locations', 'tags', 'ar', 'graphql',
  'login', 'logout', 'help', 'press', 'api', 'privacy',
  'security', 'terms', 'contact', 'blog', 'jobs'
]);

const InstagramDOM = {

  /**
   * Find the open followers/following modal/dialog.
   * Tries multiple strategies for resilience.
   * @returns {Element|null}
   */
  findDialog() {
    // Strategy 1: Standard ARIA dialog role
    const dialogs = document.querySelectorAll('[role="dialog"]');
    for (const d of dialogs) {
      if (d.querySelectorAll('a[href]').length > 0) return d;
    }
    // Strategy 2: Any div that looks like a modal overlay
    const candidates = document.querySelectorAll('div[class*="modal"], div[class*="Modal"], div[class*="dialog"]');
    for (const c of candidates) {
      if (c.querySelectorAll('a[href]').length > 2) return c;
    }
    return null;
  },

  /**
   * Get the heading text of the dialog (e.g., "Followers" / "Following").
   * @returns {string|null}
   */
  getDialogHeading() {
    const dialog = this.findDialog();
    if (!dialog) return null;
    const heading = dialog.querySelector(
      'h1, h2, h3, [role="heading"], header span, header div'
    );
    return heading ? heading.textContent.trim() : null;
  },

  /**
   * Detect the current mode from the dialog heading text.
   * @returns {'followers'|'following'|null}
   */
  detectModeFromDialog() {
    const heading = this.getDialogHeading();
    if (!heading) return null;
    const lower = heading.toLowerCase();
    if (lower.includes('follower')) return 'followers';
    if (lower.includes('following')) return 'following';
    return null;
  },

  /**
   * Find the scrollable list container inside the dialog.
   * @returns {Element|null}
   */
  findScrollableList() {
    const dialog = this.findDialog();
    if (!dialog) return null;
    // Look for a div/ul that has overflow and more height than viewport
    const inner = dialog.querySelectorAll('div, ul');
    for (const el of inner) {
      const style = window.getComputedStyle(el);
      if ((style.overflowY === 'scroll' || style.overflowY === 'auto') && el.scrollHeight > 200) {
        return el;
      }
    }
    return dialog;
  },

  /**
   * Extract user data from a profile anchor element.
   * @param {Element} anchor - <a href="/username/"> element
   * @returns {{username, display_name, profile_url, captured_at}|null}
   */
  extractUserData(anchor) {
    if (!anchor || anchor.tagName !== 'A') return null;

    const href = anchor.getAttribute('href') || '';
    // Must match /username/ pattern
    if (!href.match(/^\/[a-zA-Z0-9._]{1,30}\/?$/)) return null;

    const username = href.replace(/\//g, '').trim();
    if (!username || BLOCKED_ROUTES.has(username.toLowerCase())) return null;

    // Try to extract display name from the card context
    const cardRoot = anchor.closest('li') ||
                     anchor.closest('[role="listitem"]') ||
                     anchor.parentElement?.parentElement ||
                     anchor.parentElement;

    let displayName = '';

    if (cardRoot) {
      // Collect all non-empty text spans inside the card
      const spans = cardRoot.querySelectorAll('span');
      const texts = [];
      for (const span of spans) {
        const t = span.textContent.trim();
        // Skip the username itself and very short/long strings
        if (t && t !== username && t !== `@${username}` && t.length >= 2 && t.length <= 60) {
          // Prefer the span that is NOT inside another span (top-level text)
          if (!span.closest('span span')) {
            texts.push(t);
          }
        }
      }
      // The first text that differs from username is likely the display name
      displayName = texts.find(t => t.toLowerCase() !== username.toLowerCase()) || username;
    }

    return {
      username,
      display_name: displayName || username,
      profile_url: `https://www.instagram.com/${username}/`,
      captured_at: new Date().toISOString()
    };
  },

  /**
   * Scan a container and return all valid user data objects found.
   * @param {Element} container
   * @returns {Array}
   */
  scanUsersInContainer(container) {
    const results = [];
    if (!container) return results;
    const anchors = container.querySelectorAll('a[href]');
    for (const a of anchors) {
      const user = this.extractUserData(a);
      if (user) results.push(user);
    }
    return results;
  }
};
