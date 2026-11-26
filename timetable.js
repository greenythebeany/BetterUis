// Adds an "export to calendar" button to the personal timetable page
// (rozvrhy_view.pl). The grid on that page is a weekly summary with no
// dates, so instead of scraping it we re-submit the page's own form in
// "Zoznam rozvrhových akcii" + "konkrétny v dňoch" mode: AIS then lists every
// single occurrence with its real date, which already accounts for holidays,
// odd/even weeks and one-off changes. That list becomes an .ics file.
(function () {
  'use strict';

  // Wide enough to cover any semester the timetable belongs to - AIS only
  // returns events from the selected period, so the extra months are free.
  const RANGE_MONTHS = 7;
  const TZID = 'Europe/Bratislava';

  // Language comes from the popup's setting (i18n.js is loaded before this
  // file). Starts on the 'auto' guess and is corrected once storage answers.
  const i18n = window.BetterAisI18n;
  let t = i18n.translator(i18n.resolve('auto'));

  // Column order of #tmtab_1 in the list view (same in SK and EN):
  // Deň | Od | Do | Predmet | Akcia | Miestnosť | Vyučujúci | ...
  const COL = { day: 0, from: 1, to: 2, subject: 3, kind: 4, room: 5, teacher: 6 };

  function findForm() {
    const select = document.querySelector('select[name="format"]');
    const form = select && select.form;
    if (!form || !form.querySelector('input[name="rozvrh_student"]')) return null;
    return form;
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function aisDate(date) {
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  }

  function shiftMonths(months) {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date;
  }

  async function fetchEventList(form) {
    const data = new FormData(form);
    data.set('format', 'list');
    data.set('typ_vypisu', 'konani');
    data.set('konani_od', aisDate(shiftMonths(-RANGE_MONTHS)));
    data.set('konani_do', aisDate(shiftMonths(RANGE_MONTHS)));
    data.set('zobraz2', '1');
    const response = await fetch(form.action, { method: 'POST', body: data, credentials: 'include' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return new DOMParser().parseFromString(await response.text(), 'text/html');
  }

  // Cell text without the <sup>(1,2)</sup> footnote markers AIS appends.
  function cellText(cell) {
    if (!cell) return '';
    const clone = cell.cloneNode(true);
    clone.querySelectorAll('sup').forEach((sup) => sup.remove());
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  // "Po 05.10.2026" + "8.00" -> "20261005T080000"
  function icsDateTime(dayCell, time) {
    const date = /(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(dayCell);
    const clock = /(\d{1,2})[.:](\d{2})/.exec(time);
    if (!date || !clock) return null;
    return `${date[3]}${pad(date[2])}${pad(date[1])}T${pad(clock[1])}${clock[2]}00`;
  }

  function parseEvents(doc) {
    const table = doc.querySelector('#tmtab_1');
    if (!table || !table.tBodies[0]) return [];
    return Array.from(table.tBodies[0].rows).map((row) => {
      const cells = row.cells;
      const day = cellText(cells[COL.day]);
      return {
        start: icsDateTime(day, cellText(cells[COL.from])),
        end: icsDateTime(day, cellText(cells[COL.to])),
        subject: cellText(cells[COL.subject]),
        kind: cellText(cells[COL.kind]),
        room: cellText(cells[COL.room]),
        teacher: cellText(cells[COL.teacher]),
      };
    }).filter((event) => event.start && event.end && event.subject);
  }

  function escapeText(value) {
    return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }

  // RFC 5545 caps lines at 75 octets; continuation lines start with a space.
  // Count UTF-8 bytes, not characters, so Slovak diacritics don't overflow.
  function fold(line) {
    const encoder = new TextEncoder();
    const parts = [];
    let current = '';
    let bytes = 0;
    for (const char of line) {
      const size = encoder.encode(char).length;
      const limit = parts.length ? 74 : 75; // continuation lines lose 1 to the space
      if (bytes + size > limit) {
        parts.push(current);
        current = '';
        bytes = 0;
      }
      current += char;
      bytes += size;
    }
    parts.push(current);
    return parts.join('\r\n ');
  }

  // Stable across exports, so re-importing updates events instead of
  // duplicating them in calendars that honour UIDs.
  function uid(event) {
    const key = `${event.start}|${event.subject}|${event.kind}|${event.room}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
    return `${event.start}-${(hash >>> 0).toString(16)}@betterais`;
  }

  function buildIcs(events) {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BetterUis//STU timetable//SK',
      'CALSCALE:GREGORIAN',
      `X-WR-CALNAME:${escapeText(t('icsCalendarName'))}`,
      `X-WR-TIMEZONE:${TZID}`,
      'BEGIN:VTIMEZONE',
      `TZID:${TZID}`,
      'BEGIN:DAYLIGHT',
      'TZOFFSETFROM:+0100',
      'TZOFFSETTO:+0200',
      'TZNAME:CEST',
      'DTSTART:19700329T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
      'END:DAYLIGHT',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:+0200',
      'TZOFFSETTO:+0100',
      'TZNAME:CET',
      'DTSTART:19701025T030000',
      'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
      'END:STANDARD',
      'END:VTIMEZONE',
    ];
    events.forEach((event) => {
      const summary = event.kind ? `${event.subject} (${event.kind})` : event.subject;
      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid(event)}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;TZID=${TZID}:${event.start}`,
        `DTEND;TZID=${TZID}:${event.end}`,
        `SUMMARY:${escapeText(summary)}`
      );
      if (event.room) lines.push(`LOCATION:${escapeText(event.room)}`);
      if (event.teacher) lines.push(`DESCRIPTION:${escapeText(event.teacher)}`);
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
  }

  function download(filename, text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function inject() {
    const form = findForm();
    if (!form || document.querySelector('.betterais-ics')) return;

    const bar = document.createElement('div');
    bar.className = 'betterais-ics';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'betterais-ics-btn';
    const status = document.createElement('span');
    status.className = 'betterais-ics-status';
    bar.append(button, status);

    // The last status shown, kept as a key + vars so a language switch can
    // re-render it instead of leaving a message in the old language.
    let lastStatus = null;
    function setStatus(key, vars) {
      lastStatus = key && { key, vars };
      status.textContent = key ? t(key, vars) : '';
    }
    function relabel() {
      button.textContent = t('icsButton');
      if (lastStatus) setStatus(lastStatus.key, lastStatus.vars);
    }
    relabel();

    function setLanguage(setting) {
      t = i18n.translator(i18n.resolve(setting));
      relabel();
    }
    // `uiLanguage` - see popup.js for why not the old `language` key
    chrome.storage.local.get('uiLanguage', (data) => setLanguage(data.uiLanguage || 'auto'));
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.uiLanguage) setLanguage(changes.uiLanguage.newValue || 'auto');
    });

    button.addEventListener('click', async () => {
      button.disabled = true;
      setStatus('icsLoading');
      try {
        const events = parseEvents(await fetchEventList(form));
        if (!events.length) {
          setStatus('icsEmpty');
          return;
        }
        download('rozvrh.ics', buildIcs(events));
        setStatus('icsDone', { count: events.length });
      } catch (error) {
        setStatus('icsError', { error: error.message });
      } finally {
        button.disabled = false;
      }
    });

    const title = document.getElementById('titulek');
    if (title) {
      title.after(bar);
    } else {
      form.before(bar);
    }
  }


  // ---- timetable view ---------------------------------------------------------
  // The page's weekly grid is a 131-column table: every hour is 10 cells of
  // 5 minutes plus a 2-cell gap, and each class is one cell spanning its
  // length. Unreadable on a phone and fragile on desktop. It's read here
  // into plain events (day, start, end, type, subject, room, teacher,
  // notes) and redrawn twice: a week grid with classes placed by time
  // (desktop) and a day-by-day agenda of cards (phone). style.css picks
  // which one shows and hides the original table.
  function hhmm(minutes) {
    return Math.floor(minutes / 60) + ':' + String(minutes % 60).padStart(2, '0');
  }

  function node(tag, className, text) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text) n.textContent = text;
    return n;
  }

  function readGrid(table) {
    const head = table.tHead && table.tHead.rows[0];
    if (!head) return null;
    const heads = Array.from(head.cells).slice(1);
    const first = heads.find((th) => /\d+[.:]\d+/.test(th.textContent));
    if (!first) return null;
    const [h, m] = first.textContent.trim().match(/(\d+)[.:](\d+)/).slice(1).map(Number);
    const dayStart = h * 60 + m;
    // one hour = its labelled cell + the gap cell after it
    const next = first.nextElementSibling;
    const gap = next && !/\d/.test(next.textContent) ? next.colSpan : 0;
    const unit = 60 / (first.colSpan + gap);
    const totalUnits = heads.reduce((sum, th) => sum + th.colSpan, 0);
    const dayEnd = dayStart + Math.ceil((totalUnits * unit) / 60) * 60;

    // type names from the legend (td.rozvrh-pred -> "prednáška", ...)
    const typeNames = {};
    document.querySelectorAll('.uisLegendContent td[class^="rozvrh-"]').forEach((td) => {
      typeNames[td.className.trim()] = td.textContent.replace(/\s+/g, ' ').trim();
    });

    const days = [];
    let day = null;
    Array.from(table.tBodies[0].rows).forEach((tr) => {
      if (tr.classList.contains('rozvrh-sep') || tr.cells.length <= 1) return;
      let cells = Array.from(tr.cells);
      if (cells[0].classList.contains('zahlavi')) {
        day = { name: cells[0].textContent.trim(), events: [] };
        days.push(day);
        cells = cells.slice(1);
      }
      if (!day) return;
      let at = 0;
      cells.forEach((td) => {
        const type = (td.className.match(/rozvrh-[\w-]+/) || [])[0];
        if (type) {
          const box = td.querySelector('div') || td;
          const links = Array.from(box.querySelectorAll(':scope > a'));
          const teacher = box.querySelector('i');
          const sup = box.querySelector('sup');
          day.events.push({
            start: dayStart + at * unit,
            end: dayStart + (at + td.colSpan) * unit,
            type,
            typeName: typeNames[type] || '',
            room: links[0] || null,
            subject: links[1] || links[0] || null,
            teacher: teacher ? teacher.querySelector('a') || teacher : null,
            note: sup ? sup.textContent.trim() : '',
          });
        }
        at += td.colSpan;
      });
    });
    days.forEach((d) => d.events.sort((a, b) => a.start - b.start));
    return { dayStart, dayEnd, days };
  }

  // overlapping classes in one day go to separate lanes
  function assignLanes(events) {
    const ends = [];
    events.forEach((ev) => {
      let lane = ends.findIndex((end) => end <= ev.start);
      if (lane === -1) lane = ends.length;
      ends[lane] = ev.end;
      ev.lane = lane;
    });
    return Math.max(1, ends.length);
  }

  function eventBody(ev) {
    const body = node('div', 'ba-tt-body');
    const top = node('div', 'ba-tt-meta');
    top.append(node('span', 'ba-tt-time', hhmm(ev.start) + '–' + hhmm(ev.end)));
    if (ev.typeName) top.append(node('span', 'ba-tt-type', ev.typeName));
    const subject = node('div', 'ba-tt-subject');
    if (ev.subject) subject.append(ev.subject.cloneNode(true));
    if (ev.note) subject.append(node('sup', '', ev.note));
    const where = node('div', 'ba-tt-where');
    if (ev.room) where.append(ev.room.cloneNode(true));
    if (ev.teacher) {
      if (ev.room) where.append(document.createTextNode(' · '));
      where.append(ev.teacher.cloneNode(true));
    }
    body.append(top, subject, where);
    return body;
  }

  function buildTimetableView() {
    const table = Array.from(document.querySelectorAll('table'))
      .find((tbl) => tbl.tHead && tbl.querySelector(':scope > tbody > tr > td[class^="rozvrh-"]'));
    if (!table || table.hasAttribute('data-betterais-tt')) return;
    const grid = readGrid(table);
    if (!grid || !grid.days.length) return;
    table.setAttribute('data-betterais-tt', '1');
    const span = grid.dayEnd - grid.dayStart;
    const pct = (min) => ((min - grid.dayStart) / span) * 100 + '%';

    const view = node('div', 'betterais-tt');

    // desktop: week grid
    const week = node('div', 'ba-tt-week');
    week.style.setProperty('--tt-hours', String(span / 60));
    const scale = node('div', 'ba-tt-row ba-tt-scale');
    scale.append(node('div', 'ba-tt-day'));
    const ticks = node('div', 'ba-tt-track');
    for (let min = grid.dayStart; min < grid.dayEnd; min += 60) {
      const tick = node('span', 'ba-tt-tick', hhmm(min));
      tick.style.left = pct(min);
      ticks.append(tick);
    }
    scale.append(ticks);
    week.append(scale);
    grid.days.forEach((d) => {
      const row = node('div', 'ba-tt-row');
      row.append(node('div', 'ba-tt-day', d.name));
      const track = node('div', 'ba-tt-track');
      track.style.setProperty('--tt-lanes', String(assignLanes(d.events)));
      d.events.forEach((ev) => {
        const block = node('div', 'ba-tt-event is-' + ev.type);
        block.style.left = pct(ev.start);
        block.style.width = 'calc(' + ((ev.end - ev.start) / span) * 100 + '% - 4px)';
        block.style.setProperty('--tt-lane', String(ev.lane));
        block.append(eventBody(ev));
        track.append(block);
      });
      row.append(track);
      week.append(row);
    });

    // phone: agenda
    const agenda = node('div', 'ba-tt-agenda');
    grid.days.forEach((d) => {
      const section = node('section', 'ba-tt-dayblock');
      section.append(node('h3', 'ba-tt-dayname', d.name));
      if (!d.events.length) {
        section.classList.add('is-free');
        section.append(node('div', 'ba-tt-free', '—'));
      }
      d.events.forEach((ev) => {
        const card = node('article', 'ba-tt-card is-' + ev.type);
        card.append(eventBody(ev));
        section.append(card);
      });
      agenda.append(section);
    });

    view.append(week, agenda);
    table.after(view);
  }


  // ---- display options form ("Spôsob zobrazenia rozvrhu") --------------------
  // AIS writes every option as a bare text node next to its radio/checkbox
  // ("<input type=radio>súhrnný týždenný"), with &nbsp; runs for spacing,
  // so nothing can be laid out or clicked as a label. Each control is
  // wrapped with its text in a real <label>, the leading text of a row
  // ("Typ výpisu", "Formát") becomes the row's label, and the rest goes into
  // a controls box - style.css does the layout. Inputs are moved, not
  // copied, so the site's own onclick/onchange handlers keep working.
  function cleanText(text) {
    return text.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  }

  function wrapControls(td) {
    const nodes = Array.from(td.childNodes);
    const controls = node('div', 'ba-opt-controls');
    let label = null;
    let rowLabel = null;
    let current = null;
    nodes.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const text = cleanText(n.textContent);
        n.remove();
        if (!text) return;
        if (current) {
          current.append(node('span', 'ba-opt-text', text));
          current = null;
        } else if (!rowLabel && !controls.childNodes.length) {
          rowLabel = node('span', 'ba-opt-label', text);
        } else {
          controls.append(node('span', 'ba-opt-inline', text));
        }
        return;
      }
      if (n.nodeType !== Node.ELEMENT_NODE) return;
      if (n.matches('input[type="radio"], input[type="checkbox"]')) {
        label = node('label', 'ba-opt');
        label.append(n);
        controls.append(label);
        current = label;
        return;
      }
      if (n.matches('script')) return;
      current = null;
      controls.append(n);
    });
    if (rowLabel) td.append(rowLabel);
    td.append(controls);
    td.classList.add('ba-opt-row');
    if (rowLabel) td.classList.add('has-label');
    if (controls.querySelector('input[type="radio"]')) td.classList.add('is-choice');
  }

  function polishOptionsForm() {
    const form = findForm();
    if (!form || form.classList.contains('ba-opts')) return;
    const table = form.querySelector(':scope > table');
    if (!table) return;
    form.classList.add('ba-opts');
    table.querySelectorAll(':scope > tbody > tr > td').forEach((td) => {
      if (td.id === 'poznamky2') {
        td.querySelectorAll('td').forEach(wrapControls);
        td.classList.add('ba-opt-sub');
        return;
      }
      wrapControls(td);
    });
  }

  inject();
  buildTimetableView();
  polishOptionsForm();
})();
