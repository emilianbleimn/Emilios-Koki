/* =================================================================
   Dämmstoffe Bauer — shared interactions
   ================================================================= */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme (light / dark) ---------- */
  const THEME_KEY = "db-theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0f1509" : "#74bc20");
  }

  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(stored || (prefersDark ? "dark" : "light"));

  document.addEventListener("click", (e) => {
    const toggle = e.target.closest("[data-theme-toggle]");
    if (!toggle) return;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  /* ---------- Sticky header state ---------- */
  const header = $(".site-header");
  const progress = $(".scroll-progress");
  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  const navToggle = $(".nav-toggle");
  const nav = $(".nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    $$(".nav__link, .nav .btn", nav).forEach((l) =>
      l.addEventListener("click", () => {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Scroll reveal ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (prefersReduced) { el.textContent = target + suffix; return; }
    const dur = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target % 1 === 0 ? Math.round(target * eased) : (target * eased).toFixed(1);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { animateCount(entry.target); co.unobserve(entry.target); }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => co.observe(el));
  }

  /* ---------- Hero photo slider ---------- */
  const slider = $("[data-slider]");
  if (slider) {
    const slides = $$(".slide", slider);
    const dots = $$(".slider-dots button", slider);
    let idx = 0, timer;
    const go = (n) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
    };
    const start = () => { if (!prefersReduced && slides.length > 1) timer = setInterval(() => go(idx + 1), 5000); };
    const stop = () => clearInterval(timer);
    dots.forEach((d, i) => d.addEventListener("click", () => { go(i); stop(); start(); }));
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  /* ---------- Back to top ---------- */
  const toTop = $("#toTop");
  if (toTop) {
    const onScrollTop = () => toTop.classList.toggle("show", window.scrollY > 600);
    window.addEventListener("scroll", onScrollTop, { passive: true });
    onScrollTop();
    toTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" })
    );
  }

  /* ---------- Inquiry list (localStorage) ---------- */
  const INQ_KEY = "db-inquiry";
  const Inquiry = {
    all() {
      try { return JSON.parse(localStorage.getItem(INQ_KEY)) || []; }
      catch { return []; }
    },
    save(list) {
      localStorage.setItem(INQ_KEY, JSON.stringify(list));
      Inquiry.render();
    },
    add(item) {
      const list = Inquiry.all();
      const existing = list.find((i) => i.id === item.id);
      if (existing) { existing.qty = (existing.qty || 1) + (item.qty || 1); }
      else { list.push(Object.assign({ qty: 1 }, item)); }
      Inquiry.save(list);
    },
    remove(id) {
      Inquiry.save(Inquiry.all().filter((i) => i.id !== id));
    },
    count() {
      return Inquiry.all().reduce((n, i) => n + (i.qty || 1), 0);
    },
    render() {
      // header badge
      const badge = $(".cart-count");
      if (badge) {
        const c = Inquiry.count();
        badge.textContent = c;
        badge.classList.toggle("show", c > 0);
      }
      // contact-page summary
      const box = $("#inquirySummary");
      if (box) {
        const list = Inquiry.all();
        if (!list.length) { box.style.display = "none"; }
        else {
          box.style.display = "block";
          box.innerHTML =
            "<strong>Ihre Merkliste (" + Inquiry.count() + ")</strong>" +
            "<ul>" +
            list.map((i) =>
              "<li><span>" + (i.qty > 1 ? i.qty + "× " : "") + escapeHtml(i.name) + "</span>" +
              "<button type='button' aria-label='Entfernen' data-remove='" + i.id + "'>&times;</button></li>"
            ).join("") +
            "</ul>";
        }
      }
    },
    asText() {
      const list = Inquiry.all();
      if (!list.length) return "";
      return "\n\n--- Meine Merkliste ---\n" +
        list.map((i) => "• " + (i.qty > 1 ? i.qty + "× " : "") + i.name).join("\n");
    },
  };
  window.DBInquiry = Inquiry; // expose for configurator
  Inquiry.render();

  // add-to-inquiry buttons (catalog + result)
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      const item = {
        id: addBtn.dataset.add,
        name: addBtn.dataset.name || addBtn.dataset.add,
      };
      Inquiry.add(item);
      addBtn.classList.add("added");
      const original = addBtn.querySelector(".add-label");
      if (original) {
        const prev = original.textContent;
        original.textContent = "Hinzugefügt";
        setTimeout(() => { original.textContent = prev; addBtn.classList.remove("added"); }, 1600);
      }
      toast("„" + (addBtn.dataset.name || "Produkt") + "“ zur Merkliste hinzugefügt");
    }
    const rm = e.target.closest("[data-remove]");
    if (rm) Inquiry.remove(rm.dataset.remove);
  });

  /* ---------- Contact form ---------- */
  const form = $("#contactForm");
  if (form) {
    const msg = $("#formMsg", form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const required = ["vorname", "nachname", "email", "nachricht"];
      let valid = true;
      required.forEach((name) => {
        const field = form.elements[name];
        if (!field) return;
        const ok = String(field.value).trim() !== "" &&
          (name !== "email" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(field.value));
        field.style.borderColor = ok ? "" : "#d6452f";
        if (!ok) valid = false;
      });
      if (!valid) {
        msg.className = "form-msg err show";
        msg.textContent = "Bitte füllen Sie alle Pflichtfelder korrekt aus.";
        return;
      }
      // No backend in this static build → graceful confirmation + mailto fallback.
      msg.className = "form-msg ok show";
      msg.textContent = "Vielen Dank, " + data.get("vorname") + "! Ihre Nachricht ist bereit. Sie können sie direkt per E-Mail absenden.";

      const subject = encodeURIComponent("[Website] " + (data.get("betreff") || "Anfrage"));
      const body = encodeURIComponent(
        "Name: " + data.get("vorname") + " " + data.get("nachname") + "\n" +
        "E-Mail: " + data.get("email") + "\n\n" +
        data.get("nachricht") +
        Inquiry.asText()
      );
      setTimeout(() => {
        window.location.href = "mailto:info@bauer-daemmstoffe.de?subject=" + subject + "&body=" + body;
      }, 600);
      form.reset();
    });
  }

  /* ---------- Toast helper ---------- */
  let toastTimer;
  function toast(text) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.innerHTML = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M20 6 9 17l-5-5'/></svg><span></span>";
      document.body.appendChild(el);
    }
    el.querySelector("span").textContent = text;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }
  window.DBToast = toast;

  /* ---------- utils ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  /* ---------- current year ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
