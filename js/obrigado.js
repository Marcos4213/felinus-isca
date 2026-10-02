(function () {
  var clock = document.getElementById("clock");
  if (!clock) return;

  var CFG = window.FELINUS_CONFIG;
  var offer = window.felinusOfferWindow();
  var hh = document.getElementById("hh");
  var mm = document.getElementById("mm");
  var ss = document.getElementById("ss");
  var expired = document.getElementById("offer-expired");
  var live = document.getElementById("offer-live");
  var priceNow = document.getElementById("price-now");
  var priceWas = document.getElementById("price-was");
  var afterNote = document.getElementById("after-note");
  var buttons = document.querySelectorAll("[data-tripwire]");
  var ended = false;

  var lead = window.felinusGetLead();
  var nameNode = document.getElementById("lead-name");
  if (nameNode) {
    nameNode.textContent = window.felinusDisplayName(lead && lead.nome);
  }
  var emailNode = document.getElementById("lead-email");
  if (emailNode && lead && lead.email) {
    emailNode.hidden = false;
    emailNode.textContent = lead.email;
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function paint(ms) {
    var total = Math.max(0, Math.floor(ms / 1000));
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    hh.textContent = pad(h);
    mm.textContent = pad(m);
    ss.textContent = pad(s);
    clock.setAttribute("aria-label", "Tempo restante: " + h + " horas, " + m + " minutos e " + s + " segundos");
  }

  function expire() {
    if (ended) return;
    ended = true;
    live.hidden = true;
    expired.hidden = false;
    if (priceWas) priceWas.hidden = true;
    if (priceNow) priceNow.textContent = "R$67";
    if (afterNote) afterNote.hidden = false;
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.setAttribute("data-config-href", "LINK_CHECKOUT_67");
      btn.setAttribute("data-value", "67");
      btn.setAttribute("data-utm-content", "tripwire_expirado");
      var label = btn.querySelector(".btn-label");
      if (label) label.textContent = "Ver o app por R$67";
    });
    if (window.felinusBindLinks) window.felinusBindLinks(document);
    Array.prototype.forEach.call(document.querySelectorAll('[data-chip-for="LINK_CHECKOUT_37"]'), function (chip) {
      chip.hidden = true;
    });
  }

  function tick() {
    var left = offer.end - Date.now();
    if (left <= 0) {
      paint(0);
      expire();
      return;
    }
    paint(left);
    window.setTimeout(tick, 1000 - (Date.now() % 1000));
  }

  tick();

  Array.prototype.forEach.call(document.querySelectorAll('a[href="#so-o-ebook"]'), function (link) {
    link.addEventListener("click", function () {
      var target = document.getElementById("so-o-ebook");
      window.setTimeout(function () {
        if (target) target.focus();
      }, 280);
    });
  });
})();
