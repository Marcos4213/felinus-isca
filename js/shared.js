/**
 * Felinus — arquivo compartilhado.
 * Troque os links só neste objeto. O restante do site lê daqui.
 * Placeholders entre colchetes ainda não têm URL real.
 */
window.FELINUS_CONFIG = {
  LINK_CHECKOUT_37: "[LINK_CHECKOUT_37]",
  LINK_PDF: "[LINK_PDF]",
  /* Checkout de R$67 já publicado em saudefelina.org (Lastlink). */
  LINK_CHECKOUT_67: "https://lastlink.com/p/CEE7F1AF3/checkout-payment/",
  LINK_PRIVACIDADE: "https://saudefelina.org/privacidade",
  LINK_TERMOS: "https://saudefelina.org/termos",
  PIXEL_ID: "PIXEL_ID",
  OFFER_HOURS: 48,
  STORAGE_LEAD: "felinus_lead",
  STORAGE_LEADS: "felinus_leads",
  STORAGE_OFFER_START: "felinus_offer_started_at"
};

(function () {
  var CFG = window.FELINUS_CONFIG;

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (err) {
      return false;
    }
  }

  function isPlaceholder(value) {
    return typeof value === "string" && value.charAt(0) === "[";
  }

  function withUtm(url, content) {
    if (!/^https?:/i.test(url)) return url;
    try {
      var u = new URL(url);
      if (!u.searchParams.get("utm_source")) u.searchParams.set("utm_source", "ebook20");
      if (!u.searchParams.get("utm_medium")) u.searchParams.set("utm_medium", "obrigado");
      if (!u.searchParams.get("utm_campaign")) u.searchParams.set("utm_campaign", "isca-receitas");
      if (content && !u.searchParams.get("utm_content")) u.searchParams.set("utm_content", content);
      return u.toString();
    } catch (err) {
      return url;
    }
  }

  function resolveLink(key, content) {
    var raw = CFG[key] || "";
    if (isPlaceholder(raw)) return raw;
    return withUtm(raw, content);
  }

  /**
   * Meta Pixel: o snippet está comentado nas páginas (PIXEL_ID).
   * Quando o pixel existir, estes eventos disparam de verdade.
   * Lead no envio. ViewContent + InitiateCheckout no clique do tripwire.
   */
  function felinusTrack(eventName, params) {
    if (typeof window.fbq !== "function") return;
    try {
      window.fbq("track", eventName, params || {});
    } catch (err) {
      /* pixel opcional: não quebra a página */
    }
  }
  window.felinusTrack = felinusTrack;

  function showNotice(message) {
    var region = document.getElementById("live-notice");
    if (!region) {
      region = document.createElement("div");
      region.id = "live-notice";
      region.className = "live-notice";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    region.textContent = message;
    region.classList.add("is-on");
    window.clearTimeout(showNotice._t);
    showNotice._t = window.setTimeout(function () {
      region.classList.remove("is-on");
    }, 4200);
  }

  function bindConfigLinks(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll("[data-config-href]");
    Array.prototype.forEach.call(nodes, function (el) {
      var key = el.getAttribute("data-config-href");
      var content = el.getAttribute("data-utm-content") || "";
      var href = resolveLink(key, content);
      el.setAttribute("href", href);
      var chip = el.parentElement && el.parentElement.querySelector('[data-chip-for="' + key + '"]');
      if (isPlaceholder(href)) {
        el.classList.add("is-placeholder");
        el.setAttribute("data-placeholder", href);
        if (chip) {
          chip.hidden = false;
          chip.textContent = href;
        }
      } else if (chip) {
        chip.hidden = true;
      }
      if (el.getAttribute("data-bound") === "1") return;
      el.setAttribute("data-bound", "1");
      el.addEventListener("click", function (event) {
        var current = el.getAttribute("href") || "";
        var isTripwire = el.hasAttribute("data-tripwire");
        if (isTripwire) {
          var value = el.getAttribute("data-value") || "37";
          felinusTrack("ViewContent", {
            content_name: "App Felinus",
            content_type: "product",
            value: Number(value),
            currency: "BRL"
          });
          felinusTrack("InitiateCheckout", {
            content_name: "App Felinus",
            value: Number(value),
            currency: "BRL"
          });
        }
        if (isPlaceholder(current)) {
          event.preventDefault();
          showNotice("Link ainda não configurado: " + current + ". Edite FELINUS_CONFIG em js/shared.js.");
        }
      });
    });
  }
  window.felinusBindLinks = bindConfigLinks;

  function validateLead(data) {
    var errors = {};
    var nome = (data.nome || "").trim();
    var email = (data.email || "").trim();
    if (nome.length < 2) {
      errors.nome = "Como podemos te chamar? Escreva seu primeiro nome.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Coloque um e-mail válido para receber o e-book.";
    }
    if (!data.consent) {
      errors.consent = "Para enviar, aceite receber o e-book por e-mail.";
    }
    return errors;
  }

  function readLeadForm(form) {
    var fd = new FormData(form);
    var quiz = {};
    ["agua", "racao", "seletivo", "idade", "casa", "tempo"].forEach(function (key) {
      var value = fd.get("q_" + key);
      if (value) quiz[key] = String(value);
    });
    return {
      nome: String(fd.get("nome") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      nomeGato: String(fd.get("nomeGato") || "").trim(),
      consent: fd.get("consent") === "sim",
      origem: "ebook20",
      pagina: String(fd.get("pagina") || ""),
      quiz: Object.keys(quiz).length ? quiz : null
    };
  }

  function displayName(nome) {
    var clean = String(nome || "").trim();
    if (!clean) return "tutora";
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  window.felinusDisplayName = displayName;

  /**
   * TODO(Brevo): enviar ao endpoint do formulário Brevo.
   * Lista a criar: "Felinus · Ebook 20 receitas".
   * Atributos: FIRSTNAME, EMAIL, NOME_GATO, ORIGEM=ebook20, DATA_CADASTRO
   * e, no quiz, QUIZ_AGUA, QUIZ_RACAO, QUIZ_SELETIVO, QUIZ_IDADE, QUIZ_GATOS, QUIZ_TEMPO.
   * Nada é criado no Brevo por este arquivo. Hoje o lead fica só no navegador.
   */
  function submitLead(data) {
    var errors = validateLead(data);
    if (Object.keys(errors).length) {
      return { ok: false, errors: errors };
    }
    var record = {
      nome: data.nome.trim(),
      email: data.email.trim(),
      nomeGato: (data.nomeGato || "").trim(),
      consent: true,
      origem: data.origem || "ebook20",
      pagina: data.pagina || "",
      quiz: data.quiz || null,
      dataCadastro: new Date().toISOString()
    };
    var leads = [];
    try {
      leads = JSON.parse(storageGet(CFG.STORAGE_LEADS) || "[]");
      if (!Array.isArray(leads)) leads = [];
    } catch (err) {
      leads = [];
    }
    leads.push(record);
    storageSet(CFG.STORAGE_LEADS, JSON.stringify(leads));
    storageSet(CFG.STORAGE_LEAD, JSON.stringify(record));
    felinusTrack("Lead", {
      content_name: "A Tigela que Hidrata",
      content_category: record.pagina || "ebook20"
    });
    window.location.href = "obrigado.html";
    return { ok: true, errors: {} };
  }
  window.submitLead = submitLead;
  window.felinusReadLeadForm = readLeadForm;

  function applyFieldErrors(form, errors) {
    Array.prototype.forEach.call(form.querySelectorAll(".field-error"), function (node) {
      node.textContent = "";
      node.hidden = true;
    });
    Array.prototype.forEach.call(form.querySelectorAll("[aria-invalid]"), function (node) {
      node.removeAttribute("aria-invalid");
    });
    Object.keys(errors).forEach(function (key) {
      var input = form.querySelector('[name="' + (key === "consent" ? "consent" : key) + '"]');
      var msg = form.querySelector('[data-error-for="' + key + '"]');
      if (input) {
        input.setAttribute("aria-invalid", "true");
        if (msg) input.setAttribute("aria-describedby", msg.id);
      }
      if (msg) {
        msg.hidden = false;
        msg.textContent = errors[key];
      }
    });
    var first = form.querySelector("[aria-invalid='true']");
    if (first) first.focus();
    form.classList.remove("is-shaking");
    void form.offsetWidth;
    form.classList.add("is-shaking");
  }
  window.felinusApplyErrors = applyFieldErrors;

  function getStoredLead() {
    try {
      return JSON.parse(storageGet(CFG.STORAGE_LEAD) || "null");
    } catch (err) {
      return null;
    }
  }
  window.felinusGetLead = getStoredLead;

  /**
   * Contador real de 48h por visitante.
   * Grava o instante da primeira visita e nunca reinicia.
   */
  function getOfferWindow() {
    var hours = Number(CFG.OFFER_HOURS) || 48;
    var stored = Number(storageGet(CFG.STORAGE_OFFER_START));
    var start = stored;
    if (!stored || Number.isNaN(stored)) {
      start = Date.now();
      storageSet(CFG.STORAGE_OFFER_START, String(start));
    }
    return {
      start: start,
      end: start + hours * 60 * 60 * 1000
    };
  }
  window.felinusOfferWindow = getOfferWindow;

  function initReveal() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(nodes, function (node) {
        node.classList.add("is-in");
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    Array.prototype.forEach.call(nodes, function (node) {
      io.observe(node);
    });
  }

  function initParallax() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var nodes = document.querySelectorAll("[data-parallax]");
    if (!nodes.length) return;
    var ticking = false;
    function update() {
      var y = window.scrollY || 0;
      Array.prototype.forEach.call(nodes, function (el) {
        var speed = Number(el.getAttribute("data-parallax")) || 0.08;
        el.style.transform = "translate3d(0," + (y * speed).toFixed(2) + "px,0)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
  }

  function initBookTilt() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    Array.prototype.forEach.call(document.querySelectorAll(".book-scene"), function (scene) {
      var book = scene.querySelector(".book");
      if (!book) return;
      scene.addEventListener("mousemove", function (event) {
        var rect = scene.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width - 0.5;
        var py = (event.clientY - rect.top) / rect.height - 0.5;
        book.style.transform = "rotateY(" + (-28 + px * 12).toFixed(2) + "deg) rotateX(" + (7 - py * 8).toFixed(2) + "deg)";
      });
      scene.addEventListener("mouseleave", function () {
        book.style.transform = "";
      });
    });
  }

  function initBookPreview() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-book-preview]"), function (scene) {
      var faces = scene.querySelectorAll(".book-face");
      var btn = scene.querySelector(".book-next");
      if (!faces.length || !btn) return;
      var index = 0;
      btn.addEventListener("click", function () {
        faces[index].classList.remove("is-on");
        index = (index + 1) % faces.length;
        faces[index].classList.add("is-on");
        var label = faces[index].getAttribute("data-label") || "prévia";
        btn.setAttribute("aria-label", "Folhear a prévia do e-book. Agora: " + label);
      });
    });
  }

  function initFaq() {
    Array.prototype.forEach.call(document.querySelectorAll(".faq-item"), function (item) {
      var btn = item.querySelector(".faq-q");
      var panel = item.querySelector(".faq-a");
      if (!btn || !panel) return;
      btn.addEventListener("click", function () {
        var open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        panel.hidden = !open;
      });
    });
  }

  function boot() {
    bindConfigLinks(document);
    initReveal();
    initParallax();
    initBookTilt();
    initBookPreview();
    initFaq();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
