// ─── Insta Analyzer · utils/helpers.js ───────────────────────────────────────
// Shared utility functions used across content, background, and popup scripts.

/**
 * Generate a unique session ID.
 * @returns {string} e.g. "sess_abc123xyz"
 */
function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

/**
 * Return the current ISO timestamp string.
 * @returns {string}
 */
function nowISO() {
  return new Date().toISOString();
}

/**
 * Return today's date as YYYY-MM-DD.
 * @returns {string}
 */
function todayDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Format elapsed milliseconds as "Xm Ys" or "Zs".
 * @param {number} ms
 * @returns {string}
 */
function formatElapsed(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/**
 * Sanitize a string for safe use in filenames.
 * @param {string} str
 * @returns {string}
 */
function sanitizeFilename(str) {
  return str.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
}

/**
 * Shallow-clone an object.
 * @param {object} obj
 * @returns {object}
 */
function shallowClone(obj) {
  return Object.assign({}, obj);
}
