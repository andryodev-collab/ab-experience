# QA — AB Experience V18 — Lean & Realismo

## Objetivo
Reduzir peso e custo de execução mantendo 100% da identidade visual (paleta,
tipografia, ritmo de scroll, buraco negro, arcade, letter-reveal nos títulos),
e tornar os efeitos espaciais mais fisicamente plausíveis.

## Alterações

### 1. Reveal de texto — DOM 5-10x mais leve
`text-reveal.js` quebrava **todo** bloco narrativo (inclusive parágrafos
longos) em um `<span>` por letra, animado individualmente via GSAP
ScrollTrigger — ~1.674 caracteres viravam ~1.674 nós de DOM + tweens.
Agora existem dois modos:
- **`chars`** (letra por letra): mantido só em títulos e blocos curtos de
  alto impacto — hero, kickers, section-titles, palavras da seção
  "statement", h3 dos cards/serviços — onde o efeito realmente é notado.
- **`fade`** (bloco único, opacity): parágrafos longos (hero p, hud small,
  service p, playground p, about p, cta-copy) agora fazem um único tween de
  opacity por elemento, sem split de DOM. Mesmo ritmo de leitura ao rolar,
  fração do custo de layout/paint e de instâncias de ScrollTrigger.
- Função morta `revealTimeline` (nunca chamada) removida.

### 2. Nebulosa — menos draw calls
`space.js` criava de 3 a 6 objetos `THREE.Points` separados (um por coluna
de nebulosa), cada um com seu próprio draw call. Agora todas as colunas
viram uma única `BufferGeometry` com atributo de cor por vértice — 1 draw
call no lugar de até 6, mesmo visual.

### 3. Fontes — menos um arquivo de peso
Google Fonts carregava Inter 300/400/500/**600**, mas o peso 600 do Inter
nunca é usado no CSS (só Orbitron usa 600). Removido da URL de import.

### 4. Efeitos espaciais mais realistas
- **Estrelas**: ganharam variação de temperatura de cor por partícula (azul-
  frio → branco-quente, como em um campo estelar real) e cintilação
  (`twinkle`) via fase individual — antes todas as estrelas eram um ponto
  branco fixo e uniforme.
- **Disco de acréscimo do buraco negro**: ganhou assimetria de brilho
  angular (aproximação do *relativistic beaming*/efeito Doppler que discos
  de acréscimo reais exibem — um lado do disco mais brilhante que o outro),
  no lugar do brilho uniforme em todo o anel.

## Não alterado (já estava bem resolvido)
- Zero `position: sticky` narrativo, zero bloqueio de scroll/touch.
- Perfis gráficos `efficient` / `balanced` / `high` por memória+CPU, DPR
  limitado por orçamento de pixels.
- Lazy load do arcade via `IntersectionObserver`, áudio `preload="none"`.
- Fallback estático caso WebGL/CDN falhem.
- Responsividade: os breakpoints (mobile, tablet/coarse, landscape baixo,
  ≤480px) já cobriam bem os casos reais e não foram tocados.

## Validação
- Todos os módulos em `assets/js/` passam em `node --check`.
- Nenhum listener de touch, drag ou scroll-blocking foi adicionado.
- `prefers-reduced-motion` continua exibindo todo o texto imediatamente
  (cobre também o novo modo `fade`).
- Teste visual em navegador real segue sendo o passo recomendado, como nas
  versões anteriores (sem ambiente de browser headless disponível aqui).
