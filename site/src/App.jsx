import { createContext, useContext, useEffect, useState } from 'react';
import { STORE_LIVE, STORE_URL, RELEASE_URL, ISSUES_URL, INSTALL_GUIDE_URL, REPO_URL } from './config.js';

// ---- language: every string is written as <T sk="…" en="…" /> ------------
const LangContext = createContext('sk');

function T({ sk, en }) {
  return useContext(LangContext) === 'en' ? en : sk;
}

function useLang() {
  return useContext(LangContext);
}

function readStored(key) {
  try {
    return localStorage.getItem(key);
  } catch (_) {
    return null;
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (_) {
    // private mode - the choice just isn't remembered
  }
}

function initialLang() {
  const saved = readStored('bu-lang');
  if (saved === 'sk' || saved === 'en') return saved;
  return /^(sk|cs)/i.test(navigator.language || '') ? 'sk' : 'en';
}

// ---- small pieces ----------------------------------------------------------
function Icon({ name }) {
  const paths = {
    moon: <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z" />,
    palette: (
      <>
        <path d="M12 2.5a9.5 9.5 0 0 0 0 19c1.3 0 1.8-1 1.3-2-.5-1.1-.1-2.3 1.3-2.3h2.2a4.2 4.2 0 0 0 4.2-4.2C21 6.9 17 2.5 12 2.5z" />
        <circle cx="7.6" cy="10.5" r="1.5" fill="var(--accent)" />
        <circle cx="10.5" cy="6.8" r="1.5" fill="var(--accent)" />
        <circle cx="15" cy="7.2" r="1.5" fill="var(--accent)" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4.5" width="18" height="16.5" rx="3" />
        <path d="M3 9.5h18" stroke="var(--accent)" strokeWidth="1.6" />
        <rect x="7" y="2.5" width="2" height="4" rx="1" />
        <rect x="15" y="2.5" width="2" height="4" rx="1" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="8" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
        <rect x="13" y="13" width="8" height="8" rx="2" />
      </>
    ),
    phone: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="3" />
        <rect x="10" y="17.5" width="4" height="1.6" rx=".8" fill="var(--accent)" />
      </>
    ),
    shield: <path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z" />,
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function StoreButton({ className = 'btn btn-primary' }) {
  if (!STORE_LIVE) {
    return (
      <span className={`${className} is-pending`} aria-disabled="true">
        <ChromeMark />
        <T sk="Čoskoro v Chrome Web Store" en="Coming soon to the Chrome Web Store" />
      </span>
    );
  }
  return (
    <a className={className} href={STORE_URL}>
      <ChromeMark />
      <T sk="Pridať do Chrome" en="Add to Chrome" />
    </a>
  );
}

function ChromeMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <circle cx="12" cy="12" r="4" fill="var(--accent)" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// ---- sections ----------------------------------------------------------------
function TopBar({ lang, setLang, theme, setTheme }) {
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <a className="brand" href="#top" aria-label="BetterUis">
          <img src="/assets/icon128.png" alt="" width="32" height="32" />
          <span>BetterUis</span>
        </a>
        <nav className="topnav" aria-label={lang === 'en' ? 'Sections' : 'Sekcie'}>
          <a href="#ukazka"><T sk="Pred a po" en="Before & after" /></a>
          <a href="#funkcie"><T sk="Funkcie" en="Features" /></a>
          <a href="#instalacia"><T sk="Inštalácia" en="Install" /></a>
          <a href="#faq"><T sk="Otázky" en="FAQ" /></a>
        </nav>
        <div className="topbar-tools">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setLang(lang === 'en' ? 'sk' : 'en')}
            aria-label={lang === 'en' ? 'Prepnúť do slovenčiny' : 'Switch to English'}
          >
            {lang === 'en' ? 'SK' : 'EN'}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={lang === 'en' ? 'Toggle light / dark theme' : 'Prepnúť svetlú / tmavú tému'}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="stroke">
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="stroke">
                <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const lang = useLang();
  return (
    <section className="hero">
      <div className="wrap hero-inner">
        <div className="hero-text">
          <p className="eyebrow"><T sk="Rozšírenie prehliadača pre is.stuba.sk" en="Browser extension for is.stuba.sk" /></p>
          <h1><T sk="Informačný systém STU, konečne moderný." en="The STU information system, finally modern." /></h1>
          <p className="lead">
            <T
              sk="BetterUis prekreslí AIS do čistého, súčasného dizajnu – svetlá a tmavá téma, vlastná farba, prehľadné tabuľky a rozloženie, ktoré funguje aj na mobile. Mení len to, ako stránky vyzerajú."
              en="BetterUis redraws AIS in a clean, current design – light and dark themes, your own accent colour, readable tables and a layout that works on a phone. It only changes how the pages look."
            />
          </p>
          <div className="cta">
            <StoreButton />
            <a className="btn btn-ghost" href={RELEASE_URL}><T sk="Stiahnuť z GitHubu" en="Download from GitHub" /></a>
          </div>
          <p className="small muted">
            <T
              sk="Zadarmo a s otvoreným kódom. Chrome, Brave, Edge, Opera, Vivaldi aj Firefox."
              en="Free and open source. Chrome, Brave, Edge, Opera, Vivaldi and Firefox."
            />
          </p>
        </div>
        <div className="hero-shot">
          <img
            src="/assets/home-after.webp"
            alt={lang === 'en' ? 'The AIS home page with BetterUis' : 'Domovská stránka AIS s rozšírením BetterUis'}
            width="2984"
            height="1624"
          />
        </div>
      </div>
    </section>
  );
}

const SHOTS = [
  { id: 'home', sk: 'Domov', en: 'Home' },
  { id: 'portal', sk: 'Portál študenta', en: 'Student portal' },
  { id: 'timetable', sk: 'Rozvrh', en: 'Timetable' },
  { id: 'attendance', sk: 'Dochádzka', en: 'Attendance' },
  { id: 'public', sk: 'Verejná časť', en: 'Public pages' },
];

function BeforeAfter() {
  const lang = useLang();
  const [shot, setShot] = useState('home');
  const [pos, setPos] = useState(50);
  return (
    <section className="section" id="ukazka">
      <div className="wrap">
        <h2><T sk="Pred a po" en="Before and after" /></h2>
        <p className="section-lead">
          <T sk="Potiahni posúvač a porovnaj pôvodnú stránku s BetterUis." en="Drag the handle to compare the original site with BetterUis." />
        </p>
        <div className="tabs" role="tablist">
          {SHOTS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={shot === s.id}
              className={`tab${shot === s.id ? ' is-active' : ''}`}
              onClick={() => setShot(s.id)}
            >
              {lang === 'en' ? s.en : s.sk}
            </button>
          ))}
        </div>
        <div className="compare" style={{ '--pos': `${pos}%` }}>
          <img className="compare-after" src={`/assets/${shot}-after.webp`} alt={lang === 'en' ? 'After – with BetterUis' : 'Po – s BetterUis'} width="2984" height="1624" />
          <div className="compare-before-wrap">
            <img className="compare-before" src={`/assets/${shot}-before.webp`} alt={lang === 'en' ? 'Before – the original AIS' : 'Pred – pôvodný AIS'} width="2984" height="1624" />
          </div>
          <span className="compare-label is-before"><T sk="Pred" en="Before" /></span>
          <span className="compare-label is-after"><T sk="Po" en="After" /></span>
          <div className="compare-handle" aria-hidden="true">
            <span>
              <svg viewBox="0 0 24 24">
                <path d="M9.5 7l-5 5 5 5M14.5 7l5 5-5 5" />
              </svg>
            </span>
          </div>
          <input
            className="compare-range"
            type="range"
            min="0"
            max="100"
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label={lang === 'en' ? 'Compare before and after' : 'Porovnanie pred a po'}
          />
        </div>
      </div>
    </section>
  );
}

// the extension's own accent palette (popup.html)
const ACCENTS = ['#7a1030', '#dc2626', '#f97316', '#ca8a04', '#65a30d', '#22c55e', '#0d9488', '#06b6d4', '#4a90e2', '#1e40af', '#6366f1', '#a855f7', '#ec4899', '#92400e', '#475569'];

function Features({ accent, setAccent }) {
  const lang = useLang();
  const items = [
    { icon: 'moon', sk: ['Svetlá aj tmavá', 'Vyber si tému, alebo nech sa tmavý režim zapne večer sám.'], en: ['Light and dark', 'Pick a theme, or let dark mode switch on in the evening by itself.'] },
    { icon: 'palette', sk: ['Tvoja farba', 'Farba zvýraznenia podľa teba a viac ako desať hotových farebných tém. Vyskúšaj:'], en: ['Your colour', 'An accent colour of your choice and over ten ready-made colour themes. Try it:'], swatches: true },
    { icon: 'calendar', sk: ['Čitateľný rozvrh', 'Skutočný týždenný prehľad s každou hodinou na svojom mieste – a na mobile po dňoch.'], en: ['Readable timetable', 'A real week view with every class at its time – and a day-by-day agenda on the phone.'] },
    { icon: 'grid', sk: ['Prehľadné tabuľky', 'Dochádzka ako karty, upratanejšia pošta, štúdium a odovzdávanie prác, ktoré dávajú zmysel.'], en: ['Clear tables', 'Attendance as cards, a tidier mailbox, study and submission pages that make sense.'] },
    { icon: 'phone', sk: ['Funguje na mobile', 'Karty namiesto širokých tabuliek, menu so záložkami, nič nepreteká mimo obrazovky.'], en: ['Works on a phone', 'Cards instead of wide tables, a tab menu, nothing running off the screen.'] },
    { icon: 'shield', sk: ['Súkromné', 'Žiadne sledovanie, žiadne zbieranie údajov. Nastavenia ostávajú v tvojom prehliadači.'], en: ['Private', 'No tracking, no data collected. Settings stay in your browser.'] },
  ];
  return (
    <section className="section section-alt" id="funkcie">
      <div className="wrap">
        <h2><T sk="Čo prináša" en="What it does" /></h2>
        <div className="features">
          {items.map((item) => {
            const [title, text] = lang === 'en' ? item.en : item.sk;
            return (
              <article className="feature" key={item.icon}>
                <div className="feature-icon"><Icon name={item.icon} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
                {item.swatches && (
                  <div className="swatches">
                    {ACCENTS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`swatch${accent === c ? ' is-active' : ''}`}
                        style={{ '--c': c }}
                        onClick={() => setAccent(c)}
                        aria-label={c}
                        aria-pressed={accent === c}
                      />
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Install() {
  return (
    <section className="section" id="instalacia">
      <div className="wrap">
        <h2><T sk="Inštalácia" en="Install" /></h2>
        <div className="install">
          <article className="install-card">
            <span className="badge"><T sk="Odporúčané" en="Recommended" /></span>
            <h3>Chrome, Brave, Edge, Opera, Vivaldi</h3>
            <ol>
              <li><T sk="Otvor BetterUis v Chrome Web Store." en="Open BetterUis in the Chrome Web Store." /></li>
              <li><T sk="Klikni na „Pridať do prehliadača Chrome“." en="Click “Add to Chrome”." /></li>
              <li><T sk="Pripni si ho na lištu a otvor is.stuba.sk." en="Pin it in the toolbar and open is.stuba.sk." /></li>
            </ol>
            {STORE_LIVE ? (
              <a className="text-link" href={STORE_URL}><T sk="Otvoriť v Chrome Web Store →" en="Open in the Chrome Web Store →" /></a>
            ) : (
              <p className="small muted">
                <T
                  sk="Aktualizácie prídu samé. Kým obchod položku neschváli, použi ručnú inštaláciu vedľa."
                  en="Updates arrive automatically. Until the store listing is approved, use the manual install next to this."
                />
              </p>
            )}
          </article>
          <article className="install-card">
            <h3><T sk="Ručná inštalácia (Chromium)" en="Manual install (Chromium)" /></h3>
            <ol>
              <li><T sk="Stiahni najnovší ZIP z GitHubu a rozbaľ ho." en="Download the latest ZIP from GitHub and unzip it." /></li>
              <li><T sk="Otvor chrome://extensions a zapni Režim pre vývojárov." en="Open chrome://extensions and turn on Developer mode." /></li>
              <li><T sk="Klikni „Načítať rozbalené“ a vyber priečinok BetterUis." en="Click “Load unpacked” and pick the BetterUis folder." /></li>
            </ol>
            <a className="text-link" href={RELEASE_URL}><T sk="Najnovšia verzia →" en="Latest release →" /></a>
          </article>
          <article className="install-card">
            <h3>Firefox</h3>
            <p>
              <T
                sk="Firefox (počítač aj Android) sa inštaluje z repozitára – návod má všetky kroky vrátane nástroja, ktorý ho načíta pri každom spustení."
                en="Firefox (desktop and Android) installs from the repository – the guide has every step, including a tool that loads it on every start."
              />
            </p>
            <a className="text-link" href={INSTALL_GUIDE_URL}><T sk="Návod na inštaláciu →" en="Installation guide →" /></a>
          </article>
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  {
    sk: ['Je to oficiálny produkt STU?', 'Nie. BetterUis je neoficiálny, nezávislý projekt študenta. Nevytvorila ho STU ani dodávateľ informačného systému a nie je s nimi spojený.'],
    en: ['Is this an official STU product?', "No. BetterUis is an unofficial, independent project by a student. It is not made by or affiliated with STU or the information system's vendor."],
  },
  {
    sk: ['Vidí moje známky alebo správy?', 'Stránky upravuje priamo v tvojom prehliadači, ale nič neukladá ani nikam neposiela. Žiadne sledovanie, žiadne zbieranie údajov.'],
    en: ['Does it see my grades or messages?', 'It restyles the pages inside your browser, but nothing is saved or sent anywhere. There is no tracking and no data collection.'],
  },
  {
    sk: ['Môže na AIS niečo pokaziť?', 'Mení len vzhľad – každý formulár, tlačidlo a odkaz robí to isté ako predtým. Ak by niečo vyzeralo zle, vypni rozšírenie a pôvodná stránka je späť.'],
    en: ['Can it break something on AIS?', 'It only changes how pages look – every form, button and link still does what the site does. If something ever looks off, switch the extension off and the original site is back.'],
  },
  {
    sk: ['Funguje na mobile?', 'Áno, vo Firefoxe pre Android, ktorý vie spúšťať rozšírenia. Chrome ani Safari na mobile rozšírenia nepodporujú.'],
    en: ['Does it work on a phone?', "Yes, in Firefox for Android, which can run extensions. Chrome and Safari on phones can't run extensions at all."],
  },
];

function Faq() {
  const lang = useLang();
  return (
    <section className="section section-alt" id="faq">
      <div className="wrap narrow">
        <h2><T sk="Otázky" en="Questions" /></h2>
        {FAQ.map((item) => {
          const [q, a] = lang === 'en' ? item.en : item.sk;
          return (
            <details key={item.en[0]}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          );
        })}
        <details>
          <summary><T sk="Niečo vyzerá zle – kde to nahlásim?" en="Something looks wrong – where do I report it?" /></summary>
          <p>
            <T sk="Založ issue na GitHube aj so snímkou obrazovky: " en="Open an issue on GitHub with a screenshot: " />
            <a href={ISSUES_URL}>github.com/greenythebeany/BetterUis/issues</a>
          </p>
        </details>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <p className="muted small">
          <T
            sk="BetterUis je neoficiálny a nie je spojený so Slovenskou technickou univerzitou v Bratislave."
            en="BetterUis is unofficial and not affiliated with the Slovak University of Technology in Bratislava."
          />
        </p>
        <nav className="footer-links">
          <a href={REPO_URL}>GitHub</a>
          <a href="/privacy.html"><T sk="Súkromie" en="Privacy" /></a>
          <a href={ISSUES_URL}><T sk="Podpora" en="Support" /></a>
        </nav>
      </div>
    </footer>
  );
}

export default function App() {
  const [lang, setLangState] = useState(initialLang);
  const [theme, setThemeState] = useState(() => document.documentElement.dataset.theme || 'light');
  const [accent, setAccent] = useState(ACCENTS[0]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === 'en' ? 'BetterUis – a modern look for STU AIS' : 'BetterUis – moderný vzhľad pre AIS STU';
  }, [lang]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);
  }, [accent]);

  const setLang = (next) => {
    setLangState(next);
    writeStored('bu-lang', next);
  };
  const setTheme = (next) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    writeStored('bu-theme', next);
  };

  return (
    <LangContext.Provider value={lang}>
      <TopBar lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />
      <main id="top">
        <Hero />
        <BeforeAfter />
        <Features accent={accent} setAccent={setAccent} />
        <Install />
        <Faq />
      </main>
      <Footer />
    </LangContext.Provider>
  );
}
