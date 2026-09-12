/* =================================================================
   Dämmstoffe Bauer — Sortiment: Kategorie-Filter + Live-Suche
   ================================================================= */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const chips = $$(".chip");
  const products = $$(".product");
  const empty = $("#noResults");
  const search = $("#productSearch");
  if (!chips.length && !search) return;

  let cat = "all";
  let term = "";
  const norm = (s) => (s || "").toLowerCase();

  function apply() {
    let visible = 0;
    products.forEach((p) => {
      const okCat = cat === "all" || p.dataset.cat === cat;
      const okTerm = !term || norm(p.textContent).includes(term);
      const show = okCat && okTerm;
      p.classList.toggle("hide", !show);
      if (show) visible++;
    });
    chips.forEach((c) => {
      const on = c.dataset.filter === cat;
      c.classList.toggle("active", on);
      c.setAttribute("aria-pressed", String(on));
    });
    if (empty) empty.style.display = visible ? "none" : "block";

    const url = new URL(location.href);
    if (cat === "all") url.searchParams.delete("cat");
    else url.searchParams.set("cat", cat);
    history.replaceState(null, "", url);
  }

  chips.forEach((chip) =>
    chip.addEventListener("click", () => { cat = chip.dataset.filter; apply(); })
  );
  if (search) {
    search.addEventListener("input", () => { term = norm(search.value.trim()); apply(); });
  }

  // preselect category from ?cat=
  const c = new URLSearchParams(location.search).get("cat");
  cat = chips.some((x) => x.dataset.filter === c) ? c : "all";
  apply();
})();
