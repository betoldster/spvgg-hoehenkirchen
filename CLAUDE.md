# SpVgg Höhenkirchen — Fußballabteilung Website

## Projekt-Übersicht

| | |
|---|---|
| **Verein** | SpVgg Höhenkirchen (Spielvereinigung) — Mehrspartenverein |
| **Gegründet** | 22. September 1945 (32 Gründungsmitglieder, beim Hauserwirt) |
| **Gesamtmitglieder** | 2000+ (10+ Abteilungen: Fußball, Basketball, Volleyball, Karate, Schach, Tischtennis, Stockschießen, Feldhockey, Bogenschießen, Rad-/Laufsport, Gymnasitk, Sportabzeichen) |
| **Dieses Projekt** | Neue Website der Fußballabteilung |
| **Fußball-Website** | https://www.fussball-hoehenkirchen.de |
| **Vereins-Website** | https://www.spvgg-hoehenkirchen.de |
| **Logo** | `/logo.png` (lokal in `public/logo.png`) |

---

## Design-Vorgaben

### Farben (CSS Custom Properties)

```css
--color-red:     #C8102E;  /* Akzente, Buttons, Siege, Highlights */
--color-black:   #111111;  /* Haupthintergrund */
--color-surface: #181818;  /* Karten, Sektionen */
--color-border:  #242424;  /* Trennlinien */
--color-text:    #F8F8F5;  /* Haupttext */
--color-muted:   #888888;  /* Sekundärtext, Labels */
```

### Typografie

```
Headlines, Navigation, Scores: Barlow Condensed 700–800, uppercase, letter-spacing: 1–2px
Fließtext, Labels, Meta:       Barlow 300–500

Google Fonts Import:
https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@300;400;500&display=swap
```

### Stil-Prinzipien

- **Dark Theme** — schwarzer Hintergrund durchgehend
- **Sportlich & kondensiert** — Barlow Condensed für alle Headlines (wie Bundesliga-Websites)
- **Rote Akzente** sparsam: Buttons, Siege, aktive Nav-Links, Sektions-Trennlinie (border-bottom: 2px solid red auf nav)
- **Diagonale Elemente** im Hero (clip-path oder skew) für Dynamik
- **Vereinswappen** in Navigation (38px) + transparent im Hero (opacity: 0.08) als Wasserzeichen
- **Ergebnisse**: Sieg = ROT, Unentschieden = Grau, Niederlage = gedimmt

---

## Tech-Stack

| Komponente | Technologie |
|---|---|
| Framework | Astro 5 (bereits initialisiert, `/init` abgeschlossen) |
| CMS / Admin | Keystatic CMS — Admin-Interface unter `/keystatic` |
| Styling | Vanilla CSS mit CSS Custom Properties (kein Framework) |
| Fonts | Google Fonts: Barlow Condensed + Barlow |
| Bilder | Astro Image (automatisch optimiert) |
| Deployment | Netlify oder Vercel (später, kostenlos) |
| Platform | Linux, Node.js v22+ |
| Dev-Server | `npm run dev` → http://localhost:4321 |

### Keystatic Installation

```bash
npm install @keystatic/core @keystatic/astro
```

In `astro.config.mjs`:
```js
import keystatic from '@keystatic/astro'
export default defineConfig({ integrations: [keystatic()] })
```

Admin erreichbar unter: http://localhost:4321/keystatic

---

## Keystatic Datenstruktur

### Collection: `mannschaften`

```ts
mannschaften: collection({
  label: 'Mannschaften',
  slugField: 'name',
  schema: {
    name:            fields.slug({ name: { label: 'Name' } }),
    kategorie:       fields.select({ label: 'Kategorie', options: [
                       { label: 'Herren', value: 'herren' },
                       { label: 'Senioren', value: 'senioren' },
                       { label: 'Junioren', value: 'junioren' },
                       { label: 'Damen', value: 'damen' },
                     ], defaultValue: 'junioren' }),
    liga:            fields.text({ label: 'Liga' }),
    trainer_name:    fields.text({ label: 'Trainer Name' }),
    trainer_email:   fields.text({ label: 'Trainer E-Mail' }),
    trainer_telefon: fields.text({ label: 'Trainer Telefon' }),
    foto:            fields.image({ label: 'Teamfoto', directory: 'public/images/teams' }),
    beschreibung:    fields.document({ label: 'Beschreibung' }),
    spielplan_url:   fields.url({ label: 'Spielplan URL (fussball.de)' }),
    aktiv:           fields.checkbox({ label: 'Aktiv anzeigen', defaultValue: true }),
  }
})
```

### Collection: `news`

```ts
news: collection({
  label: 'News & Berichte',
  slugField: 'titel',
  schema: {
    titel:     fields.slug({ name: { label: 'Titel' } }),
    datum:     fields.date({ label: 'Datum' }),
    kategorie: fields.select({ label: 'Kategorie', options: [
                 { label: 'Vereinsnews', value: 'verein' },
                 { label: 'Spielbericht', value: 'spielbericht' },
                 { label: 'Jugend', value: 'jugend' },
               ], defaultValue: 'verein' }),
    titelbild: fields.image({ label: 'Titelbild', directory: 'public/images/news' }),
    inhalt:    fields.document({ label: 'Inhalt' }),
    autor:     fields.text({ label: 'Autor' }),
    featured:  fields.checkbox({ label: 'Auf Startseite hervorheben', defaultValue: false }),
  }
})
```

### Singleton: `ansprechpartner`

```ts
ansprechpartner: singleton({
  label: 'Ansprechpartner',
  schema: {
    personen: fields.array(
      fields.object({
        funktion: fields.text({ label: 'Funktion' }),
        name:     fields.text({ label: 'Name' }),
        email:    fields.text({ label: 'E-Mail' }),
        telefon:  fields.text({ label: 'Telefon' }),
        foto:     fields.image({ label: 'Foto', directory: 'public/images/personen' }),
      }),
      { label: 'Personen', itemLabel: (p) => p.fields.name.value }
    )
  }
})
```

### Singleton: `chronik`

```ts
chronik: singleton({
  label: 'Vereinschronik',
  schema: {
    eintraege: fields.array(
      fields.object({
        jahr:      fields.text({ label: 'Jahr / Datum' }),
        ereignis:  fields.text({ label: 'Ereignis' }),
      }),
      { label: 'Chronik-Einträge', itemLabel: (e) => e.fields.jahr.value }
    )
  }
})
```

---

## Sitemap — Neue Struktur

```
/                              → Startseite
/mannschaften                  → Übersicht alle Teams
  /mannschaften/herren         → 1. & 2. Mannschaft
  /mannschaften/senioren       → Senioren A / B / C
  /mannschaften/junioren       → U19 bis U6
  /mannschaften/damen          → Damen & Juniorinnen
  /mannschaften/u5-kiga        → Fußball-Kindergarten
/spielplan                     → Spielplan & Ergebnisse
/news                          → News & Berichte
/verein                        → Über uns
  /verein/ueber-uns            → Geschichte & Chronik ← NEU
  /verein/ansprechpartner      → Kontaktpersonen
  /verein/jugendkonzept        → Jugendkonzept
  /verein/training             → Trainingszeiten (Halle + Platz zusammen)
  /verein/anfahrt              → Anfahrt & Lage
  /verein/beitraege            → Mitgliedsbeiträge
/mitmachen                     → ← NEU
  /mitmachen/mitgliedschaft    → Online-Anmeldeformular
  /mitmachen/jugend            → Jugend anmelden
/sponsoren                     → Sponsoren & Fanshop
/keystatic                     → Admin-Interface (Keystatic)
/impressum
/datenschutz
```

---

## Startseite — Aufbau

```
┌─────────────────────────────────────────────────────┐
│  NAV: Logo (38px) | Mannschaften Spielplan News     │
│       Verein | [Mitglied werden] (rot)              │
├─────────────────────────────────────────────────────┤
│  HERO: "Unser Verein. Unser Spiel."                 │
│        Diagonale rote Linie, Wappen transparent     │
│        [Spielplan] [Zum Verein]                     │
│  ─── STAT-LEISTE (roter Balken) ───────────────── │
│        18+ Teams | 500+ Mitglieder | Seit 22.09.1945│
├─────────────────────────────────────────────────────┤
│  TICKER: Laufband — Ergebnisse · Nächste Spiele     │
├─────────────────────────────────────────────────────┤
│  ERGEBNISSE (3 Karten):                             │
│  Datum · Teams · Score · Liga · Badge SIEG/UNBENT.  │
├─────────────────────────────────────────────────────┤
│  NEWS: [Featured groß links] [Klein 1] [Klein 2]   │
├─────────────────────────────────────────────────────┤
│  MANNSCHAFTEN: 4 Kategoriekarten mit Foto + Liga    │
├─────────────────────────────────────────────────────┤
│  HAUPTSPONSOR-STRIP: Logo (grau→farbig bei Hover)  │
│  „HAUPTSPONSOR | [Logo] · Partner werden →"        │
├─────────────────────────────────────────────────────┤
│  FOOTER: Logo · Links · © 2026 · Datenschutz       │
│          + Link zur Vereinswebsite spvgg-...de      │
└─────────────────────────────────────────────────────┘
```

---

## Vereinschronik (Daten für Keystatic)

| Datum / Jahr | Ereignis |
|---|---|
| vor 1939 | FC Höhenkirchen spielt Fußball in der Region |
| 1939 | FC Höhenkirchen bei Kriegsbeginn aufgelöst |
| **22.09.1945** | **Gründung SpVgg Höhenkirchen — 32 Männer beim Hauserwirt** |
| 1945–1968 | Fußball ist einzige Sportart (außer kurze Berg-/Skiabteilung) |
| Nov. 1968 | Gründung Schach-Abteilung |
| 1971 | Gründung Gymnastik-Abteilung |
| 1972 | Gründung Männerturnen, Stockschießen, Tennis |
| 1970 | Mitgliederzahl: 170 |
| 1976 | Gründung Volleyball · Auflösung Männerturnen |
| 1977 | Gründung Karate-Abteilung |
| 1978 | Meilenstein: 1.000 Mitglieder |
| Juni 1990 | Gründung Tischtennis-Abteilung |
| Jan. 1992 | Gründung Basketball-Abteilung |
| Okt. 1997 | Meilenstein: 2.000 Mitglieder — Großverein Landkreis München |
| 2005 | 60-jähriges Vereinsjubiläum |
| 2022 | Stefan Möhren neuer Vorstand · Karlheinz Neumayer nach langer Ära |

---

## Vollständige Mannschaftsliste (28 Teams)

### Herren & Aktive
| Team | Liga |
|---|---|
| 1. Mannschaft | Kreisklasse |
| 2. Mannschaft | B-Klasse |
| Senioren A | Kreisliga |
| Senioren B | Kreisliga |
| Senioren C | Oberliga |

### Junioren (männlich)
| Team | Jahrgang |
|---|---|
| U19 Junioren | Kreisliga |
| U17 Junioren | JG 2009/10 |
| U15 Junioren I | JG 2011 |
| U15 Junioren II | JG 2011 |
| U14 Junioren | JG 2012 |
| U13 Junioren I | JG 2013 |
| U13 Junioren II | JG 2013 |
| U12 Junioren I | JG 2014 |
| U12 Junioren II | JG 2014 |
| U11 Junioren I | JG 2015 |
| U11 Junioren II | JG 2015 |
| U10 Junioren I | JG 2016 |
| U10 Junioren II | JG 2016 |
| U10 Junioren III | JG 2016 |
| U9 Junioren | JG 2017 |
| U8 Junioren I | JG 2018 |
| U8 Junioren II | JG 2018 |
| U7 Junior*innen | JG 2019 |
| U6 Junior*innen | JG 2020 |
| U5 Fußball-Kindergarten | JG 2021 |

### Damen & Mädchen
| Team | Info |
|---|---|
| Damen 1. Mannschaft | A-Klasse |
| B-Juniorinnen | JG 2008/09/10 |
| D-Juniorinnen | JG 2013/14/15 |

---

## Ansprechpartner Fußballabteilung

| Funktion | Name | E-Mail | Telefon |
|---|---|---|---|
| Abteilungsleiter Fußball | Simon Hauser | s.hauser@fussball-hoehenkirchen.de | 017661265153 |
| Jugendleiter | Andreas Moser | a.moser@fussball-hoehenkirchen.de | 01755820609 |
| Stv. Abteilungsleiter | Stanko Fatic | s.fatic@fussball-hoehenkirchen.de | 01733918533 |
| Stv. Jugendleiter | Sandor Ertl | s.ertl@fussball-hoehenkirchen.de | 01731411481 |
| Teambekleidung | Margit Reisenecker | m.reisnecker@fussball-hoehenkirchen.de | — |
| Seniorenleiter | Stanko Fatic | s.fatic@fussball-hoehenkirchen.de | — |
| Werbung / Sponsoring | Samet Zorlu | s.zorlu@fussball-hoehenkirchen.de | — |

---

## Start-Prompt für Claude Code

Diesen Text in Claude Code eingeben wenn du mit einem neuen Thema anfängst:

```
Lies die CLAUDE.md — dort ist der komplette Kontext für die SpVgg Höhenkirchen Website.
Starte mit Schritt 1: Keystatic CMS installieren und konfigurieren.
Dev-Server: npm run dev → http://localhost:4321
Admin: http://localhost:4321/keystatic
```

---

## Reihenfolge der Umsetzung

| # | Schritt | Status |
|---|---|---|
| 1 | Keystatic installieren | ✅ Fertig |
| 2 | `keystatic.config.ts` anlegen | ✅ Fertig |
| 3 | `astro.config.mjs` — Keystatic Integration | ✅ Fertig |
| 4 | Base Layout (`src/layouts/Base.astro`) | ✅ Fertig |
| 5 | Startseite (`src/pages/index.astro`) | ✅ Fertig |
| 6 | Mannschaftsseiten | ✅ Fertig |
| 7 | News-Seite (Liste + Einzelartikel) | ✅ Fertig |
| 7b | Spielplan-Seite | ✅ Fertig |
| 8 | **Verein-Seiten** — Über uns/Chronik, Ansprechpartner, Training, Anfahrt | ✅ Fertig |
| 9 | Mitmachen — Kontaktformular für Mitgliedschaft | ✅ Fertig |
| 10 | Sponsoren & Fanshop | ✅ Fertig |
| 11 | Impressum / Datenschutz | ✅ Fertig |

---

## Aktueller Stand

### Alle Seiten (vollständig, alle HTTP 200)

| Seite | Datei | Datenquelle |
|---|---|---|
| Startseite | `index.astro` | Keystatic: `startseite`, `spielplan`, `news`, `sponsoren` |
| Spielplan | `spielplan.astro` | Keystatic: `spielplan` |
| Mannschaften Übersicht | `mannschaften/index.astro` | Keystatic: `mannschaften` collection |
| Mannschaften Kategorie | `mannschaften/[kategorie].astro` | Keystatic: `mannschaften` collection |
| News Liste | `news/index.astro` | Keystatic: `news` collection |
| News Artikel | `news/[slug].astro` | Keystatic: `news` collection |
| Über uns & Chronik | `verein/ueber-uns.astro` | Keystatic: `chronik`, `ueber_uns` |
| Ansprechpartner | `verein/ansprechpartner.astro` | Keystatic: `ansprechpartner` |
| Trainingszeiten | `verein/training.astro` | Keystatic: `trainingszeiten` |
| Anfahrt | `verein/anfahrt.astro` | Keystatic: `anfahrt` |
| Mitgliedsbeiträge | `verein/beitraege.astro` | Keystatic: `beitraege` |
| Mitglied werden | `mitmachen/mitgliedschaft.astro` | Keystatic: `beitraege` (Dropdown + Sidebar) |
| Jugend anmelden | `mitmachen/jugend.astro` | Keystatic: `mannschaften`, `beitraege`, `ansprechpartner` |
| Bestätigung | `mitmachen/bestaetigung.astro` | statisch |
| Sponsoren | `sponsoren.astro` | Keystatic: `sponsoren` |
| Impressum | `impressum.astro` | Keystatic: `impressum` |
| Datenschutz | `datenschutz.astro` | statisch |

### Keystatic Collections & Singletons (vollständig)

**Collections:**
- `mannschaften` — 28 Teams (`src/content/mannschaften/{slug}/index.yaml`)
- `news` — Artikel mit `teaser`, `titelbild`, `inhalt` (mdoc), `featured` (`src/content/news/{slug}/`)

**Singletons:**
- `ansprechpartner` — 7 Personen mit Funktion, E-Mail, Telefon, Foto
- `chronik` — 16 Einträge 1939–2022 (Timeline auf Über-uns-Seite)
- `ueber_uns` — Intro-Textabsätze + Kennzahlen (1945, 2000+, 10+, 28+)
- `startseite` — Ticker-Meldungen, Stats-Zahlen (Startseite)
- `spielplan` — Ergebnisse + nächste Spiele (Spielplan-Seite + Startseite)
- `trainingszeiten` — Platzzeiten (11 Zeilen) + Hallenzeiten (7 Zeilen)
- `beitraege` — 4 Gruppen mit Beitragssätzen (verschachtelter Array)
- `anfahrt` — Adresse + 3 Anfahrtsoptionen
- `sponsoren` — Sponsor-Gruppen mit Firmen/Logos (zuerst) + Pakete (Partner/Gold/Hauptsponsor); Hauptsponsor (klasse=premium, erste Firma) erscheint auch als Strip auf der Startseite
- `impressum` — Vereinsregister-Nr., Vorstand, Abteilungsleiter, E-Mail, Website, Adresse

Alle YAML-Dateien liegen in `src/content/singletons/`.

### Wichtige technische Details

**Keystatic Pfad-Format** (kritisch!):
- Collection-Pfade MÜSSEN mit `/` enden: `path: 'src/content/news/*/'`
- Ohne `/` → sucht Flat-Files `{slug}.yaml` statt `{slug}/index.yaml`

**Keystatic Reader in Astro-Pages:**
```ts
import { createReader } from '@keystatic/core/reader'
import keystaticConfig from '../../keystatic.config'  // relativer Pfad je nach Tiefe
const reader = createReader(process.cwd(), keystaticConfig)
// Collection:
const items = await reader.collections.mannschaften.all()
// Singleton:
const data = await reader.singletons.spielplan.read()
```
- `fields.slug()` → Wert ist direkt `string` (nicht `{ name: string }`)
- `fields.document()` → muss mit `await entry.feldname()` aufgelöst werden
- `fields.integer()` → verfügbar in Keystatic 0.5.49 ✅

**Astro-Config (`astro.config.mjs`):**
```js
import react from '@astrojs/react'
import keystatic from '@keystatic/astro'
import node from '@astrojs/node'
export default defineConfig({
  adapter: node({ mode: 'middleware' }),
  integrations: [react(), keystatic()],
})
// KEIN output: 'hybrid' — in Astro 6 entfernt
// output: 'static' ist Default; einzelne Seiten können mit `export const prerender = false` auf SSR umschalten
```

**SSR für dynamische Routen (z.B. news/[slug].astro):**
```ts
export const prerender = false
// getStaticPaths() ENTFERNEN — Keystatic-Reader liest Slug direkt aus Astro.params
// Nötig wenn Inhalt zur Laufzeit (via /keystatic Admin) erstellt wird ohne Server-Neustart
// Setzt @astrojs/node Adapter voraus
```

**Redirect-Syntax in Astro:**
```astro
---
return Astro.redirect('/ziel', 301)
---
```
Nicht `import { redirect } from 'astro'` — das führt zu 500.

### Design (CSS Custom Properties — aktuelle Werte)
```css
--color-red:     #C8102E;
--color-black:   #111111;
--color-surface: #1C1C1C;
--color-border:  #2E2E2E;
--color-text:    #EDECEA;
--color-muted:   #ABABAB;
```
- Basis-Schriftgröße: 17px
- Headlines: Barlow Condensed 700–800, uppercase
- Fließtext: Barlow 300–400
- Nav-Logo-Subzeile: „seit 1945"
- Muted-Text (#ABABAB) für kleine Labels — kein Rot auf Schwarz bei kleinen Größen

### Keystatic Admin — Besonderheiten
- Singletons in Website-Reihenfolge: Startseite → Spielplan → Über uns → Chronik → Ansprechpartner → Training → Anfahrt → Beiträge → Sponsoren → Impressum
- `itemLabel` bei allen Arrays so gesetzt, dass relevante Infos direkt sichtbar sind (z.B. `Funktion — Name`, `Datum · Heim X:Y Gast`, `Preis / Zeitraum`)
- Collections haben `columns`-Konfiguration für Listenansicht (z.B. `['kategorie', 'liga', 'aktiv']` bei Mannschaften)
- `sponsoren`-Singleton: Sponsor-Gruppen zuerst, Pakete danach (entspricht Website-Reihenfolge)

### Komponenten
- `src/components/VereinNav.astro` — Sticky Sub-Nav für /verein/* (prop: `active`)
- `src/components/MitmachenNav.astro` — Sticky Sub-Nav für /mitmachen/*
- `src/layouts/Base.astro` — Globales Layout, Nav, Footer, CSS Custom Properties

### Start-Prompt für weitere Änderungen
```
Lies die CLAUDE.md — dort ist der komplette Kontext für die SpVgg Höhenkirchen Website.
Die Website ist vollständig gebaut. Alle Inhalte sind über /keystatic editierbar.
Dev-Server: npm run dev → http://localhost:4321
Admin: http://localhost:4321/keystatic
```

---

## Sicherheit — Admin-Bereich (/keystatic)

### Lösung: Cloudflare Zero Trust Access

Der `/keystatic` Admin-Bereich ist mit Cloudflare Access gesichert.
Funktioniert erst im Live-Betrieb (Netlify/Vercel) — lokal auf localhost
ist kein Schutz aktiv (nur du entwickelst lokal, kein Problem).

### Wie es funktioniert

- Du pflegst eine **Whitelist mit Email-Adressen** in Cloudflare
- Wer `/keystatic` aufruft, muss seine Email eingeben
- Cloudflare schickt einen **Magic Link NUR wenn die Email in der Whitelist steht**
- Fremde Emails bekommen stillschweigend nichts — kein Hinweis, kein Fehler
- Sicherer als Passwort: Email muss in Whitelist UND Person muss
  Zugriff auf das Postfach haben

### Berechtigte Admins (Whitelist)

| Name | Email | Funktion |
|---|---|---|
| Simon Hauser | s.hauser@fussball-hoehenkirchen.de | Abteilungsleiter |
| Andreas Moser | a.moser@fussball-hoehenkirchen.de | Jugendleiter |
| Stanko Fatic | s.fatic@fussball-hoehenkirchen.de | Stv. Abteilungsleiter |
| Sandor Ertl | s.ertl@fussball-hoehenkirchen.de | Stv. Jugendleiter |

### Setup-Schritte (einmalig nach Netlify-Deployment)

1. Kostenlosen Cloudflare-Account erstellen (cloudflare.com)
2. Domain bei Cloudflare eintragen (oder Netlify-Subdomain)
3. Zero Trust → Access → Applications → "Add Application"
4. URL-Pfad: `deinedomain.de/keystatic*` schützen
5. Policy: "Emails" → obige Adressen eintragen
6. Fertig — Cloudflare schützt die Route automatisch

### Nutzer hinzufügen / entfernen

- **Hinzufügen:** Cloudflare Dashboard → Zero Trust → Access →
  Application → Policy → Email eintragen
- **Entfernen:** Email aus der Policy löschen — sofort kein Zugriff mehr

### Kosten

Cloudflare Access ist **kostenlos bis 50 Nutzer** — für den Verein
dauerhaft ausreichend.
```

Direkt in die `CLAUDE.md` einfügen, fertig. Und wenn du später in Claude Code bist:
```
Lies die CLAUDE.md — richte Cloudflare Access für /keystatic ein.
Wir sind auf Netlify deployed.
