// UIS header: replaces the profile-photo dropdown with an always-visible row
// under the user's name. The site keeps its menu (#menu-popup: mail, document
// server with unread badge, storage, settings, sign-out, language flags) in
// the DOM and only reveals it when #pfp is clicked; style.css hides #pfp once
// this row exists, so the links are copied out here - copied, not moved, so
// the site's own popup markup stays intact for its scripts.
(function () {
  'use strict';

  // The site's own menu-item ids -> Tabler glyph in icons.js
  // (window.BetterAisIcons). Every link is shown as an icon; its name moves
  // to the tooltip.
  const MENU_ICONS = {
    'usermenu-email': 'mail',
    'usermenu-ds': 'file-description',
    'usermenu-storage': 'folder',
    'usermenu-nastaveni': 'settings',
    'usermenu-logout': 'logout',
  };

  function build() {
    const header = document.getElementById('header');
    const menu = document.getElementById('menu-popup');
    const info = header && header.querySelector('.right .info');
    if (!menu || !info || header.querySelector('.betterais-usermenu')) return;

    const bar = document.createElement('nav');
    bar.className = 'betterais-usermenu';

    menu.querySelectorAll('.items > a.item').forEach((item) => {
      const link = document.createElement('a');
      link.href = item.href;
      link.className = 'betterais-usermenu-link';
      if (item.target) link.target = item.target;
      const label = item.querySelector(':scope > span:not(.uf-icon):not(.badge)');
      const name = (label || item).textContent.trim();
      const sysid = (item.querySelector('[data-sysid]') || {}).dataset?.sysid;
      const svg = (window.BetterAisIcons || {})[MENU_ICONS[sysid]];
      if (svg) {
        link.classList.add('is-icon');
        link.title = name;
        link.setAttribute('aria-label', name);
        window.BetterAisDom.setMarkup(link, svg.replace('<svg ', '<svg class="betterais-icon" aria-hidden="true" '));
      } else {
        link.textContent = name; // unknown item: keep it readable as text
      }
      const badge = item.querySelector('.badge');
      if (badge && badge.textContent.trim()) {
        const count = document.createElement('span');
        count.className = 'betterais-usermenu-badge';
        count.textContent = badge.textContent.trim();
        link.append(count);
        link.title = `${name} (${count.textContent})`;
      }
      if (/logout/.test(item.pathname)) {
        link.classList.add('is-logout');
        // the user's name sits in the row right before sign-out, linking to
        // their profile like the name at the top of the site's own menu
        const nameLine = info.lastElementChild;
        const profile = menu.querySelector('.user-info a');
        if (nameLine && profile) {
          const name = document.createElement('a');
          name.href = profile.href;
          if (profile.target) name.target = profile.target;
          name.className = 'betterais-usermenu-link betterais-usermenu-name';
          name.textContent = nameLine.textContent.trim();
          nameLine.classList.add('betterais-moved-name');
          bar.append(name);
        }
      }
      bar.append(link);
    });

    info.append(bar);

    // language flags sit on the first line, right after the name day
    const langs = menu.querySelector('.lang-switcher');
    const nameDay = info.firstElementChild;
    if (langs && nameDay) {
      const flags = langs.cloneNode(true);
      flags.className = 'betterais-usermenu-langs';
      nameDay.classList.add('betterais-nameday');
      nameDay.append(flags);
    }
    header.classList.add('betterais-has-usermenu');
    addWordmark(header);
    alignToHelp();
  }

  // "UIS" wordmark after the site's own logo: two accent squares sit above a
  // shorter U, level with the tops of I and S. Drawn as SVG so the squares
  // can take the accent colour (CSS fill) and the U its custom shape; "IS"
  // is real text in the page font.
  const WORDMARK_UIS =
    '<svg class="betterais-wordmark" data-brand="uis" viewBox="0 0 124 60" role="img" aria-label="UIS">' +
    '<path class="wm-u" d="M6.5 17V38a13.5 13.5 0 0 0 27 0V17"/>' +
    '<text class="wm-text" x="47" y="58">IS</text>' +
    // Nothing style: the whole word in dot-matrix type instead (nothing.css)
    '<text class="wm-full" x="-2" y="58">UIS</text>' +
    // dots last, so in the Nothing style they paint over the U's top pixels
    '<rect class="wm-dot" x="0" y="2" width="13" height="11" rx="1.5"/>' +
    '<rect class="wm-dot" x="27" y="2" width="13" height="11" rx="1.5"/>' +
    '</svg>';

  // "Back to AIS" (popup toggle, html[data-brand="ais"]): a plain drawn A
  // in the U's place, full height, in the same weight as "IS" - no accent.
  // The A is a little wider than the U, so "IS" moves right.
  const WORDMARK_AIS =
    '<svg class="betterais-wordmark" data-brand="ais" viewBox="0 0 132 60" role="img" aria-label="AIS">' +
    '<path class="wm-a" fill-rule="evenodd" d="M0 58L18 2H30L48 58H35L31.14 46H16.86L13 58ZM19.43 38L24 23.8L28.57 38Z"/>' +
    '<text class="wm-text" x="55" y="58">IS</text>' +
    '<text class="wm-full" x="-2" y="58">AIS</text>' +
    '</svg>';

  function wordmarkMarkup() {
    return document.documentElement.getAttribute('data-brand') === 'ais' ? WORDMARK_AIS : WORDMARK_UIS;
  }

  function addWordmark(header) {
    const left = header.querySelector('.left');
    if (!left || left.querySelector('.betterais-wordmark')) return;
    left.prepend(window.BetterAisDom.parseMarkup(wordmarkMarkup()));
  }

  // the popup toggle flips html[data-brand] live - swap the drawn wordmark
  new MutationObserver(() => {
    const current = document.querySelector('#header .betterais-wordmark');
    if (current && current.getAttribute('data-brand') !== document.documentElement.getAttribute('data-brand')) {
      current.replaceWith(window.BetterAisDom.parseMarkup(wordmarkMarkup()));
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-brand'] });


  // UIS + STU together are exactly as tall as the right-hand block (name
  // day ... icon row). Measured, because the header's height is auto, so a
  // CSS 100% can't resolve. Safe from feedback: style.css keeps the right
  // column from shrinking or wrapping, so the logo's size can't change it.
  function sizeBrand(header) {
    const info = header && header.querySelector('.right .info');
    if (!info) return;
    const h = Math.round(info.getBoundingClientRect().height);
    if (h > 0 && header.style.getPropertyValue('--brand-h') !== `${h}px`) {
      header.style.setProperty('--brand-h', `${h}px`);
    }
  }

  // Keep the logout icon centred over the breadcrumb's help (?) icon. The
  // two live in different containers whose edges don't match at every
  // window width / zoom, so a fixed inset can't do it: measure both and
  // nudge the header's right padding (--header-pad-r, style.css) by the gap.
  function alignToHelp() {
    const header = document.getElementById('header');
    sizeBrand(header);
    const logout = header && header.querySelector('.betterais-usermenu .is-logout');
    const help = document.querySelector('[aria-label="breadcrumb"] .helpinbreadcrumbs .uf-icon')
      || document.querySelector('[aria-label="breadcrumb"] .searchinbreadcrumbs .uf-icon');
    if (!logout || !help) return;
    // with the photo shown it sits where the logout icon would align - so
    // drop the alignment and use the default inset (style.css)
    if (document.documentElement.getAttribute('data-pfp') !== 'off') {
      header.style.removeProperty('--header-pad-r');
      return;
    }
    const centre = (el) => {
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2;
    };
    const target = logout.querySelector('svg') || logout;
    const dx = centre(help) - centre(target);
    if (Math.abs(dx) < 0.5) return;
    const current = parseFloat(getComputedStyle(header).paddingRight) || 0;
    header.style.setProperty('--header-pad-r', `${Math.max(0, current - dx)}px`);
  }

  // The photo does what clicking the name does - opens the profile (the
  // name link's own href/target) - instead of the site's popup menu. Capture
  // phase on document runs before the site's handler on #pfp, and stopping
  // the event there keeps that handler from ever seeing the click.
  document.addEventListener('click', (event) => {
    const pfp = event.target.closest && event.target.closest('#header #pfp');
    if (!pfp) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const profile = document.querySelector('#menu-popup .user-info a, .betterais-usermenu-name');
    if (!profile) return;
    if (profile.target === '_blank') window.open(profile.href, '_blank', 'noopener');
    else window.location.href = profile.href;
  }, true);

  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(alignToHelp);
  });
  window.addEventListener('load', alignToHelp);
  if (document.fonts) document.fonts.ready.then(alignToHelp);

  // The site builds #menu-popup with its own script, sometimes after
  // DOMContentLoaded - so keep watching until the row exists, and give up
  // after a few seconds on pages that simply have no user menu.
  function start() {
    build();
    if (document.querySelector('.betterais-usermenu')) return;
    const observer = new MutationObserver(() => {
      build();
      if (document.querySelector('.betterais-usermenu')) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      // no row after all: give the site's photo menu back (style.css hides
      // #pfp from the first paint to avoid a flash)
      const header = document.getElementById('header');
      if (header && !header.querySelector('.betterais-usermenu')) header.classList.add('betterais-keep-pfp');
    }, 8000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
