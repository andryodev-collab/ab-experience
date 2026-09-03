# QA — AB Experience V14 Final Architecture

## Objetivo

Concluir a experiência mantendo universo, profundidade, buraco negro, Núcleo AB, hologramas, arcade e CTA, mas garantindo scroll nativo livre e comportamento consistente entre desktop, tablet, mobile portrait e landscape.

## Responsividade testada

Layout/CSS verificado em Chrome via DevTools Protocol com conteúdo local/inlined nas seguintes viewports:

- 320×720
- 390×844
- 430×932
- 844×390 (landscape)
- 932×430 (landscape)
- 820×1180
- 1024×768
- 1366×768
- 1440×900
- 1920×1080

Resultado: `scrollWidth === clientWidth` em todas as viewports testadas. Nenhum overflow horizontal global.

### Medições representativas

- 390×844: página ~7733 px; hero 844 px; hologramas ~1156 px. A abertura ocupa espaço físico, sem pin/sticky.
- 844×390 landscape: abertura ~848 px, dividida em hero ~415 px + hologramas ~433 px.
- 1440×900: abertura ~1845 px, hero ~900 px + estágio holográfico ~945 px.

## Invariantes de scroll/input

Verificado por análise automatizada:

- `position: sticky`: **0**
- `touch-action:none`: **0**
- `body.style.overflow` para bloquear scroll: **0**
- `scrub` numérico com catch-up: **0**
- Draggable: **0**
- cards holográficos: `pointer-events:none`
- arcade: `touch-action:pan-y`
- intro: não captura o gesto e cede imediatamente ao scroll

## Performance

- estrelas/poeira continuam em shaders GPU;
- três perfis: `efficient`, `balanced`, `high`;
- perfil considera touch/coarse pointer, memória e hardware concurrency;
- DPR limitado por cap e por orçamento total de pixels;
- antialias só no perfil high/fine pointer;
- bloom preservado com intensidade por perfil;
- contagem de partículas/asteroides adequada ao perfil;
- WebGL cai para ~30 FPS enquanto AB-01 está ativo;
- AB-01 é lazy-loaded por proximidade;
- áudio só recebe `src` quando o usuário ativa;
- animações holográficas/CTA só rodam perto da viewport;
- imagens CSS espaciais são fallback e não compõem simultaneamente com WebGL em estado normal.

## UX/UI

- abertura mobile/tablet transformada em fluxo físico;
- cards ficam um abaixo do outro em coarse pointer/mobile;
- cada holograma entra, revela conteúdo, ganha profundidade e recua conforme seu próprio scroll;
- mobile sem blur caro nos hologramas/header;
- statement mantém `ATRAÇÃO / RITMO / PRESENÇA / MEMÓRIA / AÇÃO` sem pinning;
- timeline vertical no mobile/coarse pointer e horizontal no desktop fine pointer;
- CTA mobile reorganizado para legibilidade/conversão;
- landscape recebe composição compacta;
- ordem do menu segue a ordem física: Início → Serviços → Sobre → Processo → Contato.

## Acessibilidade/robustez

- skip link para conteúdo;
- menu alterna `Abrir menu` / `Fechar menu` e fecha com Escape;
- `role="application"` removido do arcade;
- teclado do jogo só é interceptado durante a missão e com foco no campo;
- `aria-live` do jogo reservado a estados importantes (tiros individuais não são anunciados);
- `prefers-reduced-motion` possui fallback visual completo;
- watchdog inline remove intro e mostra hero/header se runtime externo falhar;
- `webglcontextlost` ativa fallback estático;
- HTML sem IDs duplicados;
- referências locais sem arquivos ausentes;
- todos os módulos JS passam em `node --check`;
- CSS com chaves balanceadas.

## Limitação do teste

O ambiente permite testar o layout real em Chrome via conteúdo inlined, mas bloqueia navegação HTTP/file dentro do Chromium para o projeto completo e não disponibiliza as dependências externas durante esse teste. Portanto, a composição CSS/responsiva foi retestada visualmente, enquanto WebGL/GSAP runtime foi validado por código/invariantes, não por captura final da cena Three.js neste ambiente.

Antes do lançamento público, recomenda-se um último smoke test em:

1. iPhone Safari real;
2. Android Chrome intermediário;
3. notebook com GPU integrada;
4. desktop 1440p.

O teste deve confirmar apenas sensação/ritmo e não requerer mudança estrutural se os invariantes acima forem mantidos.
