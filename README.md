# Felinus — isca digital

Site estático da isca *A Tigela que Hidrata* (quiz, captura e obrigado com tripwire). Pensado para GitHub Pages na raiz do repositório: `https://marcos4213.github.io/felinus-isca/`.

Caminhos relativos. O arquivo `.nojekyll` está na raiz.

## Páginas

- `index.html` — hub de revisão
- `quiz.html` — captura com quiz (candidata principal)
- `captura.html` — captura estática, para comparar
- `obrigado.html` — tripwire versão A (ganho). Versão B (perda): `obrigado.html?v=b`

## O que configurar

Edite o objeto `FELINUS_CONFIG` no topo de `js/shared.js`.

Placeholders atuais: `[LINK_CHECKOUT_37]` e `[LINK_PDF]`.

O envio do formulário está em `submitLead()`. A integração com o Brevo está marcada como TODO: hoje o lead é validado, salvo no `localStorage` e a página segue para `obrigado.html`.

O contador de 48h grava a primeira visita a `obrigado.html` neste navegador (`felinus_offer_started_at`) e não reinicia.

Selos amarelos `[CONFIRMAR]` ficam visíveis de propósito, para revisão antes de publicar.
