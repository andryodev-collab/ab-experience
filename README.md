# AB — Andryo Barbosa / Interactive Digital Direction

## V20 — Luz no vazio
Cursor vira uma luz que revela o universo ao redor dele (só ponteiro fino); resto da tela mais escuro e contido, bloom/luzes reduzidos, Núcleo AB e CTA mais enxutos. Ver `QA-V20.md`.

## V19 — Sinal quente no vazio frio
Uma única cor quente (âmbar) reservada para os pontos de contato: CTA, palavra "AÇÃO" e pill de disponibilidade. Serviços viraram cards com ícone, glow no cursor e tilt 3D. Barra de progresso de scroll no topo. Ver `QA-V19.md`.

## V18 — Lean & Realismo
Reveal de texto dividido em dois modos (letra por letra só em títulos; parágrafos em fade único), nebulosa mesclada em um único draw call, estrelas com twinkle e temperatura de cor, disco de acreção com assimetria de brilho angular. Ver `QA-V18.md`.

## V15 — Mobile Hologram & Statement Rhythm

A V15 mantém a arquitetura livre da V14 e refina especificamente o mobile: hologramas menores, centralizados e em coluna, além de uma cadência de leitura mais lenta para ATRAÇÃO / RITMO / PRESENÇA / MEMÓRIA / AÇÃO. O universo permanece fixo e interativo ao fundo e nenhuma dessas cenas captura o scroll.

### Estrutura

- `index.html` — conteúdo, SEO base, acessibilidade e watchdog de fallback.
- `assets/css/main.css` — CSS de produção reescrito, sem camadas de versões antigas.
- `assets/js/main.js` — bootstrap, lazy loading, resize e lifecycle.
- `assets/js/config.js` — breakpoints, perfil gráfico e WhatsApp.
- `assets/js/space.js` — Three.js, buraco negro, estrelas, poeira, nebulosa, asteroides e profundidade global.
- `assets/js/intro.js` — loading minimalista e skip imediato por scroll.
- `assets/js/motion.js` — revelações físicas por scroll e timeline.
- `assets/js/journey.js` — trajetória global única do Núcleo AB.
- `assets/js/game.js` — AB-01, carregado sob demanda.
- `assets/js/audio.js` — trilha opt-in, carregada somente após ativação.
- `assets/js/ui.js` — menu acessível, CTA e estados de interface.
- `assets/audio/ab-cosmic-score.mp3` — trilha original.
- `assets/images/favicon.svg` / `ab-social.jpg` — identidade/preview.
- `_headers` — headers para Cloudflare Pages sem cache imutável em arquivos sem hash.
- `robots.txt` — rastreamento base.
- `QA-V15.md` — relatório do refinamento mobile e validação técnica.

## Base preservada da V14

- Zero `position: sticky` narrativo.
- Zero `touch-action:none`.
- Zero bloqueio de `body` durante a intro.
- Hologramas são conteúdo físico e não recebem eventos de ponteiro.
- Timeline acompanha o conteúdo; não segura a página.
- Núcleo AB usa uma única trajetória global, evitando timelines concorrentes.
- Perfis gráficos `efficient`, `balanced` e `high` independem apenas da largura da tela.
- DPR limitado também por orçamento total de pixels.
- Mobile/coarse pointer sem backdrop blur pesado no header/cards.
- Landscape compacto para telas baixas.
- CSS consolidado de produção, sem overrides V10/V11/V12/V13.
- Arcade não usa `role="application"` e só captura teclado quando está focado/rodando.
- Áudio é opt-in e `preload="none"`.
- Fallback inline funciona mesmo se GSAP/Three/CDN não responderem.


## Refinamentos da V15

- Cards mobile reduzidos para no máximo 80vw / 330px em telas estreitas.
- Hologramas sempre centralizados e um abaixo do outro em dispositivos coarse/touch, inclusive landscape.
- Removido avanço em Z positivo e deslocamento lateral dos cards no mobile, evitando corte de bordas.
- Revelação interna dos cards desacelerada: SIGNAL → título → linha → texto.
- `ATRAÇÃO / RITMO / PRESENÇA / MEMÓRIA / AÇÃO` agora ocupam blocos físicos de leitura de 42–44svh no portrait.
- Cada palavra entra, permanece e sai suavemente conforme o usuário realmente chega ao seu trecho.
- Nenhum sticky, pin, Draggable ou captura de touch foi reintroduzido.

## Rodar localmente

ES Modules precisam de servidor HTTP:

```bash
python -m http.server 8080
```

Depois abra `http://localhost:8080`.

## Publicação

A pasta pode ser publicada diretamente via GitHub + Cloudflare Pages.

O WhatsApp está configurado para `5521981507521` em `assets/js/config.js` e também existe como fallback no HTML.

Quando o domínio definitivo estiver definido, completar:

- `canonical`
- `og:url`
- URL absoluta de `og:image`
- `sitemap.xml`
- referência ao sitemap em `robots.txt`


## V17 — Fade rhythm
- Hero: kicker, headline and supporting paragraph reveal with opacity-only fades.
- Statement words: opacity-only fade in / hold / fade out tied to scroll.
- No translate, blur or scale used for these text reveals.


## V17 — Letter Fade
Toda a copy narrativa principal agora é escrita letra por letra em fade conforme o scroll. Controles funcionais (menu, botões, placar e estados do arcade) permanecem imediatos para preservar usabilidade.
