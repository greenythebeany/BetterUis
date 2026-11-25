// Second half of the popup's "Apply & reload page" button. The popup can't
// reload the extension AND the tab itself: chrome.runtime.reload() tears the
// popup down instantly, before it gets to touch the tab. So the popup notes
// which tab to refresh (pendingReloadTab) and reloads the extension; this
// script starts with the freshly loaded extension, picks the note up and
// hard-reloads that tab, so it runs on the files just re-read from disk.
async function reloadPendingTab() {
  const { pendingReloadTab } = await chrome.storage.local.get('pendingReloadTab');
  if (pendingReloadTab === undefined) return;
  await chrome.storage.local.remove('pendingReloadTab');
  try {
    await chrome.tabs.reload(pendingReloadTab, { bypassCache: true });
  } catch (_) {
    // the tab was closed meanwhile - nothing to refresh
  }
}

chrome.runtime.onInstalled.addListener(reloadPendingTab);
chrome.runtime.onStartup.addListener(reloadPendingTab);
// also on any plain worker start, in case the install event was missed
reloadPendingTab();
