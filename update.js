// Update check. BetterUis is installed from its GitHub repository, not a
// store, so nothing tells the user a new version exists. This reads the
// tag of the repository's latest GitHub release (v4.2.0 -> 4.2.0) and
// compares it with the installed one - so the banner only appears once
// there is a release ZIP to download. The request carries no user data; the answer is cached
// for CHECK_EVERY_MS so it runs at most a few times a day. Shared by the
// background script (toolbar badge) and the popup (banner).
(function (global) {
  'use strict';

  const REPO_URL = 'https://github.com/greenythebeany/BetterUis';
  // the banner's download button lands on the newest release and its ZIP
  const RELEASE_URL = REPO_URL + '/releases/latest';
  const LATEST_API = 'https://api.github.com/repos/greenythebeany/BetterUis/releases/latest';
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

  // A store install (Chrome Web Store / Firefox Add-ons) is updated by the
  // browser itself - no GitHub check, badge or banner there. Chrome Web
  // Store installs carry an update_url in the manifest; Firefox Add-ons
  // installs don't, but report installType "normal", while a folder loaded
  // by hand (Load unpacked / about:debugging) reports "development".
  async function storeManaged() {
    if (chrome.runtime.getManifest().update_url) return true;
    try {
      const self = chrome.management && chrome.management.getSelf ? await chrome.management.getSelf() : null;
      return !!self && self.installType === 'normal';
    } catch (_) {
      return false;
    }
  }

  // -> { current, latest, available } ; `force` skips the cache
  async function check(force) {
    const current = installedVersion();
    if (await storeManaged()) return { current, latest: current, available: false };
    const { updateCheck } = await chrome.storage.local.get('updateCheck');
    let latest = updateCheck && updateCheck.latest;
    const fresh = updateCheck && Date.now() - updateCheck.at < CHECK_EVERY_MS;
    if (force || !fresh) {
      try {
        const response = await fetch(LATEST_API, {
          cache: 'no-store',
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (response.ok) {
          const tag = String((await response.json()).tag_name || '');
          latest = tag.replace(/^v/i, '') || latest;
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

  global.BetterUisUpdate = { REPO_URL, RELEASE_URL, check, updateBadge, isNewer };
})(typeof self !== 'undefined' ? self : window);
