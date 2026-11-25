// File sizes as people read them. AIS prints sizes in raw binary units
// ("1 019,01 KiB", "2 345 678 B"); this rewrites any table cell that holds
// just a size into the largest sensible unit - "1,00 MB" - with the same
// binary maths and KB/MB/GB labels Windows uses. The exact original stays in
// the cell's tooltip.
(function () {
  'use strict';

  const UNITS = { b: 1, kib: 1024, kb: 1024, mib: 1024 ** 2, mb: 1024 ** 2, gib: 1024 ** 3, gb: 1024 ** 3 };
  const SIZE = /^\s*([\d\s .,]+?)\s*(B|KiB|KB|kB|MiB|MB|GiB|GB)\s*$/;

  // "1 019,01" (SK/CZ), "1,019.01" (EN), "1019" -> 1019.01 / 1019
  function parseNumber(text) {
    let t = text.replace(/[\s ]/g, '');
    const lastComma = t.lastIndexOf(',');
    const lastDot = t.lastIndexOf('.');
    if (lastComma > -1 && lastDot > -1) {
      // both present: the later one is the decimal separator
      t = lastComma > lastDot ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
    } else if (lastComma > -1) {
      // only commas: "1,019" with groups of three is EN thousands, else decimal
      t = /^\d{1,3}(,\d{3})+$/.test(t) ? t.replace(/,/g, '') : t.replace(',', '.');
    }
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }

  // number format of the page's language: decimal comma in SK/CZ, point in EN
  const lang = (/[?;&]lang=(sk|en|cz)\b/.exec(location.href) || [])[1]
    || (document.documentElement.lang || 'sk').slice(0, 2);
  const locale = lang === 'en' ? 'en-GB' : lang === 'cz' || lang === 'cs' ? 'cs-CZ' : 'sk-SK';

  function format(bytes) {
    let value = bytes;
    let unit = 'B';
    for (const next of ['KB', 'MB', 'GB']) {
      if (value < 1000) break;
      value /= 1024;
      unit = next;
    }
    const digits = unit === 'B' ? 0 : value < 10 ? 2 : value < 100 ? 1 : 0;
    const number = value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
    return `${number} ${unit}`;
  }

  function rewrite(root) {
    root.querySelectorAll('td:not([data-betterais-size])').forEach((cell) => {
      if (cell.children.length) return; // plain-text cells only
      const match = SIZE.exec(cell.textContent);
      if (!match) return;
      const n = parseNumber(match[1]);
      if (n === null) return;
      const original = cell.textContent.trim();
      cell.textContent = format(n * UNITS[match[2].toLowerCase()]);
      cell.title = original;
      cell.setAttribute('data-betterais-size', '1');
    });
  }

  function start() {
    rewrite(document);
    // tables some pages fill in after load
    let pending = false;
    new MutationObserver(() => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        rewrite(document);
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
