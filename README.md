# Dämmstoffe Bauer — Website

Moderne, statische Website für **Dämmstoffe Bauer** (Walldorf bei Heidelberg) –
Dämmstoffe für Wand, Dach, Boden und Keller, persönliche Beratung und das
komplette Zubehör aus einer Hand.

Diese Neugestaltung legt den Fokus auf ein modernes Erscheinungsbild, ein
stimmiges Farbkonzept (Markengrün #74bc20 + Navy #01205e, Schrift Figtree), fließende Übergänge und eine
klare, übersichtliche Struktur.

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite: Hero mit interaktivem Haus, Leistungen, Vorteile, Konfigurator-Teaser, „Wieso dämmen?“, Kontaktformular |
| `konfigurator.html` | Mehrstufiger Konfigurator: Bereich → Fläche → Anspruch → Empfehlung mit Richtwerten |
| `sortiment.html` | Produktkatalog mit Kategorie-Filter und Merkliste |
| `impressum.html` | Impressum & Datenschutz (Vorlage – bitte rechtlich prüfen) |

## Funktionen

- **Interaktives Haus** im Hero – Bereich antippen führt direkt in den Konfigurator
- **Konfigurator** mit Empfehlung, Dämmstärke, WLG, Materialbedarf und Richtpreis
- **Merkliste** (localStorage) – Produkte/Empfehlungen merken und ins Kontaktformular übernehmen
- **Sortiment-Filter** nach Bereich, per URL teilbar (`?cat=dach`)
- **Hell/Dunkel-Modus** mit weichem Übergang, respektiert Systemeinstellung
- **Scroll-Reveal-Animationen**, animierte Kennzahlen, Fortschrittsbalken, Sticky-Glas-Header
- Vollständig **responsive** inkl. mobilem Menü, `prefers-reduced-motion` wird beachtet

## Technik

Reines HTML, CSS und Vanilla-JavaScript – **kein Build-Schritt, keine Abhängigkeiten**.
Einfach `index.html` öffnen oder einen statischen Server starten:

```bash
python3 -m http.server 8080
# danach http://localhost:8080 im Browser öffnen
```

## Struktur

```
.
├── index.html
├── konfigurator.html
├── sortiment.html
├── impressum.html
├── css/
│   └── style.css        # Design-System, Komponenten, Animationen, Dark Mode
└── js/
    ├── main.js          # Header, Theme, Reveal, Merkliste, Formular, Toasts
    ├── konfigurator.js  # Logik des Konfigurators
    └── sortiment.js     # Katalog-Filter
```

## Live-Vorschau & Veröffentlichung

**Sofort-Vorschau (ohne Setup):** Da das Repository öffentlich ist, lässt sich die
Seite direkt über den githack-CDN ansehen:
`https://raw.githack.com/emilianbleimn/Emilios-Koki/main/index.html`
(statt `main` ggf. den Branch- oder Commit-Namen verwenden).

**Eigene Adresse (GitHub Pages):** Repo → *Settings* → *Pages* →
*Build and deployment* → *Source: „Deploy from a branch"* → Branch `main`,
Ordner `/(root)` → *Save*. Nach kurzer Zeit ist die Seite unter
`https://emilianbleimn.github.io/Emilios-Koki/` erreichbar.

## Hinweise

- Das Kontaktformular ist clientseitig (öffnet das E-Mail-Programm) und kann bei
  Bedarf an ein Backend/Formularservice angebunden werden.
- Preis-, Material- und Dämmwerte im Konfigurator und Sortiment sind
  **unverbindliche Orientierungswerte**.
- `impressum.html` ist eine Vorlage und muss vor Veröffentlichung vervollständigt
  und rechtlich geprüft werden.
