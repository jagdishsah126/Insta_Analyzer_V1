// ─── Insta Analyzer · json-export.js ─────────────────────────────────────────
const JSONExporter = {

  // ── Single mode ──────────────────────────────────────────────────────────────
  build(data) {
    const { profile, mode, captured_at, count, users } = data;
    return {
      meta: { profile, mode, captured_at, count, generated_by: 'Insta Analyzer' },
      users: Object.values(users).map(u => ({
        username:     u.username,
        display_name: u.display_name,
        profile_url:  u.profile_url,
        captured_at:  u.captured_at
      }))
    };
  },

  download(obj, profile, mode) {
    this._dl(obj, `insta_${mode}_${sanitizeFilename(profile)}_${todayDate()}.json`);
  },

  // ── Combined (both lists in one file) ────────────────────────────────────────
  buildCombined(profile, profileData) {
    const followers = profileData.followers || { users: {}, count: 0, captured_at: null };
    const following = profileData.following || { users: {}, count: 0, captured_at: null };

    const mapUsers = (usersObj) => Object.values(usersObj).map(u => ({
      username: u.username, display_name: u.display_name,
      profile_url: u.profile_url, captured_at: u.captured_at
    }));

    return {
      meta: {
        profile,
        exported_at:    todayDate(),
        generated_by:   'Insta Analyzer'
      },
      followers: {
        captured_at: followers.captured_at,
        count:       followers.count,
        users:       mapUsers(followers.users)
      },
      following: {
        captured_at: following.captured_at,
        count:       following.count,
        users:       mapUsers(following.users)
      }
    };
  },

  downloadCombined(obj, profile) {
    this._dl(obj, `insta_combined_${sanitizeFilename(profile)}_${todayDate()}.json`);
  },

  // ── Comparison result ────────────────────────────────────────────────────────
  buildResult(profile, result) {
    const { notFollowingBack, notFollowedBack, mutual } = result;
    const mapUsers = arr => arr.map(u => ({
      username: u.username, display_name: u.display_name, profile_url: u.profile_url
    }));

    return {
      meta: {
        profile,
        analyzed_at:          new Date().toISOString(),
        not_following_back:   notFollowingBack.length,
        not_followed_back:    notFollowedBack.length,
        mutual:               mutual.length,
        generated_by:         'Insta Analyzer'
      },
      not_following_back: mapUsers(notFollowingBack),
      not_followed_back:  mapUsers(notFollowedBack),
      mutual:             mapUsers(mutual)
    };
  },

  downloadResult(obj, profile) {
    this._dl(obj, `insta_result_${sanitizeFilename(profile)}_${todayDate()}.json`);
  },

  // ── Internal ──────────────────────────────────────────────────────────────────
  _dl(obj, filename) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
};
