import { config, collection, singleton, fields } from '@keystatic/core'

export default config({
  storage: process.env.NODE_ENV !== 'production'
    ? { kind: 'local' }
    : {
        kind: 'github',
        repo: { owner: 'betoldster', name: 'spvgg-hoehenkirchen' },
      },

  collections: {

    // ── Mannschaften (/mannschaften) ─────────────────────────────────────────
    mannschaften: collection({
      label: 'Mannschaften',
      slugField: 'name',
      path: 'src/content/mannschaften/*/',
      columns: ['kategorie', 'liga', 'aktiv'],
      schema: {
        name:            fields.slug({ name: { label: 'Name' } }),
        kategorie:       fields.select({
                           label: 'Kategorie',
                           options: [
                             { label: 'Herren', value: 'herren' },
                             { label: 'Senioren', value: 'senioren' },
                             { label: 'Junioren', value: 'junioren' },
                             { label: 'Damen', value: 'damen' },
                           ],
                           defaultValue: 'junioren',
                         }),
        liga:         fields.text({ label: 'Liga / Spielklasse' }),
        aktiv:        fields.checkbox({ label: 'Aktiv anzeigen', defaultValue: true }),
        foto:         fields.image({ label: 'Teamfoto', directory: 'public/images/teams', publicPath: '/images/teams' }),
        trainer:      fields.array(
                        fields.object({
                          name:    fields.text({ label: 'Name' }),
                          email:   fields.text({ label: 'E-Mail' }),
                          telefon: fields.text({ label: 'Telefon' }),
                          foto:    fields.image({ label: 'Foto', directory: 'public/images/trainer', publicPath: '/images/trainer' }),
                        }),
                        { label: 'Trainer (max. 4)', itemLabel: (t) => t.fields.name.value || '(unbenannt)' },
                      ),
        spielplan_url: fields.url({ label: 'Spielplan URL (bfv.de)' }),
        bfv_widget_id: fields.text({ label: 'BFV Widget ID (Mannschafts-ID, z.B. 016PM7QJH8000000VV0AG80NVUT1FLRU)' }),
        beschreibung:  fields.document({ label: 'Beschreibung' }),
      },
    }),

    // ── News & Berichte (/news) ───────────────────────────────────────────────
    news: collection({
      label: 'News & Berichte',
      slugField: 'titel',
      path: 'src/content/news/*/',
      columns: ['datum', 'kategorie', 'featured'],
      schema: {
        titel:     fields.slug({ name: { label: 'Titel' } }),
        datum:     fields.date({ label: 'Datum' }),
        kategorie: fields.select({
                     label: 'Kategorie',
                     options: [
                       { label: 'Vereinsnews', value: 'verein' },
                       { label: 'Spielbericht', value: 'spielbericht' },
                       { label: 'Jugend', value: 'jugend' },
                     ],
                     defaultValue: 'verein',
                   }),
        featured:  fields.checkbox({ label: 'Auf Startseite hervorheben', defaultValue: false }),
        autor:     fields.text({ label: 'Autor' }),
        teaser:    fields.text({ label: 'Kurztext (Vorschau auf Startseite & Listenansicht)', multiline: true }),
        titelbild: fields.image({ label: 'Titelbild', directory: 'public/images/news', publicPath: '/images/news' }),
        inhalt:    fields.document({ label: 'Inhalt' }),
      },
    }),
  },

  singletons: {

    // ── Startseite (/) ────────────────────────────────────────────────────────
    startseite: singleton({
      label: 'Startseite',
      path: 'src/content/singletons/startseite',
      schema: {
        ticker: fields.array(
          fields.object({
            text: fields.text({ label: 'Ticker-Meldung' }),
          }),
          { label: 'Ticker-Meldungen (Laufband)', itemLabel: (t) => t.fields.text.value },
        ),
        stats: fields.array(
          fields.object({
            zahl:  fields.text({ label: 'Zahl (z.B. 2000+)' }),
            label: fields.text({ label: 'Bezeichnung (z.B. Mitglieder)' }),
          }),
          { label: 'Kennzahlen (roter Balken)', itemLabel: (s) => `${s.fields.zahl.value} ${s.fields.label.value}` },
        ),
      },
    }),

    // ── Spielplan & Ergebnisse (/spielplan) ───────────────────────────────────
    spielplan: singleton({
      label: 'Spielplan & Ergebnisse',
      path: 'src/content/singletons/spielplan',
      schema: {
        spiele: fields.array(
          fields.object({
            datum:      fields.text({ label: 'Datum (TT.MM.JJJJ)' }),
            uhrzeit:    fields.text({ label: 'Uhrzeit (leer = unbekannt)' }),
            mannschaft: fields.text({ label: 'Unsere Mannschaft' }),
            heim:       fields.text({ label: 'Heimmannschaft' }),
            gast:       fields.text({ label: 'Gastmannschaft' }),
            ort:        fields.text({ label: 'Spielort' }),
            liga:       fields.text({ label: 'Liga / Wettbewerb' }),
            status:     fields.select({
                          label: 'Status',
                          options: [
                            { label: '📅 Kommend', value: 'kommend' },
                            { label: '✅ Abgeschlossen', value: 'abgeschlossen' },
                          ],
                          defaultValue: 'kommend',
                        }),
            heimTor:    fields.integer({ label: 'Tore Heim (nur bei Abgeschlossen)' }),
            gastTor:    fields.integer({ label: 'Tore Gast (nur bei Abgeschlossen)' }),
          }),
          {
            label: 'Spiele',
            itemLabel: (e) => {
              const icon = e.fields.status.value === 'abgeschlossen' ? '✅' : '📅'
              const score = e.fields.status.value === 'abgeschlossen'
                ? ` ${e.fields.heimTor.value ?? '?'}:${e.fields.gastTor.value ?? '?'}`
                : (e.fields.uhrzeit.value ? ` · ${e.fields.uhrzeit.value}` : '')
              return `${icon} ${e.fields.datum.value}${score} · ${e.fields.heim.value} vs ${e.fields.gast.value}`
            },
          },
        ),
        saison:          fields.text({ label: 'Saison (z.B. 2025/26)' }),
        fussball_de_url: fields.url({ label: 'bfv.de Link (für "alle Spiele"-Button)' }),
      },
    }),

    // ── Über uns & Chronik (/verein/ueber-uns) ───────────────────────────────
    ueber_uns: singleton({
      label: 'Über uns — Intro & Kennzahlen',
      path: 'src/content/singletons/ueber-uns',
      schema: {
        absaetze: fields.array(
          fields.object({
            text: fields.text({ label: 'Absatz', multiline: true }),
          }),
          { label: 'Textabsätze (linke Spalte)', itemLabel: (a) => a.fields.text.value.slice(0, 70) + '…' },
        ),
        stats: fields.array(
          fields.object({
            zahl:  fields.text({ label: 'Zahl (z.B. 2000+)' }),
            label: fields.text({ label: 'Bezeichnung (z.B. Mitglieder)' }),
          }),
          { label: 'Kennzahlen (rechte Spalte)', itemLabel: (s) => `${s.fields.zahl.value} ${s.fields.label.value}` },
        ),
      },
    }),

    // ── Vereinschronik (/verein/ueber-uns → Timeline) ────────────────────────
    chronik: singleton({
      label: 'Vereinschronik — Timeline',
      path: 'src/content/singletons/chronik',
      schema: {
        eintraege: fields.array(
          fields.object({
            jahr:       fields.text({ label: 'Jahr / Datum' }),
            ereignis:   fields.text({ label: 'Ereignis', multiline: true }),
            meilenstein: fields.checkbox({ label: 'Meilenstein (rot hervorheben)', defaultValue: false }),
          }),
          { label: 'Chronik-Einträge', itemLabel: (e) => `${e.fields.jahr.value} — ${e.fields.ereignis.value.slice(0, 60)}` },
        ),
      },
    }),

    // ── Ansprechpartner (/verein/ansprechpartner) ─────────────────────────────
    ansprechpartner: singleton({
      label: 'Ansprechpartner',
      path: 'src/content/singletons/ansprechpartner',
      schema: {
        personen: fields.array(
          fields.object({
            funktion: fields.text({ label: 'Funktion / Rolle' }),
            name:     fields.text({ label: 'Name' }),
            email:    fields.text({ label: 'E-Mail' }),
            telefon:  fields.text({ label: 'Telefon (optional)' }),
            foto:     fields.image({ label: 'Foto (optional)', directory: 'public/images/personen', publicPath: '/images/personen' }),
          }),
          { label: 'Personen', itemLabel: (p) => `${p.fields.funktion.value} — ${p.fields.name.value}` },
        ),
      },
    }),

    // ── Trainingszeiten (/verein/training) ────────────────────────────────────
    trainingszeiten: singleton({
      label: 'Trainingszeiten',
      path: 'src/content/singletons/trainingszeiten',
      schema: {
        platzzeiten: fields.array(
          fields.object({
            team: fields.text({ label: 'Mannschaft' }),
            tag:  fields.text({ label: 'Tag(e)' }),
            zeit: fields.text({ label: 'Uhrzeit' }),
            ort:  fields.text({ label: 'Platz / Ort' }),
          }),
          { label: 'Platztraining', itemLabel: (e) => `${e.fields.team.value} · ${e.fields.tag.value} ${e.fields.zeit.value}` },
        ),
        hallenzeiten: fields.array(
          fields.object({
            team: fields.text({ label: 'Mannschaft' }),
            tag:  fields.text({ label: 'Tag' }),
            zeit: fields.text({ label: 'Uhrzeit' }),
            ort:  fields.text({ label: 'Halle' }),
          }),
          { label: 'Hallentraining', itemLabel: (e) => `${e.fields.team.value} · ${e.fields.tag.value} ${e.fields.zeit.value}` },
        ),
      },
    }),

    // ── Anfahrt & Adresse (/verein/anfahrt) ───────────────────────────────────
    anfahrt: singleton({
      label: 'Anfahrt & Adresse',
      path: 'src/content/singletons/anfahrt',
      schema: {
        name:    fields.text({ label: 'Name der Anlage' }),
        strasse: fields.text({ label: 'Straße & Hausnummer' }),
        ort:     fields.text({ label: 'PLZ + Ort' }),
        optionen: fields.array(
          fields.object({
            icon:  fields.text({ label: 'Emoji-Icon (z.B. 🚗)' }),
            titel: fields.text({ label: 'Titel (z.B. Mit dem Auto)' }),
            text:  fields.text({ label: 'Beschreibung', multiline: true }),
          }),
          { label: 'Anfahrtsoptionen', itemLabel: (e) => `${e.fields.icon.value} ${e.fields.titel.value}` },
        ),
      },
    }),

    // ── Mitgliedsbeiträge (/verein/beitraege + /mitmachen) ───────────────────
    beitraege: singleton({
      label: 'Mitgliedsbeiträge',
      path: 'src/content/singletons/beitraege',
      schema: {
        gruppen: fields.array(
          fields.object({
            kategorie: fields.text({ label: 'Kategorie (z.B. Junioren)' }),
            eintraege: fields.array(
              fields.object({
                bezeichnung: fields.text({ label: 'Bezeichnung (z.B. U7–U13)' }),
                preis:       fields.text({ label: 'Preis (z.B. 120,00 €)' }),
                zeitraum:    fields.text({ label: 'Zeitraum (z.B. pro Jahr)' }),
              }),
              { label: 'Einträge', itemLabel: (e) => `${e.fields.bezeichnung.value} — ${e.fields.preis.value} / ${e.fields.zeitraum.value}` },
            ),
          }),
          { label: 'Beitragsgruppen', itemLabel: (g) => g.fields.kategorie.value },
        ),
      },
    }),

    // ── Sponsoren & Partner (/sponsoren) ──────────────────────────────────────
    sponsoren: singleton({
      label: 'Sponsoren & Partner',
      path: 'src/content/singletons/sponsoren',
      schema: {
        gruppen: fields.array(
          fields.object({
            name:   fields.text({ label: 'Gruppenbezeichnung (z.B. Hauptsponsor)' }),
            klasse: fields.select({
                      label: 'Darstellung (Spaltenanzahl)',
                      options: [
                        { label: 'Hauptsponsor — 1 Spalte (groß)', value: 'premium' },
                        { label: 'Gold — 2 Spalten', value: 'gold' },
                        { label: 'Partner — 3 Spalten (klein)', value: 'partner' },
                      ],
                      defaultValue: 'partner',
                    }),
            firmen: fields.array(
              fields.object({
                name:    fields.text({ label: 'Firmenname' }),
                branche: fields.text({ label: 'Branche / Kurzbeschreibung' }),
                website: fields.url({ label: 'Website (optional)' }),
                logo:    fields.image({ label: 'Logo (optional)', directory: 'public/images/sponsoren', publicPath: '/images/sponsoren' }),
              }),
              { label: 'Firmen', itemLabel: (f) => `${f.fields.name.value} · ${f.fields.branche.value}` },
            ),
          }),
          { label: 'Sponsor-Gruppen', itemLabel: (g) => `${g.fields.name.value} (${g.fields.klasse.value})` },
        ),
        pakete: fields.array(
          fields.object({
            name:   fields.text({ label: 'Paketname (z.B. Gold-Sponsor)' }),
            klasse: fields.select({
                      label: 'Darstellung',
                      options: [
                        { label: 'Hauptsponsor (große Karte)', value: 'premium' },
                        { label: 'Gold (mittlere Karte)', value: 'gold' },
                        { label: 'Partner (kleine Karte)', value: 'partner' },
                      ],
                      defaultValue: 'partner',
                    }),
            preis:  fields.text({ label: 'Preis (z.B. ab 250 €)' }),
            leistungen: fields.array(
              fields.object({
                punkt: fields.text({ label: 'Leistung' }),
              }),
              { label: 'Leistungen (Häkchen-Liste)', itemLabel: (l) => l.fields.punkt.value },
            ),
          }),
          { label: 'Sponsoring-Pakete', itemLabel: (p) => `${p.fields.name.value} · ${p.fields.preis.value}` },
        ),
      },
    }),

    // ── Impressum (/impressum) ────────────────────────────────────────────────
    impressum: singleton({
      label: 'Impressum & Rechtliches',
      path: 'src/content/singletons/impressum',
      schema: {
        strasse:            fields.text({ label: 'Straße & Hausnummer' }),
        ort:                fields.text({ label: 'PLZ + Ort' }),
        vereinsregister_nr: fields.text({ label: 'Vereinsregister-Nr. (Amtsgericht München)' }),
        vorstand_name:      fields.text({ label: '1. Vorstand (Name)' }),
        abteilungsleiter:   fields.text({ label: 'Abteilungsleiter Fußball (Name)' }),
        email:              fields.text({ label: 'Allgemeine E-Mail' }),
        website:            fields.text({ label: 'Website (ohne https://)' }),
      },
    }),
  },
})
