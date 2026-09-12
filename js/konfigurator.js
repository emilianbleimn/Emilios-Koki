/* =================================================================
   Dämmstoffe Bauer — Konfigurator
   Mehrstufiger Berater: Bereich → Fläche → Anspruch → Empfehlung
   (Reine Orientierung – keine verbindliche Berechnung)
   ================================================================= */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const shell = $(".config-shell");
  if (!shell) return;

  /* Empfehlungslogik je Bereich + Anspruch.
     dicke = empfohlene Dämmstärke (cm), preis = Richtwert €/m² (Material) */
  const RECS = {
    wand: {
      label: "Wand / Fassade",
      standard: { name: "EPS-Fassadendämmplatte", dicke: 14, lambda: "035", preis: 18 },
      premium:  { name: "Mineralwoll-Fassadenplatte", dicke: 16, lambda: "032", preis: 27 },
      oeko:     { name: "Holzfaser-Dämmplatte", dicke: 18, lambda: "040", preis: 34 },
    },
    dach: {
      label: "Dach / Decke",
      standard: { name: "Glaswolle-Klemmfilz", dicke: 20, lambda: "035", preis: 14 },
      premium:  { name: "Steinwolle-Dämmplatte", dicke: 22, lambda: "032", preis: 24 },
      oeko:     { name: "Holzfaser-Aufdachdämmung", dicke: 24, lambda: "040", preis: 38 },
    },
    boden: {
      label: "Boden / Geschossdecke",
      standard: { name: "EPS-Trittschalldämmung", dicke: 8, lambda: "035", preis: 12 },
      premium:  { name: "PUR/PIR-Hartschaumplatte", dicke: 10, lambda: "024", preis: 26 },
      oeko:     { name: "Holzfaser-Trittschallplatte", dicke: 12, lambda: "040", preis: 30 },
    },
    keller: {
      label: "Keller / Perimeter",
      standard: { name: "XPS-Hartschaumplatte", dicke: 10, lambda: "035", preis: 19 },
      premium:  { name: "XPS-Perimeterdämmung 300 kPa", dicke: 12, lambda: "032", preis: 29 },
      oeko:     { name: "Schaumglas-Dämmplatte", dicke: 12, lambda: "040", preis: 42 },
    },
  };

  const TIERS = {
    standard: "Standard",
    premium: "Premium · beste Dämmwerte",
    oeko: "Ökologisch · Naturdämmstoff",
  };

  const state = { bereich: null, flaeche: 25, anspruch: "premium" };
  let step = 1;
  const totalSteps = 4;

  const steps = $$(".config-step");
  const progressItems = $$(".config-progress li");
  const btnNext = $("#cfgNext");
  const btnBack = $("#cfgBack");

  /* Vorauswahl aus URL (?bereich=dach) */
  const params = new URLSearchParams(location.search);
  const pre = params.get("bereich");
  if (pre && RECS[pre]) state.bereich = pre;

  function render() {
    steps.forEach((s, i) => s.classList.toggle("active", i === step - 1));
    progressItems.forEach((li, i) => {
      li.classList.toggle("active", i === step - 1);
      li.classList.toggle("done", i < step - 1);
    });
    btnBack.style.visibility = step === 1 ? "hidden" : "visible";

    // Bereich-Auswahl spiegeln
    $$("[data-bereich]").forEach((c) =>
      c.classList.toggle("selected", c.dataset.bereich === state.bereich)
    );
    // Anspruch-Auswahl spiegeln
    $$("[data-anspruch]").forEach((c) =>
      c.classList.toggle("selected", c.dataset.anspruch === state.anspruch)
    );

    if (step === totalSteps) { renderResult(); btnNext.style.display = "none"; }
    else { btnNext.style.display = ""; btnNext.textContent = step === totalSteps - 1 ? "Empfehlung anzeigen" : "Weiter"; }

    // Weiter-Button sperren, solange Bereich fehlt
    btnNext.disabled = step === 1 && !state.bereich;
    btnNext.style.opacity = btnNext.disabled ? ".5" : "";
  }

  function go(to) {
    step = Math.max(1, Math.min(totalSteps, to));
    render();
    shell.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* Bereich wählen */
  $$("[data-bereich]").forEach((card) =>
    card.addEventListener("click", () => {
      state.bereich = card.dataset.bereich;
      render();
    })
  );

  /* Fläche */
  const range = $("#cfgArea");
  const areaOut = $("#cfgAreaVal");
  if (range) {
    range.value = state.flaeche;
    const sync = () => { state.flaeche = parseInt(range.value, 10); if (areaOut) areaOut.textContent = state.flaeche; };
    range.addEventListener("input", sync);
    sync();
  }

  /* Anspruch */
  $$("[data-anspruch]").forEach((card) =>
    card.addEventListener("click", () => {
      state.anspruch = card.dataset.anspruch;
      render();
    })
  );

  btnNext.addEventListener("click", () => { if (!btnNext.disabled) go(step + 1); });
  btnBack.addEventListener("click", () => go(step - 1));

  function renderResult() {
    const area = $("#resultArea");
    if (!area) return;
    const data = RECS[state.bereich][state.anspruch];
    const flaeche = state.flaeche;
    const verschnitt = 1.1; // 10 % Verschnitt
    const benoetigt = Math.ceil(flaeche * verschnitt);
    const materialKosten = Math.round(benoetigt * data.preis);

    area.innerHTML =
      '<div class="result-head">' +
        '<span class="pill">Empfehlung</span>' +
        '<strong style="font-family:var(--font-display)">' + RECS[state.bereich].label + ' · ' + TIERS[state.anspruch].split(" · ")[0] + '</strong>' +
      '</div>' +
      '<h3 style="margin-bottom:.4rem">' + data.name + '</h3>' +
      '<p style="margin-bottom:1.2rem">Auf Basis Ihrer Angaben empfehlen wir diesen Dämmstoff als sinnvolle Ausgangslösung für Ihr Projekt.</p>' +
      '<div class="result-grid">' +
        item("Fläche", flaeche + " m²") +
        item("Empf. Dämmstärke", data.dicke + " cm") +
        item("Wärmeleitgr. (WLG)", data.lambda) +
        item("Materialbedarf*", benoetigt + " m²") +
        item("Richtpreis Material*", "ca. " + materialKosten.toLocaleString("de-DE") + " €") +
      '</div>' +
      '<div class="result-note">* Orientierungswerte inkl. ~10&nbsp;% Verschnitt. Tatsächlicher Bedarf, U-Wert-Nachweis und Festpreis ergeben sich aus einer persönlichen Beratung – wir prüfen Bestand, Förderung (z.&nbsp;B. BAFA/KfW) und Verarbeitung individuell.</div>' +
      '<div class="hero__cta">' +
        '<button class="add-btn" style="padding:.85rem 1.4rem" data-add="cfg-' + state.bereich + '-' + state.anspruch +
          '" data-name="' + escapeAttr(data.name + " (" + RECS[state.bereich].label + ", " + benoetigt + " m²)") + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>' +
          '<span class="add-label">Zur Merkliste hinzufügen</span>' +
        '</button>' +
        '<a class="btn btn--ghost" href="kontakt-anfrage">Persönliche Beratung anfragen</a>' +
      '</div>' +
      '<button class="link-arrow" id="cfgRestart" style="margin-top:1.4rem">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>' +
        'Neue Konfiguration starten' +
      '</button>';

    // fix kontakt link (relative to konfigurator page → index contact section)
    const beratung = area.querySelector('a[href="kontakt-anfrage"]');
    if (beratung) beratung.setAttribute("href", "index.html#kontakt");

    const restart = $("#cfgRestart", area);
    if (restart) restart.addEventListener("click", () => { state.bereich = pre && RECS[pre] ? pre : null; go(1); });
  }

  function item(k, v) {
    return '<div class="result-item"><div class="k">' + k + '</div><div class="v">' + v + '</div></div>';
  }
  function escapeAttr(s) { return String(s).replace(/"/g, "&quot;"); }

  render();
})();
