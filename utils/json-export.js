// ─── Insta Analyzer · utils/json-export.js ───────────────────────────────────
// JSON export formatter with metadata wrapper.

const JSONExporter = {

  /**
   * Build a JSON export object from captured user data.
   * @param {object} data - { profile, mode, captured_at, count, users: {} }
   * @returns {object}
   */
  build(data) {
    const { profile, mode, captured_at, count, users } = data;
    return {
      meta: {
        profile,
        mode,
        captured_at,
        count,
        generated_by: 'Insta Analyzer'
      },
      users: Object.values(users).map(u => ({
        username:     u.username,
        display_name: u.display_name,
        profile_url:  u.profile_url,
        captured_at:  u.captured_at
      }))
    };
  },

  /**
   * Trigger a JSON file download in the browser.
   * @param {object} exportObj
   * @param {string} profile
   * @param {string} mode
   */
  download(exportObj, profile, mode) {
    const filename  = `insta_${mode}_${sanitizeFilename(profile)}_${todayDate()}.json`;
    const json      = JSON.stringify(exportObj, null, 2);
    const blob      = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url       = URL.createObjectURL(blob);
    const a         = document.createElement('a');
    a.href          = url;
    a.download      = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
};
