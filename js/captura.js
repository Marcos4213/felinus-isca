(function () {
  var form = document.getElementById("captura-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = window.felinusReadLeadForm(form);
    var button = form.querySelector('[type="submit"]');
    button.disabled = true;
    var result = window.submitLead(data);
    if (!result.ok) {
      button.disabled = false;
      window.felinusApplyErrors(form, result.errors);
    }
  });

  var sticky = document.getElementById("sticky-cta");
  var heroForm = document.getElementById("formulario");
  if (!sticky || !heroForm || !("IntersectionObserver" in window)) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      sticky.hidden = !past;
      document.body.classList.toggle("has-sticky", past);
    });
  }, { threshold: 0 });
  io.observe(heroForm);
})();
