# QA — AB Experience V20 — Luz no vazio

## Conceito
Se a V19 acendeu um sinal quente nos pontos de contato, a V20 escurece
tudo em volta dele — e dá ao visitante o controle de uma luz própria. O
cursor deixa de ser só um ponteiro: é uma tocha levada pelo vazio, um
círculo de luz suave (screen blend) que acompanha o mouse e revela o
universo ao redor dele, enquanto o resto da tela fica mais escuro e mais
contido do que nas versões anteriores. Mistério = o que não se vê
imediatamente; a luz do cursor é o convite a explorar.

## O que mudou

1. **Luz do cursor** (`cursor-light.js` + `.cursor-light`) — círculo de luz
   fixo que segue o ponteiro via `transform: translate3d`, `mix-blend-mode:
   screen` (só clareia, nunca times a interface). Só existe em ponteiro
   fino; em touch não há cursor, então a tela permanece escura sem ele —
   nenhuma tentativa de simular o efeito com toque, que ficaria artificial.
2. **Vinheta mais escura e mais contrastada** — as bordas da tela agora vão
   a quase preto puro; o buraco negro e a luz do cursor são os únicos
   pontos que "furam" essa escuridão.
3. **Bloom e luzes da cena reduzidos** (~25–30% menos intensos em todos os
   perfis gráficos) — menos "neon", mais sombra. O universo aparece por
   contraste, não por brilho constante.
4. **Núcleo AB mais enxuto** — a mira em cruz (`jc-cross`) foi removida; o
   elemento virou só um anel + ponto, uma fagulha discreta em vez de um
   HUD literal. O rótulo (`ORIGIN/AB`, `GRAVITY/01`...) continua existindo
   mas mais discreto, e só destaca no hover.
5. **CTA com um anel orbital a menos** — de três para dois, menos ruído
   visual ao redor do botão, sem perder a sensação de órbita/transmissão.
6. **Painéis (hologramas, cards de serviço) mais escuros e com bordas mais
   discretas** — menos "vidro futurista brilhante", mais silhueta na
   penumbra.

## O que não mudou
- Toda a estrutura, textos, arcade, trilha sonora e sistema de reveal em
  scroll das versões anteriores.
- A cor de sinal (âmbar) continua reservada aos mesmos pontos de contato
  — agora ela contrasta ainda mais forte contra um fundo mais escuro.

## Validação
- Todos os módulos em `assets/js/` passam em `node --check`.
- Luz do cursor é `pointer-events:none` (nunca bloqueia cliques) e some
  automaticamente em `prefers-reduced-motion`, `pointer:coarse` e
  `hover:none` — tanto via JS quanto via CSS, com redundância proposital.
- Nenhum novo listener de touch/drag adicionado.
