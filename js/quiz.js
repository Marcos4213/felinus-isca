(function () {
  var root = document.getElementById("quiz-app");
  if (!root) return;

  var questions = [
    {
      id: "agua",
      title: "Quanto ele bebe água no potinho?",
      hint: "Marque o que mais parece com o dia a dia.",
      options: [
        { id: "quase", label: "Quase não bebe", detail: "O pote fica cheio o dia todo." },
        { id: "pouco", label: "Bebe pouco", detail: "Já troquei o pote ou comprei fonte." },
        { id: "normal", label: "Bebe numa boa", detail: "Mesmo assim quero cuidar da hidratação." },
        { id: "nao_sei", label: "Não sei direito", detail: "É difícil perceber." }
      ]
    },
    {
      id: "racao",
      title: "O que tem na tigela na maior parte dos dias?",
      hint: "A receita vai por cima do que ele já come.",
      options: [
        { id: "seca", label: "Só ração seca", detail: "É o que ele aceita." },
        { id: "sache", label: "Seca, e sachê às vezes", detail: "Quando ele não recusa." },
        { id: "umido", label: "Já misturo algo úmido", detail: "Quero um jeito mais organizado." },
        { id: "terapeutica", label: "Ração terapêutica", detail: "Indicada pela veterinária." }
      ]
    },
    {
      id: "seletivo",
      title: "Quando a comida muda, o que ele faz?",
      hint: "Gato estranha novidade. Isso é comum.",
      options: [
        { id: "cheira", label: "Cheira e sai", detail: "Recusa quase tudo que é novo." },
        { id: "sache_nao", label: "Recusou sachê caro", detail: "Cheirou e largou." },
        { id: "devagar", label: "Aceita, se for devagar", detail: "Novidade demais assusta." },
        { id: "depende", label: "Depende do dia", detail: "Às vezes sim, às vezes não." }
      ]
    },
    {
      id: "idade",
      title: "Qual a fase da vida dele?",
      hint: "Filhote, idoso ou ração terapêutica pedem o ok do veterinário.",
      options: [
        { id: "filhote", label: "Filhote", detail: "Até cerca de 1 ano." },
        { id: "adulto", label: "Adulto", detail: "A rotina já está formada." },
        { id: "idoso", label: "Idoso", detail: "A partir de uns 8 anos." },
        { id: "nao_sei", label: "Não sei ao certo", detail: "Tudo bem marcar assim." }
      ]
    },
    {
      id: "casa",
      title: "Quantos gatos moram com você?",
      hint: "A receita pode ser a mesma. A quantidade muda.",
      options: [
        { id: "um", label: "Só um", detail: "A casa inteira é ele." },
        { id: "dois", label: "Dois", detail: "Cada um no seu ritmo." },
        { id: "tres", label: "Três ou mais", detail: "A conta multiplica." }
      ]
    },
    {
      id: "tempo",
      title: "Quanto tempo sobra na cozinha?",
      hint: "Tem caldo para a semana e tem topper de 2 minutos.",
      options: [
        { id: "pouco", label: "Quase nenhum", detail: "Precisa ser rápido." },
        { id: "alguns", label: "Uns minutinhos", detail: "Se for simples, eu faço." },
        { id: "gosto", label: "Gosto de cozinhar", detail: "Se valer a pena para ele." }
      ]
    }
  ];

  var step = -1;
  var answers = {};
  var intro = document.getElementById("quiz-intro");
  var stage = document.getElementById("quiz-questions");
  var result = document.getElementById("quiz-result");
  var progressWrap = document.getElementById("quiz-progress");
  var progressLabel = document.getElementById("progress-label");
  var progressBar = document.getElementById("progress-bar");
  var progressFill = document.getElementById("progress-fill");
  var resultCopy = document.getElementById("result-copy");
  var resultChips = document.getElementById("result-chips");
  var form = document.getElementById("quiz-form");

  function optionLabel(questionId, optionId) {
    var question = questions.filter(function (item) { return item.id === questionId; })[0];
    if (!question) return "";
    var option = question.options.filter(function (item) { return item.id === optionId; })[0];
    return option ? option.label : "";
  }

  function setProgress(index) {
    var total = questions.length;
    var current = index + 1;
    progressWrap.hidden = false;
    progressLabel.textContent = "Pergunta " + current + " de " + total;
    progressBar.setAttribute("aria-valuenow", String(current));
    progressBar.setAttribute("aria-valuemax", String(total));
    progressFill.style.width = ((current / total) * 100) + "%";
  }

  function showPanel(name) {
    intro.hidden = name !== "intro";
    stage.hidden = name !== "questions";
    result.hidden = name !== "result";
    if (name === "intro") progressWrap.hidden = true;
  }

  function renderQuestion() {
    var question = questions[step];
    setProgress(step);
    var options = question.options.map(function (option) {
      var checked = answers[question.id] === option.id ? " checked" : "";
      return (
        '<label class="option">' +
          '<input type="radio" name="quiz-current" value="' + option.id + '"' + checked + ">" +
          '<span class="option-copy">' +
            '<span class="option-label">' + option.label + "</span>" +
            '<span class="option-detail">' + option.detail + "</span>" +
          "</span>" +
        "</label>"
      );
    }).join("");

    stage.innerHTML =
      '<article class="quiz-panel" id="question-panel">' +
        '<p class="quiz-kicker">Sobre ele</p>' +
        '<h2 id="q-title" tabindex="-1">' + question.title + "</h2>" +
        '<p class="quiz-hint" id="q-hint">' + question.hint + "</p>" +
        '<div class="options" role="radiogroup" aria-labelledby="q-title">' + options + "</div>" +
        '<p class="field-error" id="q-error" data-error-for="quiz" hidden></p>' +
        '<div class="quiz-nav">' +
          '<button type="button" class="btn btn-ghost" id="quiz-back">Voltar</button>' +
          '<button type="button" class="btn btn-primary" id="quiz-next">' +
            (step === questions.length - 1 ? "Ver o que combina com ele" : "Continuar") +
            ' <span aria-hidden="true">→</span>' +
          "</button>" +
        "</div>" +
      "</article>";

    var title = document.getElementById("q-title");
    if (title) title.focus();

    document.getElementById("quiz-back").addEventListener("click", function () {
      if (step === 0) {
        step = -1;
        showPanel("intro");
        return;
      }
      step -= 1;
      renderQuestion();
    });

    document.getElementById("quiz-next").addEventListener("click", advance);
    stage.querySelectorAll('input[name="quiz-current"]').forEach(function (input) {
      input.addEventListener("change", function () {
        answers[question.id] = input.value;
        var err = document.getElementById("q-error");
        if (err) err.hidden = true;
      });
    });
  }

  function advance() {
    var question = questions[step];
    var selected = stage.querySelector('input[name="quiz-current"]:checked');
    if (!selected) {
      var err = document.getElementById("q-error");
      if (err) {
        err.hidden = false;
        err.textContent = "Escolha uma opção para continuar.";
      }
      return;
    }
    answers[question.id] = selected.value;
    if (step === questions.length - 1) {
      showResult();
      return;
    }
    step += 1;
    renderQuestion();
  }

  function resultLines() {
    var lines = [];
    if (answers.agua === "quase" || answers.agua === "pouco") {
      lines.push("Ele bebe pouca água no pote. A água pode entrar pela comida.");
    } else if (answers.agua === "nao_sei") {
      lines.push("Se fica difícil perceber o quanto ele bebe, a tigela é um começo simples.");
    } else {
      lines.push("Mesmo quem bebe no pote se beneficia de umidade na comida.");
    }
    if (answers.racao === "seca") {
      lines.push("A ração seca continua. As receitas vão por cima, em 2 minutos.");
    } else if (answers.racao === "sache") {
      lines.push("Dá para colocar caldo e patê no lugar do sachê que ele recusa.");
    } else if (answers.racao === "terapeutica") {
      lines.push("Com ração terapêutica, converse com a veterinária antes de mudar qualquer coisa.");
    } else {
      lines.push("Você já mistura algo úmido. O e-book organiza 20 receitas seguras, sem tempero.");
    }
    if (answers.seletivo === "cheira" || answers.seletivo === "sache_nao") {
      lines.push("Para gato seletivo, o começo é uma colher de chá, morna, uma novidade de cada vez.");
    }
    if (answers.idade === "filhote" || answers.idade === "idoso") {
      lines.push("Filhote e idoso pedem o ok do veterinário. O material é educativo, não é tratamento.");
    }
    if (answers.casa === "dois" || answers.casa === "tres") {
      lines.push("Com mais de um gato, a receita pode ser a mesma. A quantidade muda para cada um.");
    }
    if (answers.tempo === "pouco") {
      lines.push("Tem topper de 2 minutos para os dias corridos.");
    }
    return lines.slice(0, 4);
  }

  function fillHidden() {
    ["agua", "racao", "seletivo", "idade", "casa", "tempo"].forEach(function (key) {
      var input = form.querySelector('[name="q_' + key + '"]');
      if (input) input.value = answers[key] || "";
    });
  }

  function showResult() {
    showPanel("result");
    progressLabel.textContent = "Pronto para receber o e-book";
    progressBar.setAttribute("aria-valuenow", String(questions.length));
    progressFill.style.width = "100%";
    var lines = resultLines();
    resultCopy.innerHTML =
      "<h2 id=\"result-title\" tabindex=\"-1\">A tigela dele pode ter mais água.</h2>" +
      lines.map(function (line) { return "<p>" + line + "</p>"; }).join("") +
      "<p class=\"result-offer\">Deixe seu e-mail e receba <strong>A Tigela que Hidrata</strong>: 20 receitas caseiras, por cima da ração que ele já come.</p>";
    var chips = ["agua", "racao", "seletivo", "idade", "casa", "tempo"].map(function (key) {
      var label = optionLabel(key, answers[key]);
      return label ? "<li>" + label + "</li>" : "";
    }).join("");
    resultChips.innerHTML = chips;
    fillHidden();
    var title = document.getElementById("result-title");
    if (title) title.focus();
    var cat = form.querySelector('[name="nomeGato"]');
    if (cat) {
      cat.addEventListener("input", function () {
        var heading = document.getElementById("result-title");
        var name = cat.value.trim();
        heading.textContent = name
          ? "A tigela de " + name + " pode ter mais água."
          : "A tigela dele pode ter mais água.";
      });
    }
  }

  document.getElementById("quiz-start").addEventListener("click", function () {
    step = 0;
    showPanel("questions");
    renderQuestion();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    fillHidden();
    var data = window.felinusReadLeadForm(form);
    var button = form.querySelector('[type="submit"]');
    button.disabled = true;
    var resultState = window.submitLead(data);
    if (!resultState.ok) {
      button.disabled = false;
      window.felinusApplyErrors(form, resultState.errors);
    }
  });
})();
