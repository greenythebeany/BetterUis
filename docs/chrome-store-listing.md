# Chrome Web Store – listing pre BetterUis

Texty na skopírovanie do Chrome Web Store Developer Dashboard. Slovenčina ako hlavný jazyk, angličtina ako druhý (v Dashboarde: Store listing → pridať jazyk).

---

## Store listing

**Názov:** BetterUis

**Kategória:** Education (alebo Tools)

**Jazyk:** slovenčina (+ English, čeština). Ďalšie jazyky ponúkne Dashboard vďaka `_locales/` v balíčku (od 5.0.4); krátky popis v obchode = `extDescription` z `_locales/<jazyk>/messages.json`.

### Krátky popis (max. 132 znakov)

SK:
> Moderný vzhľad pre UIS STU (is.stuba.sk): tmavý režim, vlastná farba, prehľadný rozvrh a tabuľky aj na mobile. Zadarmo.

EN:
> A modern look for STU's UIS (is.stuba.sk): dark mode, your own accent colour, a clear timetable and tables that work on a phone.

### Podrobný popis (SK)

Bez vymenúvania názvov tém – zoznam názvov obchod hodnotí ako nadbytočné kľúčové slová (zamietnutie „Yellow Argon“, 26. 11. 2026).

```
BetterUis dáva univerzitnému informačnému systému STU – UIS (predtým AIS), is.stuba.sk – čistý, súčasný vzhľad. Mení len to, ako stránky vyzerajú: všetko funguje presne tak ako doteraz, len sa v tom ľahšie vyznáte.

ČO DOSTANETE
• Tmavý a svetlý režim – aj automaticky podľa času
• Vlastnú farbu zvýraznenia a vyše desať hotových farebných tém
• Jednotné moderné ikony namiesto starých obrázkov
• Rozvrh ako prehľadný týždeň, dochádzku ako karty a prehľadnejšiu poštu, štúdium aj odovzdávanie prác
• Zobrazenie pre mobil: karty namiesto širokých tabuliek, menu so záložkami, nič nepreteká mimo obrazovky
• Alternatívny minimalistický štýl „Nothing“
• Prepínač „Späť na AIS“, ak vám chýba staré logo
• Všetky nastavenia na jedno kliknutie v okne rozšírenia: téma, farba, jazyk (SK / CZ / EN alebo podľa stránky), animácie

SÚKROMIE
Žiadne sledovanie, žiadne zbieranie údajov. BetterUis nič neodosiela, vaše známky ani správy nečíta ani neukladá. Nastavenia ostávajú len vo vašom prehliadači.

Zadarmo a s otvoreným kódom. Funguje len na is.stuba.sk.

BetterUis je neoficiálny študentský projekt – nie je produktom Slovenskej technickej univerzity v Bratislave ani dodávateľa informačného systému.

Web: https://betteruis.greenybeany.dev
Zdrojový kód a hlásenie chýb: https://github.com/greenythebeany/BetterUis
```

### Podrobný popis (EN)

```
BetterUis gives STU's university information system – UIS (formerly AIS), is.stuba.sk – a clean, current look. It only changes how the pages look: everything works exactly as before, it's just easier to find your way around.

WHAT YOU GET
• Dark and light mode – or automatic by time of day
• Your own accent colour and more than ten ready-made colour themes
• One consistent set of modern icons instead of the old images
• The timetable as a clear week view, attendance as cards, and cleaner mail, study and submission pages
• A phone layout: cards instead of wide tables, a tab menu, nothing running off the screen
• An alternative minimal "Nothing" style
• A "Back to AIS" switch if you miss the old logo
• Every setting one click away in the extension popup: theme, colour, language (SK / CZ / EN or from the page), animations

PRIVACY
No tracking, no data collection. BetterUis sends nothing anywhere and never reads or stores your grades or messages. Settings stay in your browser.

Free and open source. Runs only on is.stuba.sk.

BetterUis is an unofficial student project – it is not a product of the Slovak University of Technology in Bratislava or of the information system's vendor.

Website: https://betteruis.greenybeany.dev
Source code and bug reports: https://github.com/greenythebeany/BetterUis
```

### Podrobný popis (CS)

```
BetterUis dává univerzitnímu informačnímu systému STU – UIS (dříve AIS), is.stuba.sk – čistý, současný vzhled. Mění jen to, jak stránky vypadají: všechno funguje přesně jako dosud, jen se v tom snáz vyznáte.

CO DOSTANETE
• Tmavý a světlý režim – i automaticky podle času
• Vlastní barvu zvýraznění a přes deset hotových barevných motivů
• Jednotné moderní ikony místo starých obrázků
• Rozvrh jako přehledný týden, docházku jako karty a přehlednější poštu, studium i odevzdávání prací
• Zobrazení pro mobil: karty místo širokých tabulek, menu se záložkami, nic nepřetéká mimo obrazovku
• Alternativní minimalistický styl „Nothing“
• Přepínač „Zpět na AIS“, pokud vám chybí staré logo
• Všechna nastavení na jedno kliknutí v okně rozšíření: motiv, barva, jazyk (SK / CZ / EN nebo podle stránky), animace

SOUKROMÍ
Žádné sledování, žádný sběr údajů. BetterUis nic neodesílá, vaše známky ani zprávy nečte ani neukládá. Nastavení zůstávají jen ve vašem prohlížeči.

Zdarma a s otevřeným kódem. Funguje jen na is.stuba.sk.

BetterUis je neoficiální studentský projekt – není produktem Slovenské technické univerzity v Bratislavě ani dodavatele informačního systému.

Web: https://betteruis.greenybeany.dev
Zdrojový kód a hlášení chyb: https://github.com/greenythebeany/BetterUis
```

### Obrázky

- **Ikona obchodu:** 128×128 – `icons/icon128.png`
- **Snímky obrazovky:** 1280×800 alebo 640×400, 1–5 kusov. Použiť „after“ snímky z `docs/screenshots/` (domovská stránka, Portál študenta, rozvrh, dochádzka), prerobené na 1280×800. Bez skutočného mena a fotky.
- **Malá propagačná dlaždica (voliteľná):** 440×280

---

## Privacy practices

**Single purpose (jediný účel):**
> Restyles the STU university information system (is.stuba.sk): themes, colours, icons and readable table and phone layouts. It only changes how is.stuba.sk pages look.

**Zdôvodnenie oprávnení:**

| Oprávnenie | Zdôvodnenie |
|---|---|
| `storage` | Saves the user's settings (theme, accent colour, language, style toggles) locally. |
| `activeTab` | Lets the popup's "Apply & reload" button reload the current is.stuba.sk tab so new settings take effect. |
| Host `*://is.stuba.sk/*` | The extension's stylesheets and scripts run only on is.stuba.sk – the site it redesigns. |

**Remote code:** No, I am not using remote code. (Všetok JavaScript je v balíčku; z Google Fonts sa načítava len font, nie kód.)

**Data usage:** nezaškrtnúť nič – rozšírenie nezbiera žiadne kategórie údajov. Potom potvrdiť všetky tri vyhlásenia:
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:**
> https://betteruis.greenybeany.dev/privacy

---

## Distribution

- **Visibility:** Public (alebo najprv Unlisted na otestovanie – kto má odkaz, ten si to nainštaluje)
- **Regions:** All regions (alebo len Slovensko a Česko)
- **Cena:** zadarmo

## Pred odoslaním

1. Účet v Chrome Web Store Developer Dashboard (jednorazový poplatok 5 USD) a overený e-mail.
2. Nahrať `BetterUis-5.0.4-chrome-store.zip` (manifest v koreni ZIP-u).
3. Do listingu nedávať logo STU ani tvrdiť, že ide o oficiálne rozšírenie – môže to viesť k zamietnutiu (impersonation/trademark).
4. Kontrola zvyčajne trvá niekoľko dní, niekedy pár týždňov.
