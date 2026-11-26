// Update check. BetterUis is installed from its GitHub repository, not a
// store, so nothing tells the user a new version exists. This reads the
// version in the repository's manifest.json and compares it with the
// installed one. The request carries no user data; the answer is cached
// for CHECK_EVERY_MS so it runs at most a few times a day. Shared by the
// background script (toolbar badge) and the popup (banner).
(function (global) {
  'use strict';

  const REPO_URL = 'https://github.com/greenythebeany/BetterUis';
  const MANIFEST_URL = 'https://raw.githubusercontent.com/greenythebeany/BetterUis/main/manifest.json';
  const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;

  // "4.1.10" > "4.1.9"; missing parts count as 0
  function isNewer(remote, local) {
    const a = String(remote).split('.').map((n) => parseInt(n, 10) || 0);
    const b = String(local).split('.').map((n) => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
      if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
    }
    return false;
  }

  function installedVersion() {
    return chrome.runtime.getManifest().version;
  }

  // -> { current, latest, available } ; `force` skips the cache
  async function check(force) {
    const current = installedVersion();
    const { updateCheck } = await chrome.storage.local.get('updateCheck');
    let latest = updateCheck && updateCheck.latest;
    const fresh = updateCheck && Date.now() - updateCheck.at < CHECK_EVERY_MS;
    if (force || !fresh) {
      try {
        const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
        if (response.ok) {
          latest = (await response.json()).version || latest;
          await chrome.storage.local.set({ updateCheck: { at: Date.now(), latest } });
        }
      } catch (_) {
        // offline or GitHub unreachable - keep the last known answer
      }
    }
    return { current, latest: latest || current, available: !!latest && isNewer(latest, current) };
  }

  // toolbar badge: a small accent dot while an update is waiting
  async function updateBadge(result) {
    const action = chrome.action || chrome.browserAction;
    if (!action) return;
    try {
      await action.setBadgeText({ text: result.available ? '1' : '' });
      if (result.available) await action.setBadgeBackgroundColor({ color: '#831135' });
    } catch (_) {
      // badge API missing (e.g. some mobile browsers) - the popup banner still works
    }
  }

  global.BetterUisUpdate = { REPO_URL, check, updateBadge, isNewer };
})(typeof self !== 'undefined' ? self : window);
