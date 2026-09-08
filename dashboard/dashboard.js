// ─── Insta Analyzer · dashboard.js ───────────────────────────────────────────
// Full-screen dashboard controller.

(function () {
  'use strict';

  // ── State ─────────────────────────────────────────────────────────────────────
  let allProfiles    = {};
  let currentProfile = null;
  let compareResult  = null;

  // Raw user arrays for current profile (for filtering)
  let rawFollowers = [];
  let rawFollowing = [];

  // ── Init ──────────────────────────────────────────────────────────────────────
  async function init() {
    await loadProfiles();
    bindEvents();
  }

  async function loadProfiles() {
    const res = await bg('GET_PROFILES');
    allProfiles = res.profiles || {};

    const select = document.getElementById('profile-select');
    select.innerHTML = '<option value="">— Select Profile —</option>';
    const names = Object.keys(allProfiles);

    names.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = `@${name}`;
      select.appendChild(opt);
    });

    if (names.length === 1) {
      select.value = names[0];
      selectProfile(names[0]);
    } else if (names.length > 1) {
      // Auto-select most recent
      select.value = names[names.length - 1];
      selectProfile(names[names.length - 1]);
    }
  }

  function selectProfile(profile) {
    currentProfile = profile;
    const data = allProfiles[profile] || {};

    const followersData = data.followers || { users: {}, count: 0 };
    const followingData = data.following || { users: {}, count: 0 };

    rawFollowers = Object.values(followersData.users || {});
    rawFollowing = Object.values(followingData.users || {});

    renderColumn('followers', rawFollowers);
    renderColumn('following', rawFollowing);

    // Comparison
    if (rawFollowers.length > 0 && rawFollowing.length > 0) {
      const fu = followingData.users || {};
      const fo = followersData.users || {};
      compareResult = Comparator.compare(fu, fo);
      renderCompare(compareResult);
    } else {
      compareResult = null;
      document.getElementById('compare-empty').classList.remove('hidden');
      document.getElementById('compare-container').classList.add('hidden');
    }

    updateStatsBar(rawFollowers, rawFollowing, compareResult);
    document.getElementById('stats-bar').classList.remove('hidden');
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  function renderColumn(mode, users) {
    const listEl  = document.getElementById(`list-${mode}`);
    const countEl = document.getElementById(`count-${mode}`);
    countEl.textContent = users.length;

    if (!users.length) {
      listEl.innerHTML = `<div class="empty">No ${mode} data captured yet.</div>`;
      return;
    }
    listEl.innerHTML = users.map(u => userCard(u)).join('');
  }

  function renderCompare(result) {
    if (!result) return;
    document.getElementById('compare-empty').classList.add('hidden');
    document.getElementById('compare-container').classList.remove('hidden');

    document.getElementById('cnt-nfb').textContent    = result.notFollowingBack.length;
    document.getElementById('cnt-nfl').textContent    = result.notFollowedBack.length;
    document.getElementById('cnt-mutual').textContent = result.mutual.length;
    document.getElementById('count-compare').textContent =
      `${result.notFollowingBack.length} / ${result.notFollowedBack.length} / ${result.mutual.length}`;

    document.getElementById('list-nfb').innerHTML =
      result.notFollowingBack.map(u => userCard(u)).join('') ||
      '<div class="empty">None! 🎉 Everyone follows you back.</div>';

    document.getElementById('list-nfl').innerHTML =
      result.notFollowedBack.map(u => userCard(u)).join('') ||
      '<div class="empty">None! 🎉 You follow everyone back.</div>';

    document.getElementById('list-mutual').innerHTML =
      result.mutual.map(u => userCard(u)).join('') ||
      '<div class="empty">No mutual followers yet.</div>';
  }

  function userCard(u) {
    return `
      <a class="user-card" href="${u.profile_url}" target="_blank" rel="noopener">
        <div class="user-avatar">${(u.username || '?').charAt(0).toUpperCase()}</div>
        <div class="user-info">
          <div class="user-name">@${u.username}</div>
          <div class="user-display">${u.display_name !== u.username ? u.display_name : ''}</div>
        </div>
        <span class="user-link">↗</span>
      </a>`;
  }

  function updateStatsBar(followers, following, compare) {
    document.getElementById('sb-followers').textContent = followers.length;
    document.getElementById('sb-following').textContent = following.length;
    document.getElementById('sb-nfb').textContent    = compare ? compare.notFollowingBack.length : '—';
    document.getElementById('sb-nfl').textContent    = compare ? compare.notFollowedBack.length  : '—';
    document.getElementById('sb-mutual').textContent = compare ? compare.mutual.length : '—';
  }

  // ── Filter ────────────────────────────────────────────────────────────────────
  window.filterCol = function (mode) {
    const q    = document.getElementById(`search-${mode}`).value.trim().toLowerCase();
    const src  = mode === 'followers' ? rawFollowers : rawFollowing;
    const list = document.getElementById(`list-${mode}`);
    const filtered = q ? src.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.display_name.toLowerCase().includes(q)
    ) : src;
    list.innerHTML = filtered.length
      ? filtered.map(u => userCard(u)).join('')
      : `<div class="empty">No results for "${q}"</div>`;
  };

  window.filterCompare = function () {
    if (!compareResult) return;
    const q = document.getElementById('search-compare').value.trim().toLowerCase();
    const filter = arr => q
      ? arr.filter(u => u.username.toLowerCase().includes(q) || u.display_name.toLowerCase().includes(q))
      : arr;

    document.getElementById('list-nfb').innerHTML =
      filter(compareResult.notFollowingBack).map(u => userCard(u)).join('') ||
      '<div class="empty">No results.</div>';
    document.getElementById('list-nfl').innerHTML =
      filter(compareResult.notFollowedBack).map(u => userCard(u)).join('') ||
      '<div class="empty">No results.</div>';
    document.getElementById('list-mutual').innerHTML =
      filter(compareResult.mutual).map(u => userCard(u)).join('') ||
      '<div class="empty">No results.</div>';
  };

  // ── Exports ───────────────────────────────────────────────────────────────────

  // Individual column CSV/JSON
  window.exportColCSV = function (mode) {
    if (!currentProfile) return showToast('No profile selected', 'error');
    const data = allProfiles[currentProfile]?.[mode];
    if (!data) return showToast(`No ${mode} data`, 'error');
    const csv = CSVExporter.build({
      profile: currentProfile, mode,
      captured_at: data.captured_at,
      count: data.count,
      users: data.users
    });
    CSVExporter.download(csv, currentProfile, mode);
    showToast(`⬇ ${mode} CSV downloaded!`, 'success');
  };

  window.exportColJSON = function (mode) {
    if (!currentProfile) return showToast('No profile selected', 'error');
    const data = allProfiles[currentProfile]?.[mode];
    if (!data) return showToast(`No ${mode} data`, 'error');
    const obj = JSONExporter.build({
      profile: currentProfile, mode,
      captured_at: data.captured_at,
      count: data.count,
      users: data.users
    });
    JSONExporter.download(obj, currentProfile, mode);
    showToast(`⬇ ${mode} JSON downloaded!`, 'success');
  };

  // Combined — both lists in one file
  document.getElementById('btn-export-all').addEventListener('click', () => {
    if (!currentProfile) return showToast('Select a profile first', 'error');
    const profileData = allProfiles[currentProfile] || {};
    const csv = CSVExporter.buildCombined(currentProfile, profileData);
    CSVExporter.downloadCombined(csv, currentProfile);
    showToast('⬇ Combined CSV downloaded!', 'success');
  });

  document.getElementById('btn-export-json-all').addEventListener('click', () => {
    if (!currentProfile) return showToast('Select a profile first', 'error');
    const profileData = allProfiles[currentProfile] || {};
    const obj = JSONExporter.buildCombined(currentProfile, profileData);
    JSONExporter.downloadCombined(obj, currentProfile);
    showToast('⬇ Combined JSON downloaded!', 'success');
  });

  // Download comparison result
  window.downloadResult = function (format) {
    if (!compareResult) return showToast('Run comparison first', 'error');
    if (format === 'csv') {
      const csv = CSVExporter.buildResult(currentProfile, compareResult);
      CSVExporter.downloadResult(csv, currentProfile);
      showToast('⬇ Result CSV downloaded!', 'success');
    } else {
      const obj = JSONExporter.buildResult(currentProfile, compareResult);
      JSONExporter.downloadResult(obj, currentProfile);
      showToast('⬇ Result JSON downloaded!', 'success');
    }
  };

  // ── Events ─────────────────────────────────────────────────────────────────────
  function bindEvents() {
    document.getElementById('profile-select').addEventListener('change', e => {
      if (e.target.value) selectProfile(e.target.value);
    });
    document.getElementById('btn-refresh').addEventListener('click', async () => {
      await loadProfiles();
      if (currentProfile) selectProfile(currentProfile);
      showToast('🔄 Refreshed!', '');
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function bg(type, payload = {}) {
    return chrome.runtime.sendMessage({ type, ...payload });
  }

  let toastTimer = null;
  function showToast(msg, type = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className   = `toast ${type}`;
    t.style.opacity = '1';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.opacity = '0'; }, 2500);
  }

  // ── Boot ──────────────────────────────────────────────────────────────────────
  init();

})();
