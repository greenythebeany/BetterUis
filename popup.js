// Preset themes vendored in themes.css from github.com/greenythebeany/
// jellywave. Swatch colors here are just for the picker preview - the real
// palette (a dozen-odd variables per theme) lives in themes.css and is
// applied by content.js setting the data-theme attribute to `slug`.
const PRESET_THEMES = [
    { slug: 'catppuccin-mocha', label: 'Catppuccin Mocha', bg: '#1e1e2e', accent: '#cba6f7' },
    { slug: 'catppuccin-macchiato', label: 'Catppuccin Macchiato', bg: '#24273a', accent: '#c6a0f6' },
    { slug: 'catppuccin-frappe', label: 'Catppuccin Frappé', bg: '#303446', accent: '#ca9ee6' },
    { slug: 'catppuccin-latte', label: 'Catppuccin Latte', bg: '#eff1f5', accent: '#8839ef' },
    { slug: 'dracula', label: 'Dracula', bg: '#282a36', accent: '#bd93f9' },
    { slug: 'nord', label: 'Nord', bg: '#2e3440', accent: '#88c0d0' },
    { slug: 'gruvbox-dark', label: 'Gruvbox Dark', bg: '#282828', accent: '#fe8019' },
    { slug: 'gruvbox-light', label: 'Gruvbox Light', bg: '#fbf1c7', accent: '#af3a03' },
    { slug: 'tokyonight', label: 'Tokyo Night', bg: '#1a1b26', accent: '#7aa2f7' },
    { slug: 'rose-pine', label: 'Rosé Pine', bg: '#191724', accent: '#c4a7e7' },
    { slug: 'rose-pine-moon', label: 'Rosé Pine Moon', bg: '#232136', accent: '#c4a7e7' },
    { slug: 'rose-pine-dawn', label: 'Rosé Pine Dawn', bg: '#faf4ed', accent: '#907aa9' },
    { slug: 'kanagawa', label: 'Kanagawa', bg: '#1f1f28', accent: '#957fb8' },
    { slug: 'solarized-dark', label: 'Solarized Dark', bg: '#002b36', accent: '#268bd2' },
    { slug: 'solarized-light', label: 'Solarized Light', bg: '#ffffff', accent: '#268bd2' },
];

document.addEventListener('DOMContentLoaded', function () {
    const themeButtons = document.querySelectorAll('#themeSwitch button');
    const reloadButton = document.getElementById('reload-button');
    const colorOptions = document.querySelectorAll('.color-option');
    const colorGrid = document.getElementById('colorGrid');
    // Animácie: on by default; content.js -> html[data-motion], motion.js
    const animationsEnabled = document.getElementById('animationsEnabled');
    // Profilová fotka: header photo, on by default (content.js -> html[data-pfp])
    const pfpEnabled = document.getElementById('pfpEnabled');
    const ttAccentEnabled = document.getElementById('ttAccentEnabled');
    const brandAisEnabled = document.getElementById('brandAisEnabled');
    const accentHint = document.getElementById('accentHint');
    // Nothing style always uses Nothing red - must match nothing.css
    const NOTHING_RED = '#d71921';
    let savedLink = '#7a1030';
    let currentStyle = 'default';

    // The popup's own accent: Nothing red while that style is on, otherwise
    // the user's pick.
    function paintAccent() {
        document.documentElement.style.setProperty('--link', currentStyle === 'nothing' ? NOTHING_RED : savedLink);
    }
    const themeGrid = document.getElementById('themeGrid');
    const themeSwitch = document.getElementById('themeSwitch');
    const scheduleEnabled = document.getElementById('scheduleEnabled');
    const scheduleStart = document.getElementById('scheduleStart');
    const scheduleEnd = document.getElementById('scheduleEnd');
    const scheduleTimes = document.getElementById('scheduleTimes');
    const scheduleHint = document.getElementById('scheduleHint');

    const languageButtons = document.querySelectorAll('#languageSwitch button');
    const langButton = document.getElementById('langButton');
    const langMenu = document.getElementById('languageSwitch');

    // flags for the language picker (top-right): the same flag images UIS
    // shows in its own header, loaded from is.stuba.sk (not bundled - the
    // site's artwork stays the site's). "auto" is a globe in the menu, while
    // the button shows the language auto resolved to + an A badge.
    const flagImg = code => '<img class="flag" alt="" src="https://is.stuba.sk/img/flags/' + code + '.svg">';
    const FLAGS = {
        sk: flagImg('sk'),
        cs: flagImg('cz'),
        en: flagImg('en'),
        auto: '<svg class="globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18"/></svg>',
    };
    document.querySelectorAll('.lang-flag').forEach(el => { BetterAisDom.setMarkup(el, FLAGS[el.dataset.flag] || ''); });

    function setLangMenu(open) {
        langMenu.hidden = !open;
        langButton.setAttribute('aria-expanded', String(open));
    }
    langButton.addEventListener('click', function (e) {
        e.stopPropagation();
        setLangMenu(langMenu.hidden);
    });
    document.addEventListener('click', function (e) {
        if (!langMenu.hidden && !langMenu.contains(e.target)) setLangMenu(false);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setLangMenu(false);
    });
    let languageSetting = 'auto';
    let t = BetterAisI18n.translator(BetterAisI18n.resolve(languageSetting));

    // Fills every [data-i18n] element, then re-renders the bits built in JS
    // (schedule hint, "None" preset chip) that carry their own text.
    // language of the UIS tab under the popup (from its lang= parameter),
    // so Auto follows the page: lang=en -> English popup
    let tabLanguage = null;

    function applyLanguage(setting) {
        languageSetting = setting;
        const lang = BetterAisI18n.resolve(setting, tabLanguage);
        t = BetterAisI18n.translator(lang);
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = t(el.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = t(el.dataset.i18nTitle);
            el.setAttribute('aria-label', el.title);
        });
        languageButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === setting);
        });
        if (langButton) {
            BetterAisDom.setMarkup(langButton, (FLAGS[lang] || FLAGS.en)
                + (setting === 'auto' ? '<span class="lang-auto-badge" aria-hidden="true">A</span>' : ''));
        }
        if (accentHint) accentHint.textContent = currentStyle === 'nothing' ? t('accentLocked') : '';
        const noneLabel = themeGrid.querySelector('.theme-chip[data-slug=""] .theme-chip-label');
        if (noneLabel) noneLabel.textContent = t('presetNone');
        renderSchedule();
        if (typeof renderUpdate === 'function') renderUpdate();
    }

    // Manual dark/light pick, kept separately from the schedule so turning
    // the schedule off restores whatever the user had chosen before.
    let manualTheme = 'light';

    // Mirrors inDarkWindow() in content.js - keep the two in sync.
    function toMinutes(hhmm) {
        const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm || '');
        return match ? Number(match[1]) * 60 + Number(match[2]) : null;
    }

    function inDarkWindow(schedule, now) {
        const start = toMinutes(schedule.start);
        const end = toMinutes(schedule.end);
        if (start === null || end === null || start === end) return false;
        const minutes = now.getHours() * 60 + now.getMinutes();
        return start < end
            ? minutes >= start && minutes < end
            : minutes >= start || minutes < end;
    }

    function readSchedule() {
        return {
            enabled: scheduleEnabled.checked,
            start: scheduleStart.value || '22:00',
            end: scheduleEnd.value || '06:00',
        };
    }

    // light presets - must match LIGHT_PRESETS in content.js
    const LIGHT_PRESETS = new Set(['catppuccin-latte', 'gruvbox-light', 'solarized-light', 'rose-pine-dawn']);
    let activePreset = '';
    let lastTheme = 'light';

    // An active preset decides the popup's light/dark-ness and palette, as
    // it does on the site; without one the Theme switch does.
    function setPopupTheme(theme) {
        lastTheme = theme;
        const effective = activePreset ? (LIGHT_PRESETS.has(activePreset) ? 'light' : 'dark') : theme;
        document.body.classList.toggle('dark-mode', effective === 'dark');
        document.body.classList.toggle('light-mode', effective === 'light');
    }

    function setPopupPreset(slug) {
        activePreset = slug || '';
        if (activePreset) document.documentElement.setAttribute('data-theme', activePreset);
        else document.documentElement.removeAttribute('data-theme');
        setPopupTheme(lastTheme);
    }

    // Reflects the schedule in the UI: locks the manual switch, highlights
    // whichever side is currently in effect, and explains it in a hint.
    function renderSchedule() {
        const schedule = readSchedule();
        scheduleTimes.classList.toggle('disabled', !schedule.enabled);
        themeSwitch.classList.toggle('locked', schedule.enabled);

        if (!schedule.enabled) {
            scheduleHint.textContent = '';
            setThemeButtons(manualTheme);
            setPopupTheme(manualTheme);
            return;
        }

        const effective = inDarkWindow(schedule, new Date()) ? 'dark' : 'light';
        setThemeButtons(effective);
        setPopupTheme(effective);
        scheduleHint.textContent = schedule.start === schedule.end
            ? t('scheduleSame')
            : t('scheduleHint', { start: schedule.start, end: schedule.end, now: t(effective).toLowerCase() });
    }

    function saveSchedule() {
        const schedule = readSchedule();
        chrome.storage.local.set({ schedule });
        renderSchedule();
        notifyContentScript({ schedule });
    }

    function setThemeButtons(theme) {
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    // A tiny page mock-up in the theme's own colours: its background, an
    // accent dot and title line, and a faded body line - reads as "what the
    // site will look like" rather than an abstract colour split.
    function swatchMarkup(bg, accent) {
        return `<span class="theme-swatch" style="--sw-bg: ${bg}; --sw-accent: ${accent}">` +
            '<span class="sw-dot"></span>' +
            '<span class="sw-lines"><span class="sw-line"></span><span class="sw-line sw-line-soft"></span></span>' +
            '</span>';
    }

    // Builds the "None" chip (falls back to the Theme/Accent color cards
    // above) plus one chip per PRESET_THEMES entry.
    function buildThemeGrid(activeSlug) {
        themeGrid.replaceChildren();

        const none = document.createElement('button');
        none.type = 'button';
        none.className = 'theme-chip';
        none.dataset.slug = '';
        // "None" previews the manual Theme + Accent choice, via the popup's own vars
        BetterAisDom.setMarkup(none, swatchMarkup('var(--bg)', 'var(--link)') + '<span class="theme-chip-label"></span>');
        none.querySelector('.theme-chip-label').textContent = t('presetNone');
        themeGrid.appendChild(none);

        PRESET_THEMES.forEach(preset => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'theme-chip';
            chip.dataset.slug = preset.slug;
            BetterAisDom.setMarkup(chip, swatchMarkup(preset.bg, preset.accent) +
                `<span class="theme-chip-label">${preset.label}</span>`);
            themeGrid.appendChild(chip);
        });

        setActiveThemeChip(activeSlug);
    }

    function setActiveThemeChip(activeSlug) {
        themeGrid.querySelectorAll('.theme-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.slug === (activeSlug || ''));
        });
    }

    function notifyContentScript(payload) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, payload);
        });
    }

    // Load saved preferences (defaults must match content.js)
    // update check: banner when GitHub has a newer version, version label
    // in the footer. Re-rendered on language change (renderUpdate).
    const updateBanner = document.getElementById('updateBanner');
    const versionLabel = document.getElementById('versionLabel');
    let updateResult = null;

    function renderUpdate() {
        versionLabel.textContent = 'v' + chrome.runtime.getManifest().version;
        if (!updateResult) return;
        updateBanner.hidden = !updateResult.available;
        document.getElementById('updateTitle').textContent = t('updateAvailable', { version: updateResult.latest });
    }

    document.getElementById('updateAction').addEventListener('click', function () {
        chrome.tabs.create({ url: BetterUisUpdate.RELEASE_URL });
    });

    if (window.BetterUisUpdate) {
        BetterUisUpdate.check(false).then(function (result) {
            updateResult = result;
            renderUpdate();
            BetterUisUpdate.updateBadge(result);
        });
    }

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
        const tab = (tabs || [])[0];
        tabLanguage = BetterAisI18n.languageFromUrl(tab && tab.url);
        if (tabLanguage && languageSetting === 'auto') applyLanguage('auto');
    });

    chrome.storage.local.get(['theme', 'linkColor', 'forcedTheme', 'schedule', 'uiLanguage', 'uiStyle', 'animations', 'showPfp', 'nothingUnlocked', 'ttAccent', 'brandAis'], function (data) {
        // whoever is already using Nothing keeps it unlocked
        nothingUnlocked = data.nothingUnlocked === true || data.uiStyle === 'nothing';
        applyUnlock();
        animationsEnabled.checked = data.animations !== false;
        pfpEnabled.checked = data.showPfp !== false;
        ttAccentEnabled.checked = data.ttAccent === true;
        brandAisEnabled.checked = data.brandAis === true;
        const linkColor = data.linkColor || '#7a1030';
        const forcedTheme = data.forcedTheme || '';
        const schedule = Object.assign({ enabled: false, start: '22:00', end: '06:00' }, data.schedule || {});
        manualTheme = data.theme || 'light';

        scheduleEnabled.checked = schedule.enabled;
        scheduleStart.value = schedule.start;
        scheduleEnd.value = schedule.end;

        savedLink = linkColor;
        paintAccent();
        buildThemeGrid(forcedTheme);
        setPopupPreset(forcedTheme);
        // Stored under `uiLanguage`, not the old `language` key: that one was
        // also written by UIS flag clicks (removed UA/RU feature), so it could
        // hold a pick the user never made here and pin the wrong language.
        // Anything not offered any more falls back to Auto.
        applyLanguage(BetterAisI18n.LANGUAGES.includes(data.uiLanguage) ? data.uiLanguage : 'auto');

        colorOptions.forEach(option => {
            option.classList.toggle('selected', option.dataset.color === linkColor);
        });

        setStyle(data.uiStyle || 'default');
    });

    // Picking a preset overrides colors regardless of the Theme/Accent
    // color cards above; picking a Theme/Accent option below clears any
    // active preset so the manual choice visibly takes effect instead of
    // silently doing nothing.
    themeGrid.addEventListener('click', function (event) {
        const chip = event.target.closest('.theme-chip');
        if (!chip) return;
        const forcedTheme = chip.dataset.slug;

        chrome.storage.local.set({ forcedTheme });
        setActiveThemeChip(forcedTheme);
        setPopupPreset(forcedTheme);
        notifyContentScript({ forcedTheme });
    });

    // Handle theme toggle
    themeButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const theme = this.dataset.theme;

            manualTheme = theme;
            chrome.storage.local.set({ theme, forcedTheme: '' });
            setPopupPreset('');
            setPopupTheme(theme);
            setThemeButtons(theme);
            setActiveThemeChip('');

            notifyContentScript({ theme, forcedTheme: '' });
        });
    });

    // Interface style (content.js -> html[data-ui], nothing.css); the popup
    // previews it on itself too
    const styleButtons = document.querySelectorAll('#styleSwitch button');

    brandAisEnabled.addEventListener('change', function () {
        const brandAis = this.checked;
        chrome.storage.local.set({ brandAis });
        notifyContentScript({ brandAis });
    });

    pfpEnabled.addEventListener('change', function () {
        const showPfp = this.checked;
        chrome.storage.local.set({ showPfp });
        notifyContentScript({ showPfp });
    });

    ttAccentEnabled.addEventListener('change', function () {
        const ttAccent = this.checked;
        chrome.storage.local.set({ ttAccent });
        notifyContentScript({ ttAccent });
    });

    animationsEnabled.addEventListener('change', function () {
        const animations = this.checked;
        chrome.storage.local.set({ animations });
        notifyContentScript({ animations });
    });

    // Nothing is a hidden style: 10 quick clicks on the "BetterAis" name
    // (each within CLICK_GAP of the last) unlock it, the same again hides it -
    // switching back to the default style if Nothing was active.
    const styleSwitch = document.getElementById('styleSwitch');
    const brandName = document.querySelector('.brand-name');
    const brandToast = document.getElementById('brandToast');
    const UNLOCK_CLICKS = 10;
    const CLICK_GAP = 500;
    let nothingUnlocked = false;
    let clickCount = 0;
    let lastClick = 0;
    let toastTimer = 0;

    function applyUnlock() {
        styleSwitch.hidden = !nothingUnlocked;
    }

    function toast(key) {
        brandToast.textContent = t(key);
        brandToast.classList.add('is-on');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => brandToast.classList.remove('is-on'), 2200);
    }

    brandName.addEventListener('click', function () {
        const now = Date.now();
        clickCount = now - lastClick <= CLICK_GAP ? clickCount + 1 : 1;
        lastClick = now;
        if (clickCount < UNLOCK_CLICKS) return;
        clickCount = 0;
        nothingUnlocked = !nothingUnlocked;
        chrome.storage.local.set({ nothingUnlocked });
        applyUnlock();
        if (!nothingUnlocked && currentStyle === 'nothing') {
            chrome.storage.local.set({ uiStyle: 'default' });
            setStyle('default');
            notifyContentScript({ uiStyle: 'default' });
        }
        toast(nothingUnlocked ? 'nothingUnlocked' : 'nothingLocked');
    });

    function setStyle(uiStyle) {
        currentStyle = uiStyle;
        const locked = uiStyle === 'nothing';
        colorGrid.classList.toggle('locked', locked);
        accentHint.textContent = locked ? t('accentLocked') : '';
        paintAccent();
        if (uiStyle === 'nothing') document.body.setAttribute('data-ui', 'nothing');
        else document.body.removeAttribute('data-ui');
        styleButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.uiStyle === uiStyle);
        });
    }

    styleButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const uiStyle = this.dataset.uiStyle;
            chrome.storage.local.set({ uiStyle });
            setStyle(uiStyle);
            notifyContentScript({ uiStyle });
        });
    });

    languageButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const language = this.dataset.lang;
            chrome.storage.local.set({ uiLanguage: language });
            applyLanguage(language);
            setLangMenu(false);
        });
    });

    scheduleEnabled.addEventListener('change', saveSchedule);
    scheduleStart.addEventListener('change', saveSchedule);
    scheduleEnd.addEventListener('change', saveSchedule);

    // Handle color selection
    colorOptions.forEach(option => {
        option.addEventListener('click', function () {
            const linkColor = this.dataset.color;

            chrome.storage.local.set({ linkColor, forcedTheme: '' });
            savedLink = linkColor;
            setPopupPreset('');
            paintAccent();
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            setActiveThemeChip('');

            notifyContentScript({ linkColor, forcedTheme: '' });
        });
    });

    // Credits & licenses page bundled with the extension (licenses.html)
    document.getElementById('creditsLink').addEventListener('click', function () {
        chrome.tabs.create({ url: chrome.runtime.getURL('licenses.html') });
    });

    // Apply & reload: reload the whole extension (re-reads every file from
    // disk - a tab reload alone kept running the old CSS/scripts) and then
    // hard-reload the current tab. chrome.runtime.reload() kills this popup
    // at once, so the tab is noted first and background.js, starting with
    // the reloaded extension, does the tab reload.
    // Fallbacks for browsers where that chain breaks (macOS Safari has no
    // runtime.reload; some builds don't report the popup's "current window"):
    // the tab is looked up in the last focused window too, and if the popup
    // is still alive shortly after asking for the extension reload, the tab
    // is reloaded straight from here.
    function reloadTabDirectly(tabId) {
        if (tabId === undefined) return;
        chrome.storage.local.remove('pendingReloadTab', function () {
            chrome.tabs.reload(tabId, { bypassCache: true }, function () {
                window.close();
            });
        });
    }

    reloadButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
            const tab = (tabs || []).find(function (t) { return t && t.id !== undefined; });
            const tabId = tab ? tab.id : undefined;
            chrome.storage.local.set({ pendingReloadTab: tabId }, function () {
                try {
                    chrome.runtime.reload();
                } catch (_) {
                    reloadTabDirectly(tabId);
                    return;
                }
                // still here = the extension didn't restart: reload the tab
                setTimeout(function () { reloadTabDirectly(tabId); }, 400);
            });
        });
    });
});
