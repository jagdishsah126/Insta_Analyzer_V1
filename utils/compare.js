// ─── Insta Analyzer · utils/compare.js ───────────────────────────────────────
// Set-based comparison algorithm for followers vs following analysis.

const Comparator = {

  /**
   * Run the full comparison between two user maps.
   * @param {object} followingUsers  - keyed by username
   * @param {object} followersUsers  - keyed by username
   * @returns {{ notFollowingBack, notFollowedBack, mutual }}
   */
  compare(followingUsers, followersUsers) {
    const followingSet = new Set(Object.keys(followingUsers));
    const followersSet = new Set(Object.keys(followersUsers));

    // You follow them, but they don't follow you back
    const notFollowingBack = [...followingSet]
      .filter(u => !followersSet.has(u))
      .map(u => followingUsers[u]);

    // They follow you, but you don't follow them back
    const notFollowedBack = [...followersSet]
      .filter(u => !followingSet.has(u))
      .map(u => followersUsers[u]);

    // Both follow each other
    const mutual = [...followingSet]
      .filter(u => followersSet.has(u))
      .map(u => followingUsers[u]);

    return { notFollowingBack, notFollowedBack, mutual };
  },

  /**
   * Generate a human-readable summary of the comparison.
   * @param {{ notFollowingBack, notFollowedBack, mutual }} result
   * @returns {string}
   */
  summarize(result) {
    return [
      `❌ Not following you back: ${result.notFollowingBack.length}`,
      `👤 Not followed back by you: ${result.notFollowedBack.length}`,
      `🤝 Mutual followers: ${result.mutual.length}`
    ].join('\n');
  }
};
