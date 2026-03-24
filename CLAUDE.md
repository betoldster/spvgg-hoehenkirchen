# SpVgg Höhenkirchen — Fußballabteilung Website

## Projekt-Übersicht

| | |
|---|---|
| **Verein** | SpVgg Höhenkirchen (Spielvereinigung) — Mehrspartenverein |
| **Gegründet** | 22. September 1945 (32 Gründungsmitglieder, beim Hauserwirt) |
| **Gesamtmitglieder** | 2000+ (10+ Abteilungen: Fußball, Basketball, Volleyball, Karate, Schach, Tischtennis, Stockschießen, Feldhockey, Bogenschießen, Rad-/Laufsport, Gymnastik, Sportabzeichen) |
| **Dieses Projekt** | Neue Website der Fußballabteilung |
| **Fußball-Website** | https://www.fussball-hoehenkirchen.de |
| **Vereins-Website** | https://www.spvgg-hoehenkirchen.de |
| **Logo** | `/logo.png` (lokal in `public/logo.png`) |

---

## Tech-Stack

| Komponente | Technologie |
|---|---|
| Framework | Astro 6 |
| CMS / Admin | **Decap CMS v3** (Netlify CMS Fork) — Admin unter `/admin/` |
| Content-Reader | `src/lib/content.ts` — liest YAML direkt (kein CMS-SDK) |
| Styling | Vanilla CSS mit CSS Custom Properties (kein Framework) |
| Fonts | Google Fonts: Barlow Condensed + Barlow |
| Deployment | Netlify (live) |
| Platform | Linux, Node.js v22+ |
| Dev-Server | `npm run dev` → http://localhost:4321 |

---

## Design-Vorgaben

### Farben (CSS Custom Properties)

```css
--color-red:     #C8102E;  /* Akzente, Buttons, Siege, Highlights */
--color-black:   #111111;  /* Haupthintergrund */
--color-surface: #1C1C1C;  /* Karten, Sektionen */
--color-border:  #2E2E2E;  /* Trennlinien */
--color-text:    #EDECEA;  /* Haupttext */
--color-muted:   #ABABAB;  /* Sekundärtext, Labels */
```

### Typografie

```
Headlines, Navigation, Scores: Barlow Condensed 700–800, uppercase, letter-spacing: 1–2px
Fließtext, Labels, Meta:       Barlow 300–500
Basis-Schriftgröße: 17px
```

### Stil-Prinzipien

- **Dark Theme** — schwarzer Hintergrund durchgehend
- **Sportlich & kondensiert** — Barlow Condensed für alle Headlines
- **Rote Akzente** sparsam: Buttons, Siege, aktive Nav-Links
- **Vereinswappen** in Navigation (38px) + transparent im Hero (opacity: 0.08)
- **Ergebnisse**: Sieg = ROT, Unentschieden = Grau, Niederlage = gedimmt

---

## Decap CMS — Funktionsweise & Workflow

### Wie es funktioniert

- **Admin-Interface (live):** https://spvgg-hoehenkirchen.netlify.app/admin/
- **Backend:** git-gateway (Netlify Identity / Netlify Git Gateway)
- **Änderungen committed auf Branch:** `content` (NICHT auf `main`!)
- **Merge-Workflow:** `content` → PR → Merge auf `main` → Netlify baut automatisch → live

### Merge-Workflow (ohne Terminal)

1. `github.com/betoldster/spvgg-hoehenkirchen`
2. Banner „content had recent pushes" → **Compare & pull request**
3. **Merge pull request** → **Confirm merge**
4. Netlify baut → live in ~2 Min

Alternativ direkt: `github.com/betoldster/spvgg-hoehenkirchen/compare/main...content`

### Netlify Branch-Einstellungen

- **Production branch:** `main`
- **Branch deploys:** Deploy only the production branch
- **Deploy Previews:** Don't deploy pull requests

→ Nur `main` baut. Der `content`-Branch löst keinen Deploy aus.

---

## Content-Reader (`src/lib/content.ts`)

Astro-Seiten lesen YAML-Dateien direkt über 4 Hilfsfunktionen:

```ts
readSingleton(name)                          // src/content/singletons/{name}.yaml
readCollection(collection)                   // src/content/{collection}/*/index.yaml
readEntry(collection, slug)                  // einzelner Artikel
readRichText(collection, slug, field, data)  // .mdoc/.md ODER inline YAML-String
```

**Verwendung in Astro-Pages:**
```ts
import { readSingleton, readCollection, readEntry, readRichText } from '../lib/content'

const data = readSingleton('spielplan')       // → gesamtes YAML-Objekt
const teams = readCollection('mannschaften') // → Array von {slug, ...felder}
const article = readEntry('news', slug)      // → {slug, titel, datum, ...}
```

---

## Decap CMS — Bekannte Quirks & Regeln

### ⚠️ `widget: date` funktioniert NICHT in Decap CMS v3
`widget: date` ist in v3 nicht registriert → Fehlermeldung "Kein Bedienelement für Widget 'date'".
**Immer `widget: string` verwenden** mit `hint: "Format: 2026-03-24"`.

### News-Datum (datum-Feld)
- Format: `YYYY-MM-DD` als **String** (z.B. `2026-03-24`)
- Sortierung funktioniert via `localeCompare` auf ISO-Strings ✓
- Anzeige via `new Date(iso).toLocaleDateString('de-DE', ...)` ✓
- **Pflicht:** Datum beim Erstellen eines News-Artikels immer ausfüllen!

### News — Featured-Logik
- Nur der **erste** als `featured: true` markierte Artikel erscheint als große Kachel
- Alle anderen Artikel (auch weitere `featured: true`) landen in der normalen Liste
- Homepage zeigt: 1 Featured groß + nächste 2 Artikel (unabhängig vom featured-Flag)

### News — Inhalt (inhalt-Feld)
- Decap CMS speichert Markdown **inline im index.yaml** als String
- `readRichText()` unterstützt beides: separate `.mdoc`-Datei ODER inline YAML-String
- Das Markdown wird via `marked()` zu HTML gerendert

---

## Decap CMS — Feldnamen (YAML-Struktur)

**Kritisch:** Decap CMS schreibt genau die `name`-Werte aus `config.yml` in die YAML-Dateien.
Die Astro-Seiten lesen diese Felder direkt. Falsche Feldnamen → leere Seiten.

### Singletons — korrekte Feldnamen

| Singleton | Array | Felder |
|---|---|---|
| `trainingszeiten` | `platzzeiten` | `team`, `tag`, `zeit`, `ort` |
| `trainingszeiten` | `hallenzeiten` | `team`, `tag`, `zeit`, `ort` |
| `beitraege` | `gruppen[].eintraege` | `bezeichnung`, `preis`, `zeitraum` |
| `anfahrt` | `optionen` | `titel`, `text`, `icon` |
| `chronik` | `eintraege` | `jahr`, `ereignis`, `meilenstein` (boolean) |
| `spielplan` | `spiele` | `datum`, `uhrzeit`, `mannschaft`, `heim`, `gast`, `ort`, `liga`, `status`, `heimTor`, `gastTor` |
| `ansprechpartner` | `personen` | `funktion`, `name`, `email`, `telefon`, `foto` |

### Collections — korrekte Feldnamen

| Collection | Felder |
|---|---|
| `mannschaften` | `name`, `kategorie`, `liga`, `aktiv`, `foto`, `spielplan_url`, `bfv_widget_id`, `trainer[]` |
| `news` | `titel`, `datum`, `kategorie`, `autor`, `teaser`, `titelbild`, `featured`, `inhalt` |

---

## Wichtige technische Details

**Astro-Config:**
```js
// astro.config.mjs
import netlify from '@astrojs/netlify'
export default defineConfig({
  adapter: netlify(),
  integrations: [react()],  // kein keystatic() mehr
})
// output: 'static' (Default) — einzelne Seiten mit `export const prerender = false` auf SSR
```

**SSR für dynamische Routen:**
```ts
export const prerender = false
// news/[slug].astro und mannschaften/[slug].astro sind SSR
// Statische Seiten werden beim Netlify-Build gerendert (readSingleton/readCollection)
```

**Build-Command (`netlify.toml`):**
```
npm run build && cp -r src/content/. .netlify/v1/functions/ssr/src/content/
```
Die YAML-Dateien werden in die SSR-Funktion kopiert, damit `readEntry` zur Laufzeit funktioniert.

**Redirect-Syntax in Astro:**
```astro
---
return Astro.redirect('/ziel', 301)
---
```

**Beiträge-Tabelle (beitraege.astro):**
- `table-layout: fixed` + explizite Spaltenbreiten (55/25/20%)
- Nötig damit alle Gruppen-Tabellen einheitlich aussehen

**Mannschaften-Reihenfolge:**
- Kategorie-Anzeige: Herren → Damen → Senioren → Junioren (sowohl `/mannschaften` als auch Startseite)

---

## Komponenten & API

### Komponenten
- `src/components/VereinNav.astro` — Sticky Sub-Nav für /verein/* (prop: `active`)
- `src/components/MitmachenNav.astro` — Sticky Sub-Nav für /mitmachen/*
- `src/components/Obfuscate.astro` — Bot-Schutz für E-Mails/Telefonnummern (Base64, JS-Rekonstruktion)
- `src/layouts/Base.astro` — Globales Layout, Nav, Footer, CSS Custom Properties

```astro
<Obfuscate email="name@example.de" label="Name anzeigen" />
<Obfuscate tel="+49123456" />
```
**Wichtig:** Globales `a { color: inherit; text-decoration: none; }` in Base.astro nötig, da JS-generierte `<a>` Tags keine Astro-Scoped-CSS-Attribute erhalten.

### API-Endpunkte
- `src/pages/api/spiele.ts` — GET/POST für das Spielplan-Kanban; liest und schreibt `spielplan.yaml` direkt via `yaml`-Package

### Spielplan-Kanban (`/admin/spiele`)
- Eigenständige Admin-Seite, dunkles Design
- Zwei Spalten: Kommend (blau) | Abgeschlossen (rot)
- Drag & Drop via HTML5 API, Score-Dialog, Auto-Speichern
- **Muss mit Cloudflare Access geschützt werden:** Pfad `/admin/*`

---

## Alle Seiten (vollständig)

| Seite | Datei | Datenquelle |
|---|---|---|
| Startseite | `index.astro` | `startseite`, `spielplan`, `news`, `sponsoren` |
| Spielplan | `spielplan.astro` | `spielplan` (spiele gefiltert nach status) |
| Mannschaften Übersicht | `mannschaften/index.astro` | `mannschaften` collection |
| Mannschaften Kategorie + Team | `mannschaften/[slug].astro` (SSR) | `mannschaften` collection |
| News Liste | `news/index.astro` | `news` collection |
| News Artikel | `news/[slug].astro` (SSR) | `news` collection |
| Über uns & Chronik | `verein/ueber-uns.astro` | `chronik`, `ueber_uns` |
| Ansprechpartner | `verein/ansprechpartner.astro` | `ansprechpartner` |
| Trainingszeiten | `verein/training.astro` | `trainingszeiten` |
| Anfahrt | `verein/anfahrt.astro` | `anfahrt` |
| Mitgliedsbeiträge | `verein/beitraege.astro` | `beitraege` |
| Mitglied werden | `mitmachen/mitgliedschaft.astro` | `beitraege`, `impressum` |
| Jugend anmelden | `mitmachen/jugend.astro` | `mannschaften`, `beitraege`, `ansprechpartner` |
| Bestätigung | `mitmachen/bestaetigung.astro` | statisch |
| Sponsoren | `sponsoren.astro` | `sponsoren` |
| Impressum | `impressum.astro` | `impressum` |
| Datenschutz | `datenschutz.astro` | `impressum` (Email) |
| **Spielplan-Kanban** | `admin/spiele.astro` (SSR) | schreibt `spielplan.yaml` direkt |

### Singletons (`src/content/singletons/`)
`ansprechpartner` · `chronik` · `ueber-uns` · `startseite` · `spielplan` · `trainingszeiten` · `beitraege` · `anfahrt` · `sponsoren` · `impressum`

### Collections (`src/content/`)
- `mannschaften/{slug}/index.yaml` — 28 Teams
- `news/{slug}/index.yaml` + optional `inhalt.mdoc` — News-Artikel

---

## Mannschafts-Einzelseiten (`mannschaften/[slug].astro`)

- SSR (`export const prerender = false`) — dual-mode: Kategorieseiten UND Einzelseiten
- Routing-Logik: `const isKategorie = ['herren','senioren','junioren','damen'].includes(slug)`
- Team-Ansicht: Teamfoto, bis zu 4 Trainer-Kacheln
- Trainer-Platzhalter: SVG-Kreis mit Initialen
- Nur ausgefüllte Trainer-Felder werden angezeigt (`filter auf t.name?.trim()`)
- **BFV-Widget:** Feld `bfv_widget_id` → rendert BFV-Widget unterhalb Trainer. Nur sichtbar wenn ID eingetragen. Weiße Widget-Box.

---

## Deployment

**Live-URL:** https://spvgg-hoehenkirchen.netlify.app

**GitHub Repo:** `betoldster/spvgg-hoehenkirchen` (public)

**Netlify CI/CD:** Push auf `main` → automatischer Build → live in ~2 Min

**Manueller Deploy (Notfall):**
```bash
netlify build && netlify deploy --prod
```
NICHT `--dir=dist` — das deployed nur statische Dateien, nicht die SSR-Funktion!

---

## Aktueller Stand (Stand 24.03.2026)

### Was funktioniert ✅
- Alle Seiten live (HTTP 200)
- SSR-Seiten (mannschaften/[slug], news/[slug]) — YAML in SSR-Bundle
- CI/CD: Push → Netlify baut automatisch
- Decap CMS Admin unter `/admin/` — committed auf `content`-Branch
- Content-Branch-Workflow: Decap → `content` → Merge → `main` → Netlify

### YAML-Dateien mit Testdaten ⚠️ (müssen bereinigt werden)

| Datei | Problem |
|---|---|
| `src/content/singletons/trainingszeiten.yaml` | Enthält Decap-Testeinträge mit alten Feldnamen (mannschaft/uhrzeit/platz). Echte Trainingszeiten fehlen. |
| `src/content/singletons/beitraege.yaml` | Enthält Testpreise (222 €, 333 € etc.) und überflüssige `betrag`-Felder. Echte Beiträge fehlen. |
| `src/content/news/` | Nur Testartikel ohne Datum. Echte News fehlen. |

---

## Nächste Schritte

**Priorität 1 — Echte Daten eintragen (via Decap CMS /admin/):**
1. **Ansprechpartner** — echte E-Mails und Telefonnummern eintragen
2. **Impressum** — korrekten Vorstand, Abteilungsleiter, Kontakt eintragen
3. **Trainingszeiten** — bestehende Testeinträge löschen, echte Zeiten für alle Mannschaften eintragen
4. **Mitgliedsbeiträge** — Testpreise durch echte Beiträge ersetzen (Feld heißt `Betrag`, speichert als `preis`)
5. **News-Artikel schreiben** — Datum ZWINGEND im Format `YYYY-MM-DD` eintragen!

**Priorität 2 — Medien:**
6. Trainer-Fotos hochladen (via Decap → Mannschaft bearbeiten)
7. Mannschaftsfotos hochladen
8. Sponsor-Logos hochladen + echte Sponsoren eintragen
9. **BFV Widget-IDs** eintragen: Für jede Mannschaft die ID eintragen (Format: `016PM7QJH8000000VV0AG80NVUT1FLRU`)

**Priorität 3 — Laufend:**
10. Spielplan aktuell halten über `/admin/spiele` (Kanban-Board)

**Sicherheit:**
11. **Cloudflare Access** für `/admin/*` einrichten (schützt Decap CMS + Spielplan-Kanban)

---

## Sicherheit — Admin-Bereich (/admin)

### Lösung: Cloudflare Zero Trust Access

- Schützt `/admin/*` (Decap CMS + Spielplan-Kanban)
- Whitelist mit E-Mail-Adressen → Magic Link (nur berechtigte Admins)
- Kostenlos bis 50 Nutzer

### Berechtigte Admins

| Name | Email | Funktion |
|---|---|---|
| Simon Hauser | s.hauser@fussball-hoehenkirchen.de | Abteilungsleiter |
| Andreas Moser | a.moser@fussball-hoehenkirchen.de | Jugendleiter |
| Stanko Fatic | s.fatic@fussball-hoehenkirchen.de | Stv. Abteilungsleiter |
| Sandor Ertl | s.ertl@fussball-hoehenkirchen.de | Stv. Jugendleiter |

### Setup-Schritte (einmalig)
1. Cloudflare-Account erstellen
2. Zero Trust → Access → Applications → "Add Application"
3. Pfad `deinedomain.de/admin/*` schützen
4. Policy: "Emails" → obige Adressen eintragen

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

## Vollständige Mannschaftsliste (28 Teams)

### Herren & Aktive
| Team | Liga |
|---|---|
| 1. Mannschaft | Kreisklasse |
| 2. Mannschaft | B-Klasse |
| Senioren A | Kreisliga |
| Senioren B | Kreisliga |
| Senioren C | Oberliga |

### Damen & Mädchen
| Team | Info |
|---|---|
| Damen 1. Mannschaft | A-Klasse |
| B-Juniorinnen | JG 2008/09/10 |
| D-Juniorinnen | JG 2013/14/15 |

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

---

## Vereinschronik (Referenzdaten)

| Datum / Jahr | Ereignis | Meilenstein |
|---|---|---|
| vor 1939 | FC Höhenkirchen spielt Fußball in der Region | |
| 1939 | FC Höhenkirchen bei Kriegsbeginn aufgelöst | |
| **22.09.1945** | **Gründung SpVgg Höhenkirchen — 32 Männer beim Hauserwirt** | ✓ |
| 1945–1968 | Fußball ist einzige Sportart (außer kurze Berg-/Skiabteilung) | |
| Nov. 1968 | Gründung Schach-Abteilung | |
| 1971 | Gründung Gymnastik-Abteilung | |
| 1970 | Mitgliederzahl: 170 | |
| 1972 | Gründung Männerturnen, Stockschießen, Tennis | |
| 1976 | Gründung Volleyball · Auflösung Männerturnen | |
| 1977 | Gründung Karate-Abteilung | |
| 1978 | Meilenstein: 1.000 Mitglieder | ✓ |
| Juni 1990 | Gründung Tischtennis-Abteilung | |
| Jan. 1992 | Gründung Basketball-Abteilung | |
| Okt. 1997 | Meilenstein: 2.000 Mitglieder — Großverein Landkreis München | ✓ |
| 2005 | 60-jähriges Vereinsjubiläum | |
| 2022 | Stefan Möhren neuer Vorstand · Karlheinz Neumayer nach langer Ära | |

---

## Start-Prompt für weitere Änderungen

```
Lies die CLAUDE.md — dort ist der komplette Kontext für die SpVgg Höhenkirchen Website.
Die Website ist live auf https://spvgg-hoehenkirchen.netlify.app
GitHub: betoldster/spvgg-hoehenkirchen (public)
CMS Admin (live): https://spvgg-hoehenkirchen.netlify.app/admin/
Dev-Server: npm run dev → http://localhost:4321
Decap CMS committed auf content-Branch → Merge auf main → Netlify baut.
```
