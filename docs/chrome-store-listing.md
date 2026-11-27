# Chrome Web Store – listing pre BetterUis

Texty na skopírovanie do Chrome Web Store Developer Dashboard. Slovenčina ako hlavný jazyk, angličtina ako druhý (v Dashboarde: Store listing → pridať jazyk).

---

## Store listing

**Názov:** BetterUis

**Kategória:** Education (alebo Tools)

**Jazyk:** slovenčina (+ English)

### Krátky popis (max. 132 znakov)

SK:
> Neoficiálny moderný vzhľad pre UIS STU (is.stuba.sk): svetlá a tmavá téma, vlastná farba, prehľadné tabuľky a mobilné zobrazenie.

EN:
> Unofficial modern redesign for STU's UIS (is.stuba.sk): light and dark themes, accent colours, cleaner tables and a phone layout.

### Podrobný popis (SK)

Bez vymenúvania názvov tém – zoznam názvov obchod hodnotí ako nadbytočné kľúčové slová (zamietnutie „Yellow Argon“, 26. 11. 2026).

```
BetterUis je neoficiálne rozšírenie, ktoré dáva univerzitnému informačnému systému STU (is.stuba.sk) moderný a prehľadný vzhľad. Funguje len na is.stuba.sk a nič na stránke nemení obsahovo – len to, ako vyzerá.

ČO PRINÁŠA
• Svetlá a tmavá téma, prípadne automatický tmavý režim podľa času
• Vlastná farba zvýraznenia a viac ako desať hotových farebných tém
• Jednotné moderné ikony namiesto starých obrázkov
• Prehľadné tabuľky: rozvrh ako týždenný prehľad, dochádzka ako karty, prehľadnejšia pošta, štúdium a odovzdávanie prác
• Mobilné zobrazenie: karty namiesto širokých tabuliek, menu so záložkami, nič nepreteká mimo obrazovky
• Štýl „Nothing“ – alternatívny minimalistický vzhľad
• Rýchle nastavenia v okne rozšírenia: téma, farba, jazyk (SK / CZ / EN alebo automaticky podľa stránky), animácie

SÚKROMIE
BetterUis nezbiera ani neodosiela žiadne osobné údaje. Nastavenia sa ukladajú len vo vašom prehliadači. Rozšírenie nečíta ani neukladá vaše známky, správy ani iný obsah.

Toto rozšírenie nie je oficiálnym produktom Slovenskej technickej univerzity v Bratislave ani dodávateľa informačného systému.

Zdrojový kód: https://github.com/greenythebeany/BetterUis
```

### Podrobný popis (EN)

```
BetterUis is an unofficial extension that gives STU's university information system (is.stuba.sk) a modern, clean look. It runs only on is.stuba.sk and changes nothing about the content – only how it looks.

FEATURES
• Light and dark themes, or an automatic dark mode by time of day
• Your own accent colour and more than ten ready-made colour themes
• One consistent set of modern icons instead of the old images
• Cleaner tables: the timetable as a week view, attendance as cards, and clearer mail, study and submission pages
• Phone layout: cards instead of wide tables, a tab menu, nothing running off the screen
• "Nothing" style – an alternative minimal look
• Quick settings in the extension popup: theme, colour, language (SK / CZ / EN or automatic from the page), animations

PRIVACY
BetterUis does not collect or send any personal data. Settings are stored only in your browser. The extension does not read or store your grades, messages or any other content.

This extension is not an official product of the Slovak University of Technology in Bratislava or of the information system's vendor.

Source code: https://github.com/greenythebeany/BetterUis
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
> https://github.com/greenythebeany/BetterUis/blob/main/PRIVACY.md

---

## Distribution

- **Visibility:** Public (alebo najprv Unlisted na otestovanie – kto má odkaz, ten si to nainštaluje)
- **Regions:** All regions (alebo len Slovensko a Česko)
- **Cena:** zadarmo

## Pred odoslaním

1. Účet v Chrome Web Store Developer Dashboard (jednorazový poplatok 5 USD) a overený e-mail.
2. Nahrať `BetterUis-5.0.0-chrome-store.zip` (manifest v koreni ZIP-u).
3. Do listingu nedávať logo STU ani tvrdiť, že ide o oficiálne rozšírenie – môže to viesť k zamietnutiu (impersonation/trademark).
4. Kontrola zvyčajne trvá niekoľko dní, niekedy pár týždňov.
