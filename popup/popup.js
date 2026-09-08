// ─── Insta Analyzer · popup.js ───────────────────────────────────────────────
// Popup UI controller. Communicates with background.js for all state.

(function () {
  'use strict';

  // ── DOM References ───────────────────────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const stateBadge        = $('state-badge');

  // Setup
  const secSetup          = $('section-setup');
  const profileInput      = $('profile-input');
  const btnStartFollowers = $('btn-start-followers');
  const btnStartFollowing = $('btn-start-following');

  // Recording
  const secRecording      = $('section-recording');
  const recProfile        = $('rec-profile');
  const recMode           = $('rec-mode');
  const statCaptured      = $('stat-captured');
  const statDupes         = $('stat-dupes');
  const statElapsed       = $('stat-elapsed');
  const endNotice         = $('end-notice');
  const btnPause          = $('btn-pause');
  const btnResume         = $('btn-resume');
  const btnFinish         = $('btn-finish');
  const btnFinishAuto     = $('btn-finish-auto');

  // Results
  const secResults        = $('section-results');
  const tabFollowers      = $('tab-followers');
  const tabFollowing      = $('tab-following');
  const tabCompare        = $('tab-compare');
  const summaryCount      = $('summary-count');
  const summaryDate       = $('summary-date');
  const searchInput       = $('search-input');
  const userList          = $('user-list');
  const compareResults    = $('compare-results');
  const cntNfb            = $('cnt-nfb');
  const cntNfl            = $('cnt-nfl');
  const cntMutual         = $('cnt-mutual');
  const listNfb           = $('list-nfb');
  const listNfl           = $('list-nfl');
  const btnCopy           = $('btn-copy');
  const btnCsv            = $('btn-csv');
  const btnJson           = $('btn-json');
  const btnNewSession     = $('btn-new-session');
  const btnClear          = $('btn-clear');
  const toast             = $('toast');

  // ── State ─────────────────────────────────────────────────────────────────────
  let currentSession  = null;
  let currentState    = 'idle';
  let profilesData    = {};
  let activeTab       = 'followers'; // currently viewed tab in results
  let elapsedInterval = null;
  let currentProfile  = null; // the profile whose data we're viewing

  // ── Init ──────────────────────────────────────────────────────────────────────
  async function init() {
    await loadState();
    bindEvents();
    // Listen for background pushes (possible end notification)
    chrome.runtime.onMessage.addListener(onBackgroundMessage);
    // Auto-refresh stats while recording
    setInterval(refreshStats, 2000);
  }

  async function loadState() {
    const res = await bg('GET_STATE');
    currentState   = res.state   || 'idle';
    currentSession = res.session || null;

    const prof = await bg('GET_PROFILES');
    profilesData = prof.profiles || {};

    renderUI();
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  function renderUI() {
    // Update badge
    stateBadge.textContent = currentState;
    stateBadge.className   = `state-badge ${currentState}`;

    hide(secSetup);
    hide(secRecording);
    hide(secResults);

    switch (currentState) {
      case 'idle':
      case 'exported':
        show(secSetup);
        break;
      case 'recording':
      case 'paused':
        show(secRecording);
        renderRecordingSection();
        break;
      case 'finished':
        show(secResults);
        currentProfile = currentSession?.profile || null;
        renderResults();
        break;
    }
  }

  function renderRecordingSection() {
    if (!currentSession) return;
    recProfile.textContent = `@${currentSession.profile}`;
    recMode.textContent    = `Recording ${capitalize(currentSession.mode)}`;
    statCaptured.textContent = currentSession.captured || 0;
    statDupes.textContent    = currentSession.duplicates || 0;

    const elapsed = currentSession.start_time_ms
      ? Date.now() - currentSession.start_time_ms
      : 0;
    statElapsed.textContent = formatElapsed(elapsed);

    if (currentState === 'recording') {
      show(btnPause);
      hide(btnResume);
    } else {
      hide(btnPause);
      show(btnResume);
    }
  }

  function renderResults() {
    if (!currentProfile) return;
    const profileData = profilesData[currentProfile] || {};
    const modeData    = profileData[activeTab] || { users: {}, count: 0, captured_at: '' };
    const users       = Object.values(modeData.users || {});

    summaryCount.textContent = `${users.length} users`;
    summaryDate.textContent  = modeData.captured_at
      ? modeData.captured_at.split('T')[0]
      : '';

    // Filter by search
    const query = searchInput.value.trim().toLowerCase();
    const filtered = query
      ? users.filter(u =>
          u.username.toLowerCase().includes(query) ||
          u.display_name.toLowerCase().includes(query)
        )
      : users;

    renderUserList(filtered);

    // Compare tab
    if (activeTab === 'compare') {
      showCompare(profileData);
    } else {
      hide(compareResults);
      show(userList);
    }
  }

  function renderUserList(users) {
    if (!users.length) {
      userList.innerHTML = `<div class="empty-state">No data captured for ${activeTab} yet.</div>`;
      return;
    }
    userList.innerHTML = users.map(u => `
      <a class="user-item" href="${u.profile_url}" target="_blank" rel="noopener" title="${u.display_name}">
        <div class="user-avatar">${u.username.charAt(0).toUpperCase()}</div>
        <div class="user-info">
          <div class="user-name">@${u.username}</div>
          <div class="user-display">${u.display_name !== u.username ? u.display_name : ''}</div>
        </div>
      </a>
    `).join('');
  }

  function showCompare(profileData) {
    const followingUsers = (profileData.following || {}).users || {};
    const followersUsers = (profileData.followers || {}).users || {};

    if (!Object.keys(followingUsers).length || !Object.keys(followersUsers).length) {
      hide(compareResults);
      show(userList);
      userList.innerHTML = `<div class="empty-state">Capture both Followers & Following to compare.</div>`;
      return;
    }

    hide(userList);
    show(compareResults);

    const result = Comparator.compare(followingUsers, followersUsers);

    cntNfb.textContent    = result.notFollowingBack.length;
    cntNfl.textContent    = result.notFollowedBack.length;
    cntMutual.textContent = result.mutual.length;

    listNfb.innerHTML = result.notFollowingBack.slice(0, 30).map(u =>
      `<a class="user-item" href="${u.profile_url}" target="_blank">
         <div class="user-avatar">${u.username.charAt(0).toUpperCase()}</div>
         <div class="user-info">
           <div class="user-name">@${u.username}</div>
           <div class="user-display">${u.display_name}</div>
         </div>
       </a>`
    ).join('') || '<div class="empty-state">None 🎉</div>';

    listNfl.innerHTML = result.notFollowedBack.slice(0, 30).map(u =>
      `<a class="user-item" href="${u.profile_url}" target="_blank">
         <div class="user-avatar">${u.username.charAt(0).toUpperCase()}</div>
         <div class="user-info">
           <div class="user-name">@${u.username}</div>
           <div class="user-display">${u.display_name}</div>
         </div>
       </a>`
    ).join('') || '<div class="empty-state">None 🎉</div>';
  }

  // ── Event Bindings ────────────────────────────────────────────────────────────
  function bindEvents() {
    btnStartFollowers.addEventListener('click', () => startRecording('followers'));
    btnStartFollowing.addEventListener('click', () => startRecording('following'));
    btnPause.addEventListener('click',          pauseRecording);
    btnResume.addEventListener('click',         resumeRecording);
    btnFinish.addEventListener('click',         finishRecording);
    btnFinishAuto.addEventListener('click',     finishRecording);

    tabFollowers.addEventListener('click', () => switchTab('followers'));
    tabFollowing.addEventListener('click', () => switchTab('following'));
    tabCompare.addEventListener('click',   () => switchTab('compare'));

    searchInput.addEventListener('input', renderResults);

    btnCopy.addEventListener('click',       copyToClipboard);
    btnCsv.addEventListener('click',        exportCSV);
    btnJson.addEventListener('click',       exportJSON);
    btnNewSession.addEventListener('click', newSession);
    btnClear.addEventListener('click',      clearData);
  }

  // ── Actions ───────────────────────────────────────────────────────────────────
  async function startRecording(mode) {
    const profile = profileInput.value.trim().replace(/^@/, '');
    if (!profile) {
      showToast('⚠️ Please enter an Instagram username.', 'error');
      profileInput.focus();
      return;
    }
    const res = await bg('START_RECORDING', { profile, mode });
    if (res.error) {
      showToast(`❌ ${res.error}`, 'error');
      return;
    }
    currentSession = res.session;
    currentState   = 'recording';
    hide(endNotice);
    showToast(`🟢 Recording ${mode} for @${profile}`, 'success');
    renderUI();
  }

  async function pauseRecording() {
    const res = await bg('PAUSE_RECORDING');
    if (res.error) { showToast(`❌ ${res.error}`, 'error'); return; }
    currentState = 'paused';
    showToast('⏸ Paused', '');
    renderUI();
  }

  async function resumeRecording() {
    const res = await bg('RESUME_RECORDING');
    if (res.error) { showToast(`❌ ${res.error}`, 'error'); return; }
    currentState = 'recording';
    showToast('▶ Resumed', 'success');
    renderUI();
  }

  async function finishRecording() {
    const res = await bg('FINISH_RECORDING');
    if (res.error) { showToast(`❌ ${res.error}`, 'error'); return; }
    currentState = 'finished';
    hide(endNotice);
    // Reload profiles data
    const prof = await bg('GET_PROFILES');
    profilesData = prof.profiles || {};
    currentProfile = currentSession?.profile || null;
    activeTab = currentSession?.mode || 'followers';
    showToast(`✅ Capture complete! ${currentSession?.captured || 0} users saved.`, 'success');
    renderUI();
  }

  function switchTab(tab) {
    activeTab = tab;
    [tabFollowers, tabFollowing, tabCompare].forEach(t => t.classList.remove('active'));
    $(`tab-${tab}`)?.classList.add('active');
    renderResults();
  }

  async function copyToClipboard() {
    const profileData = profilesData[currentProfile] || {};
    const modeData    = profileData[activeTab];
    if (!modeData || !Object.keys(modeData.users).length) {
      showToast('⚠️ No data to copy.', 'error'); return;
    }
    const text = Object.values(modeData.users)
      .map(u => `@${u.username} — ${u.display_name}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast(`📋 Copied ${Object.keys(modeData.users).length} users!`, 'success');
    } catch {
      showToast('❌ Copy failed.', 'error');
    }
  }

  function exportCSV() {
    const profileData = profilesData[currentProfile] || {};
    const modeData    = profileData[activeTab];
    if (!modeData) { showToast('⚠️ No data to export.', 'error'); return; }
    const csv = CSVExporter.build({
      profile: currentProfile,
      mode: activeTab,
      captured_at: modeData.captured_at,
      count: modeData.count,
      users: modeData.users
    });
    CSVExporter.download(csv, currentProfile, activeTab);
    showToast('⬇ CSV downloaded!', 'success');
  }

  function exportJSON() {
    const profileData = profilesData[currentProfile] || {};
    const modeData    = profileData[activeTab];
    if (!modeData) { showToast('⚠️ No data to export.', 'error'); return; }
    const obj = JSONExporter.build({
      profile: currentProfile,
      mode: activeTab,
      captured_at: modeData.captured_at,
      count: modeData.count,
      users: modeData.users
    });
    JSONExporter.download(obj, currentProfile, activeTab);
    showToast('⬇ JSON downloaded!', 'success');
  }

  async function newSession() {
    await bg('NEW_SESSION');
    currentState   = 'idle';
    currentSession = null;
    showToast('🔄 Ready for a new session.', '');
    renderUI();
  }

  async function clearData() {
    if (!confirm(`Clear all captured data for @${currentProfile || 'all profiles'}?`)) return;
    await bg('CLEAR_DATA', { profile: currentProfile });
    profilesData = {};
    currentState = 'idle';
    showToast('🗑 Data cleared.', '');
    renderUI();
  }

  // ── Background Message Handler ────────────────────────────────────────────────
  function onBackgroundMessage(msg) {
    if (msg.type === 'POSSIBLE_END') {
      if (currentState === 'recording') {
        show(endNotice);
      }
    }
  }

  // ── Stats Refresh (while recording) ──────────────────────────────────────────
  async function refreshStats() {
    if (currentState !== 'recording' && currentState !== 'paused') return;
    const res = await bg('GET_STATE');
    currentSession = res.session || currentSession;
    if (secRecording && !secRecording.classList.contains('hidden')) {
      renderRecordingSection();
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function bg(type, payload = {}) {
    return chrome.runtime.sendMessage({ type, ...payload });
  }

  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  function formatElapsed(ms) {
    if (!ms || ms < 0) return '0s';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  let toastTimer = null;
  function showToast(msg, type = '') {
    toast.textContent  = msg;
    toast.className    = `toast ${type}`;
    toast.style.opacity = '1';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
  }

  // ── Boot ──────────────────────────────────────────────────────────────────────
  init();

})();
