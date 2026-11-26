// Phone support. Two jobs, both prerequisites for the max-width media block
// at the end of style.css - the CSS alone can't do either:
//
// 1. The site ships no <meta name="viewport">, so phone browsers lay every
//    page out at a ~980px virtual width and zoom it out until it fits -
//    everything ends up tiny and no media query ever sees a phone width.
//    Injecting the tag is what makes the phone layout kick in at all.
//
// 2. Data tables (thead > tr.zahlavi) become stacked cards on a phone, and
//    each cell needs its column header as a visible label once the header
//    row is hidden. CSS can't read a header into a cell, so it's copied
//    here into data-label, which style.css shows via ::before. The desktop
//    layout ignores these attributes entirely.
(function () {
  'use strict';

  function addViewport() {
    if (document.querySelector('meta[name="viewport"]')) return;
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
    document.head.prepend(meta);
  }

  // Runs at document_start, before <head> exists - wait for the parser to
  // create it instead of inserting the tag somewhere it may be ignored.
  if (document.head) {
    addViewport();
  } else {
    const headWatch = new MutationObserver(() => {
      if (!document.head) return;
      headWatch.disconnect();
      addViewport();
    });
    headWatch.observe(document.documentElement, { childList: true });
  }

  function isBlankCell(cell) {
    if (cell.classList.contains('UISTMNumberCellHidden')) return true;
    if (cell.textContent.replace(/\u00a0/g, ' ').trim() !== '') return false;
    return !cell.querySelector('img, svg, input, select, textarea, button, a, .uf-icon');
  }

  const TITLE_LABEL = /^(predmet|názov|nazev|subject|title|name|štúdium|studium|study|dokument|document|súbor|soubor|file|meno|jméno|téma|tema|topic|vec|věc)\b/i;
  const NUMBER_LABEL = /^(por\.?|poř\.?|poradie|pořadí|p\. ?č\.?|č\.|#|no\.?)$/i;

  function cellText(cell) {
    return cell.textContent.replace(/\s+/g, ' ').trim();
  }

  function labelRow(tr, labels) {
    const titleCol = labels.findIndex((l) => TITLE_LABEL.test(l));
    Array.from(tr.children).forEach((cell, i) => {
      cell.setAttribute('data-label', labels[i]);
      const text = cellText(cell);
      if (isBlankCell(cell) || NUMBER_LABEL.test(labels[i]) || ((labels[i] === '' || i === 0) && /^\d+\.?$/.test(text))) {
        cell.classList.add('betterais-cell-blank');
      } else if (i === titleCol) {
        cell.classList.add('betterais-cell-title');
      } else if (text.length > 22) {
        cell.classList.add('betterais-cell-wide');
      } else if (text.length <= 14) {
        cell.classList.add('betterais-cell-short');
      }
    });
  }

  // a row that isn't data: empty spacer, or a single-cell heading
  // ("1. semester ZS 2026/2027") - both tagged so either layout can style them
  function markNonDataRow(tr) {
    const visible = Array.from(tr.children).filter((c) => !c.classList.contains('UISTMNumberCellHidden'));
    if (!visible.some((c) => !isBlankCell(c))) {
      tr.classList.add('betterais-row-empty');
    } else if (visible.length === 1) {
      tr.classList.add('betterais-row-title');
    }
    tr.classList.add('betterais-card-span');
  }

  // Grouped headers: two header rows, where a cell either spans both rows
  // (rowspan=2: "Kód", "Predmet") or heads a group whose sub-headers sit
  // in the row below (colspan=3 "Študenti" over "všetci" / "od
  // vyučujúceho" / "z cvičenia"). Resolved to one label per column,
  // "Študenti · všetci". Returns null for a single spanned row (a
  // timetable-style grid), which has no per-column labels.
  function groupedLabels(rows) {
    if (rows.length < 2) return null;
    const grid = rows.map(() => []);
    rows.forEach((tr, r) => {
      let c = 0;
      Array.from(tr.children).forEach((cell) => {
        while (grid[r][c] !== undefined) c += 1;
        const text = cellText(cell);
        for (let dr = 0; dr < (cell.rowSpan || 1) && r + dr < rows.length; dr += 1) {
          for (let dc = 0; dc < (cell.colSpan || 1); dc += 1) {
            grid[r + dr][c + dc] = dr === 0 ? text : null;
          }
        }
        c += cell.colSpan || 1;
      });
    });
    const width = Math.max(...grid.map((g) => g.length));
    const labels = [];
    for (let c = 0; c < width; c += 1) {
      const parts = grid.map((g) => g[c]).filter((t) => t);
      labels.push(parts.filter((t, i) => parts.indexOf(t) === i).join(' · '));
    }
    return labels;
  }

  // A column with no value in any row (Body before grading, Pokyny when no
  // place has instructions) is only width on a wide table - its header and
  // cells are tagged so the desktop layout can drop it.
  function markEmptyColumns(headRow, bodyRows, width) {
    const rows = bodyRows.filter((tr) => tr.children.length === width);
    if (!rows.length) return;
    for (let i = 0; i < width; i += 1) {
      if (!rows.every((tr) => isBlankCell(tr.children[i]))) continue;
      if (headRow.children[i]) headRow.children[i].classList.add('betterais-col-empty');
      rows.forEach((tr) => tr.children[i].classList.add('betterais-col-empty'));
    }
  }

  function labelTables(root) {
    root.querySelectorAll('table:not(.betterais-cards):not(.portal_menu):not(.ba-mail-list)').forEach((table) => {
      if (table.querySelector('td[class^="rozvrh-"]') || table.hasAttribute('data-betterais-tt')) return;
      const headRows = Array.from(table.querySelectorAll(':scope > thead > tr.zahlavi'));
      const bodyRows = Array.from(table.querySelectorAll(':scope > tbody > tr'));

      if (headRows.length) {
        const spanned = headRows.some((tr) => Array.from(tr.children).some((c) => c.colSpan > 1 || c.rowSpan > 1));
        // spanned headers that don't resolve to one label per column
        // (timetable grids) keep their grid and scroll sideways
        const labels = spanned ? groupedLabels(headRows) : Array.from(headRows[0].children).map(cellText);
        if (!labels) return;
        if (spanned && !bodyRows.some((tr) => tr.children.length === labels.length)) return;
        bodyRows.forEach((tr) => {
          if (tr.children.length === labels.length) labelRow(tr, labels);
          else markNonDataRow(tr);
        });
        if (!spanned) markEmptyColumns(headRows[0], bodyRows, labels.length);
        table.classList.add('betterais-cards');
        return;
      }

      // No <thead>: some pages (Kontrola plánu, ...) put the header in the
      // body as plain tr.zahlavi rows - possibly several sections, each with
      // its own header. A run of consecutive header rows is one header
      // (grouped when spanned); it labels the data rows that follow it.
      const headerRows = bodyRows.filter((tr) => tr.classList.contains('zahlavi'));
      if (!headerRows.length) return;
      const blocks = [];
      bodyRows.forEach((tr, i) => {
        if (!tr.classList.contains('zahlavi')) return;
        if (i > 0 && bodyRows[i - 1].classList.contains('zahlavi')) blocks[blocks.length - 1].push(tr);
        else blocks.push([tr]);
      });
      const blockLabels = new Map();
      for (const block of blocks) {
        const spanned = block.some((tr) => Array.from(tr.children).some((c) => c.colSpan > 1 || c.rowSpan > 1));
        const labels = spanned ? groupedLabels(block) : Array.from(block[0].children).map(cellText);
        if (!labels) return;
        blockLabels.set(block[block.length - 1], labels);
      }
      let labels = null;
      bodyRows.forEach((tr) => {
        if (tr.classList.contains('zahlavi')) {
          if (blockLabels.has(tr)) labels = blockLabels.get(tr);
          tr.classList.add('betterais-card-head');
        } else if (labels && tr.children.length === labels.length) {
          labelRow(tr, labels);
        } else {
          markNonDataRow(tr);
        }
      });
      table.classList.add('betterais-cards', 'betterais-rowtable');
    });
  }


  // ---- burger menu ---------------------------------------------------------
  // On a phone the site header (logo row, title, faculty links, counts,
  // logged-in name, sign-out) is replaced by one slim bar with a burger
  // button; everything from the header - plus the page's main tab strip -
  // moves into a slide-in drawer. Built from the site's own links (cloned
  // hrefs), so nothing here hardcodes a URL. Hidden on desktop by CSS.

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function cleanText(node) {
    return node ? node.textContent.replace(/\s+/g, ' ').trim() : '';
  }

  function drawerLink(href, label, extra) {
    const a = el('a', 'ba-drawer-link');
    a.href = href;
    a.append(el('span', 'ba-drawer-label', label));
    if (extra) a.append(extra);
    return a;
  }

  function drawerSection(title, links) {
    const section = el('section', 'ba-drawer-section');
    if (title) section.append(el('h2', 'ba-drawer-heading', title));
    links.forEach((link) => section.append(link));
    return section;
  }

  function buildMobileNav() {
    if (document.getElementById('betterais-mbar')) return;
    const header = document.getElementById('hlavicka');
    if (!header) return;

    const lang = (new URLSearchParams(location.search).get('lang') || 'sk').toLowerCase();
    const loggedIn = !!document.getElementById('log');
    const sections = [];

    // the page's primary tab strip (Portál študenta: Moje štúdium, E-index...)
    const tabs = document.querySelector('.mainpage table.portal_menu');
    if (tabs) {
      const links = Array.from(tabs.querySelectorAll('td.odsazena a')).map((a) => {
        const link = drawerLink(a.href, cleanText(a));
        if (a.closest('b')) link.classList.add('is-active');
        return link;
      });
      if (links.length) {
        const title = cleanText(document.querySelector('#titulek h1')) || 'Navigácia';
        sections.push(drawerSection(title, links));
        tabs.classList.add('betterais-in-drawer');
      }
    }

    // messages / documents / tasks: the site renders each as two separate
    // links (count, label) to the same URL - merge them into one row
    const counts = new Map();
    header.querySelectorAll('#ema a').forEach((a) => {
      const entry = counts.get(a.href) || { count: '', label: '' };
      const text = cleanText(a);
      if (/^\d+$/.test(text)) entry.count = text;
      else entry.label = text;
      counts.set(a.href, entry);
    });
    if (counts.size) {
      const links = Array.from(counts, ([href, { count, label }]) => {
        const badge = el('span', 'ba-drawer-badge', count || '0');
        if (count && count !== '0') badge.classList.add('is-nonzero');
        const name = label ? label.charAt(0).toUpperCase() + label.slice(1) : href;
        return drawerLink(href, name, badge);
      });
      sections.push(drawerSection('Schránka', links));
    }

    const langLinks = Array.from(header.querySelectorAll('#vlajky a')).map((a) => {
      const label = a.querySelector('[title]')?.getAttribute('title') || a.title || cleanText(a);
      return drawerLink(a.href, label);
    });
    if (langLinks.length) sections.push(drawerSection('Jazyk', langLinks));

    const facultyLinks = Array.from(header.querySelectorAll('#odkazy_fakult a')).map((a) => {
      const link = drawerLink(a.href, cleanText(a));
      link.target = '_blank';
      link.rel = 'noopener';
      return link;
    });
    if (facultyLinks.length) {
      const details = el('details', 'ba-drawer-section ba-drawer-faculties');
      details.append(el('summary', 'ba-drawer-heading', 'Fakulty'));
      const grid = el('div', 'ba-drawer-grid');
      facultyLinks.forEach((link) => grid.append(link));
      details.append(grid);
      sections.push(details);
    }

    const logout = header.querySelector('#ikonky a[href*="logout"]');
    if (logout) {
      const link = drawerLink(logout.href, logout.title || 'Odhlásiť sa');
      link.classList.add('ba-drawer-logout');
      sections.push(drawerSection('', [link]));
    }

    // bar
    const bar = el('div', '');
    bar.id = 'betterais-mbar';
    const home = el('a', 'ba-mbar-home');
    home.href = loggedIn ? `/auth/?lang=${lang}` : `/?lang=${lang}`;
    home.setAttribute('aria-label', cleanText(document.getElementById('univerzita')) || 'Domov');
    home.append(el('span', 'ba-mbar-logo'), el('span', 'ba-mbar-title', 'UIS'));
    const burger = el('button', 'ba-mbar-burger');
    burger.type = 'button';
    burger.setAttribute('aria-label', 'Menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', 'betterais-drawer');
    burger.append(el('span'), el('span'), el('span'));
    bar.append(home, burger);

    // drawer
    const scrim = el('div', '');
    scrim.id = 'betterais-scrim';
    const drawer = el('nav', '');
    drawer.id = 'betterais-drawer';
    drawer.setAttribute('aria-label', 'Menu');
    drawer.setAttribute('aria-hidden', 'true');
    const top = el('div', 'ba-drawer-top');
    const who = el('div', 'ba-drawer-user');
    const name = cleanText(document.getElementById('log')).replace(/^[^:]*:\s*/, '');
    who.textContent = name || cleanText(document.getElementById('univerzita'));
    const close = el('button', 'ba-drawer-close');
    close.type = 'button';
    close.setAttribute('aria-label', 'Zavrieť');
    top.append(who, close);
    drawer.append(top, ...sections);
    // stagger index for the open animation (see .ba-drawer-link in style.css)
    drawer.querySelectorAll('.ba-drawer-heading, .ba-drawer-link').forEach((node, i) => {
      node.style.setProperty('--ba-i', Math.min(i, 14));
    });

    function setOpen(open) {
      document.documentElement.classList.toggle('betterais-drawer-open', open);
      burger.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
    }
    burger.addEventListener('click', () => setOpen(true));
    close.addEventListener('click', () => setOpen(false));
    scrim.addEventListener('click', () => setOpen(false));
    drawer.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });

    document.body.prepend(bar, scrim, drawer);
  }

  // Portal tab strips scroll sideways when the tabs don't fit (style.css
  // keeps them on one line). The scrollbar is hidden, so: the vertical mouse
  // wheel scrolls the strip horizontally, and is-scroll-start/-end classes
  // drive an edge fade that shows more tabs are hidden on that side.
  function enhanceTabStrips(root) {
    root.querySelectorAll('table.portal_menu tr').forEach((strip) => {
      if (strip.dataset.betteraisStrip) return;
      strip.dataset.betteraisStrip = '1';
      const update = () => {
        const max = strip.scrollWidth - strip.clientWidth;
        strip.classList.toggle('is-scroll-start', max > 1 && strip.scrollLeft > 1);
        strip.classList.toggle('is-scroll-end', max > 1 && strip.scrollLeft < max - 1);
      };
      strip.addEventListener('wheel', (event) => {
        if (strip.scrollWidth <= strip.clientWidth || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        event.preventDefault();
        strip.scrollLeft += event.deltaY;
      }, { passive: false });
      strip.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();

      // refit once the web font (Roboto) has arrived and on load - widths
      // measured with the fallback font are too small, so tabs that "fit"
      // at DOMContentLoaded wrapped again a moment later
      fitOneLine(strip);
      if (document.fonts) document.fonts.ready.then(() => fitOneLine(strip));
      window.addEventListener('load', () => fitOneLine(strip));
      let frame = 0;
      window.addEventListener('resize', () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => fitOneLine(strip));
      });
    });
  }

  // Desktop strips wrap when the tabs don't fit (style.css). One or two
  // stray tabs on a second line looked untidy, so first shrink font and
  // padding together (--tab-scale) in small steps until every tab shares the
  // first line - down to 75%; only beyond that is wrapping left to happen.
  const TAB_SCALES = [1, .95, .9, .86, .83, .8, .77, .75];
  function fitOneLine(strip) {
    const tabs = Array.from(strip.querySelectorAll(':scope > td.odsazena'));
    if (tabs.length < 2) return;
    const oneLine = () => tabs[tabs.length - 1].offsetTop === tabs[0].offsetTop;
    for (const scale of TAB_SCALES) {
      strip.style.setProperty('--tab-scale', scale);
      if (oneLine()) return;
    }
  }

  // ---- attendance (List záznamníka učiteľa) ---------------------------------
  // A wide grid: subject (spanning its classes' rows), "Kedy", 14 week
  // columns of attendance icons, then operation icons. Way too wide for a
  // phone, and its grouped header can't become plain cards - so a card list
  // is built next to it: one card per subject, the operation links on top,
  // each class with a 14-square week strip. style.css shows the cards and
  // hides the grid on every screen size (a card grid on desktop).
  function attendanceState(cell) {
    const icon = cell.querySelector('[data-sysid^="doch-"]');
    if (!icon) return { state: 'none', title: '' };
    const id = icon.getAttribute('data-sysid');
    const title = icon.getAttribute('title') || icon.getAttribute('aria-label') || '';
    let state = 'other';
    if (/nepritom|absen|neucast/.test(id)) state = 'absent';
    else if (/omluv|ospravedl/.test(id)) state = 'excused';
    else if (/pritom/.test(id)) state = 'present';
    return { state, title };
  }

  function buildAttendance(root) {
    root.querySelectorAll('table:not([data-betterais-att])').forEach((table) => {
      if (!table.querySelector('tbody [data-sysid^="doch-"]')) return;
      // already built (the table may have been rebuilt since, losing its mark)
      const after = table.nextElementSibling || (table.parentElement && table.parentElement.nextElementSibling);
      if (after && after.classList.contains('betterais-att')) return;
      // the header is two tr.zahlavi rows at the top of the body in the
      // page's HTML; the site's table plugin moves them into a <thead> only
      // later - handle both, whichever this runs against
      const headRows = table.tHead && table.tHead.rows.length >= 2
        ? Array.from(table.tHead.rows)
        : Array.from(table.tBodies[0].rows).filter((tr) => tr.classList.contains('zahlavi'));
      if (headRows.length < 2) return;
      const visible = (cells) => Array.from(cells).filter((c) => !c.classList.contains('UISTMNumberCell'));
      const sub = visible(headRows[1].cells);
      if (!sub.length || !/^(kedy|kdy|when)$/i.test(cellText(sub[0]))) return;
      const weeks = sub.slice(1).map(cellText);
      table.setAttribute('data-betterais-att', '1');

      const list = el('div', 'betterais-att');
      let card = null;
      Array.from(table.tBodies[0].rows).forEach((tr) => {
        if (tr.classList.contains('zahlavi')) return;
        let cells = visible(tr.cells);
        if (cells.length > weeks.length + 1) {
          // first row of a subject: subject cell, then the class, then ops
          const subjectCell = cells[0];
          card = el('article', 'ba-att-card');
          const top = el('header', 'ba-att-head');
          const subject = el('div', 'ba-att-subject');
          subject.append(...Array.from(subjectCell.childNodes).map((n) => n.cloneNode(true)));
          const ops = el('div', 'ba-att-ops');
          cells.slice(2 + weeks.length).forEach((c) => {
            c.querySelectorAll('a').forEach((a) => ops.append(a.cloneNode(true)));
          });
          top.append(subject, ops);
          card.append(top);
          list.append(card);
          cells = cells.slice(1);
        }
        if (!card) return;
        const slot = el('div', 'ba-att-slot');
        const code = cellText(card.querySelector('.ba-att-subject')).split(' ')[0];
        let when = cellText(cells[0]);
        if (code && when.startsWith(code + ' ')) when = when.slice(code.length + 1);
        slot.append(el('div', 'ba-att-when', when));
        const strip = el('div', 'ba-att-weeks');
        let present = 0;
        let recorded = 0;
        weeks.forEach((label, i) => {
          const cell = cells[1 + i];
          const { state, title } = cell ? attendanceState(cell) : { state: 'none', title: '' };
          const sq = el('span', `ba-att-week is-${state}`, label.replace(/\.$/, ''));
          if (title) sq.title = title;
          if (state !== 'none') recorded += 1;
          if (state === 'present') present += 1;
          strip.append(sq);
        });
        // a class with nothing recorded (lectures, usually) shows just its
        // time - fourteen grey squares would only be noise
        if (recorded) {
          slot.append(el('div', 'ba-att-count', `${present}/${recorded}`), strip);
        } else {
          slot.classList.add('is-empty');
        }
        card.append(slot);
      });
      if (list.children.length) table.after(list);
    });
  }

  // ---- public homepage sections (is.stuba.sk/ signed out) ------------------
  // A 980px table: per section an icon cell, a spacer cell and a cell with
  // the heading plus links strung together by literal "•" text nodes - no
  // CSS can split that into a list. Rebuilt as dashboard-style cards (icon
  // tile, heading, link list; the site's bold links stay the key ones);
  // style.css lays them out and hides the table.
  function buildPublicSections(root) {
    root.querySelectorAll('.mainpage > table:not([data-betterais-sections])').forEach((table) => {
      const rows = Array.from(table.querySelectorAll(':scope > tbody > tr'))
        .filter((tr) => tr.querySelector('.sekce-nadpis') && tr.querySelector('.polozky-obr'));
      if (rows.length < 2 || table.closest('#menitko')) return;
      table.setAttribute('data-betterais-sections', '1');
      const grid = el('div', 'betterais-sections');
      rows.forEach((tr) => {
        const card = el('section', 'ba-sec-card');
        const head = el('header', 'ba-sec-head');
        const icon = el('span', 'ba-sec-icon');
        icon.append(tr.querySelector('.polozky-obr').cloneNode(true));
        head.append(icon, el('h2', 'ba-sec-title', cleanText(tr.querySelector('.sekce-nadpis'))));
        const list = el('ul', 'ba-sec-links');
        const cell = tr.querySelector('.sekce-nadpis').closest('td');
        cell.querySelectorAll('a').forEach((a) => {
          const li = el('li', a.querySelector('b') || a.closest('b') ? 'is-key' : '');
          const link = el('a', '', cleanText(a));
          link.href = a.href;
          if (a.target) link.target = a.target;
          li.append(link);
          list.append(li);
        });
        card.append(head, list);
        grid.append(card);
      });
      table.after(grid);
    });
  }

  // ---- Pošta (mail folder) -------------------------------------------------
  // The folder page is one big layout table: folder tree + stats + legend on
  // the left, the message list on the right. Hooks are added here so
  // style.css can address the parts (a sidebar, a list, a quota meter), the
  // message columns get names, and the &nbsp; runs the site pads subjects
  // and labels with are dropped.
  const MAIL_COLS = ['check', 'attach', 'tags', 'from', 'subject', 'date', 'size', 'ops'];

  function trimLeadingSpace(cell) {
    let n = cell.firstChild;
    while (n && n.nodeType === Node.TEXT_NODE && !n.textContent.replace(/\s+/g, '')) {
      const next = n.nextSibling;
      n.remove();
      n = next;
    }
    if (n && n.nodeType === Node.TEXT_NODE) n.textContent = n.textContent.replace(/^\s+/, '');
  }

  function polishMail(root) {
    const form = root.querySelector('form[name="post_slozka"]:not(.ba-mail)');
    if (!form) return;
    const cols = form.querySelectorAll(':scope > table > tbody > tr > td');
    if (cols.length !== 2) return;
    form.classList.add('ba-mail');
    cols[0].classList.add('ba-mail-side');
    cols[1].classList.add('ba-mail-main');

    cols[0].querySelectorAll('.tree .node-label').forEach((label) => {
      const span = label.querySelector('.nowrap') || label;
      Array.from(span.childNodes).forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) {
          const text = n.textContent.replace(/\s+/g, ' ').trim();
          if (!text) n.remove();
          else n.replaceWith(el('span', 'ba-mail-count', text.replace(/[()]/g, '')));
        }
      });
      if (!label.querySelector('a')) label.closest('.node-container').classList.add('is-current');
    });

    cols[0].querySelectorAll('td').forEach((td) => {
      if (td.querySelector('table, .tree')) return;
      if (td.matches('[style*="solid 1px"]')) return; // quota meter track
      if (td.querySelector('.uf-icon')) {
        Array.from(td.childNodes).forEach((n) => {
          if (n.nodeType === Node.TEXT_NODE) {
            const text = n.textContent.replace(/\s+/g, ' ').trim();
            if (!text) n.remove();
            else n.replaceWith(el('span', '', text));
          }
        });
        td.classList.add('ba-mail-iconrow');
        // legend rows are the icon rows without a link
        if (!td.querySelector('a')) td.closest('tr').classList.add('ba-mail-legend');
      } else if (!td.textContent.replace(/\s+/g, '')) {
        td.closest('tr').classList.add('ba-mail-gap');
      } else {
        td.classList.add('ba-mail-stat');
      }
    });
    // quota meter: the site sizes the fill in px of a 150px box; restate
    // it as a percentage so the meter can take the sidebar's width
    const firstLegend = cols[0].querySelector('tr.ba-mail-legend');
    const legendTitle = firstLegend && firstLegend.previousElementSibling;
    if (legendTitle && legendTitle.querySelector('td.ba-mail-stat')) legendTitle.classList.add('ba-mail-legend');
    const bar = cols[0].querySelector('td[style*="solid 1px"]');
    if (bar) {
      bar.closest('table').classList.add('ba-mail-quota');
      const fill = bar.querySelector('div');
      const box = parseFloat(bar.style.width);
      if (fill && box) fill.style.setProperty('width', (parseFloat(fill.style.width) / box) * 100 + '%', 'important');
    }

    const list = cols[1].querySelector('table[id^="tmtab_"]');
    if (list) {
      list.classList.add('ba-mail-list');
      list.querySelectorAll('tr').forEach((tr) => {
        if (tr.children.length !== MAIL_COLS.length) return;
        Array.from(tr.children).forEach((cell, i) => {
          cell.classList.add('ba-m-' + MAIL_COLS[i]);
          if (MAIL_COLS[i] === 'subject') trimLeadingSpace(cell);
        });
      });
    }
  }

  // ---- jQuery UI dialogs ("Pridať tag", ...) -------------------------------
  // The tag "+" is an <a href="#">: following it jumps the page to the top
  // while the dialog opens where the click was. Only the default jump is
  // cancelled - the site's own click handler still runs. Inside dialogs,
  // rows holding nothing but &nbsp; are spacers; they're marked so CSS can
  // drop them.
  function tidyDialog(dialog) {
    dialog.querySelectorAll('.ui-dialog-content tr').forEach((tr) => {
      const empty = !tr.textContent.replace(/\s+/g, '') &&
        !tr.querySelector('input:not([type="hidden"]), select, textarea, img, svg, button');
      tr.classList.toggle('ba-dialog-spacer', empty);
    });
  }

  function watchDialogs() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest && event.target.closest('a.tag-add[href="#"]');
      if (link) event.preventDefault();
    }, true);
    const observer = new MutationObserver(() => {
      document.querySelectorAll('.ui-dialog').forEach(tidyDialog);
    });
    observer.observe(document.body, { childList: true, subtree: false });
  }

  // ---- tab strip -> menu on a phone -----------------------------------------
  // A page's tab row (table.portal_menu: Moje štúdium, E-index, Moji
  // spolužiaci, ...) is a sideways-scrolling strip on a phone, with most
  // tabs off screen. Next to it a compact menu is built from the same
  // links: a full-width button naming the current tab, opening a list of
  // all of them. style.css shows the menu only on a phone and then hides
  // the strip; desktop keeps the strip.
  const MENU_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  const CHEVRON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6l6 -6"/></svg>';

  function buildTabMenus(root) {
    root.querySelectorAll('table.portal_menu:not([data-ba-tabmenu])').forEach((table, index) => {
      const cells = Array.from(table.querySelectorAll(':scope > tbody > tr > td'))
        .filter((td) => td.querySelector('a') && !td.classList.contains('portal_menu_hole'));
      if (cells.length < 3) return;
      table.setAttribute('data-ba-tabmenu', '1');
      const selected = table.getAttribute('data-pm-selected');
      const current = cells.find((td) => td.querySelector('b')) ||
        cells.find((td) => selected && td.getAttribute('data-pm-sysid') === selected);

      const wrap = el('div', 'ba-tabmenu');
      const button = el('button', 'ba-tabmenu-button');
      button.type = 'button';
      button.setAttribute('aria-expanded', 'false');
      const panelId = 'ba-tabmenu-' + index;
      button.setAttribute('aria-controls', panelId);
      button.innerHTML = '<span class="ba-tabmenu-icon">' + MENU_SVG + '</span>';
      button.append(el('span', 'ba-tabmenu-label', current ? cleanText(current) : cleanText(cells[0])));
      button.insertAdjacentHTML('beforeend', '<span class="ba-tabmenu-chevron">' + CHEVRON_SVG + '</span>');

      const list = el('ul', 'ba-tabmenu-list');
      list.id = panelId;
      list.hidden = true;
      cells.forEach((td) => {
        const source = td.querySelector('a');
        const li = el('li', td === current ? 'is-current' : '');
        const link = el('a', '', cleanText(source));
        link.href = source.href;
        if (source.target) link.target = source.target;
        if (td === current) link.setAttribute('aria-current', 'page');
        li.append(link);
        list.append(li);
      });

      const setOpen = (open) => {
        list.hidden = !open;
        wrap.classList.toggle('is-open', open);
        button.setAttribute('aria-expanded', String(open));
      };
      button.addEventListener('click', () => setOpen(list.hidden));
      document.addEventListener('click', (event) => {
        if (!list.hidden && !wrap.contains(event.target)) setOpen(false);
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !list.hidden) {
          setOpen(false);
          button.focus();
        }
      });

      wrap.append(button, list);
      table.before(wrap);
    });
  }

  function run() {
    buildAttendance(document);
    buildPublicSections(document);
    polishMail(document);
    watchDialogs();
    window.addEventListener('load', () => buildAttendance(document), { once: true });
    labelTables(document);
    buildMobileNav();
    enhanceTabStrips(document);
    buildTabMenus(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
