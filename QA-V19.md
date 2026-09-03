# QA — AB Experience V19 — Sinal quente no vazio frio

## Conceito
A página inteira já falava a língua certa (gravidade, sinal, órbita,
memória) mas era emocionalmente monocromática — tudo em azul-frio, do
início ao fim. A mudança central da V19 é uma **única cor quente**
(`--signal`, um âmbar/coral) usada com extrema economia, só nos pontos em
que alguém realmente entra em contato: o botão de CTA, a palavra "AÇÃO" no
clímax da seção de conceitos, e o pulso de disponibilidade no hero.
Frio = vastidão/mistério do universo. Quente = o momento humano. O
contraste é o que puxa o olho — não decoração aleatória, é a metáfora do
site (gravidade puxa até você) aplicada à cor.

## O que mudou

1. **Pill de disponibilidade no hero** — "● Aberto a novos projetos", com
   pulso verde sutil. É o gatilho de confiança mais simples e eficaz em
   portfólio de freelancer: humaniza antes mesmo do headline carregar.
2. **Palavra "AÇÃO"** (última da sequência ATRAÇÃO/RITMO/PRESENÇA/
   MEMÓRIA/AÇÃO) agora acende na cor de sinal — é o clímax emocional da
   seção, literalmente o convite para agir.
3. **Serviços viraram cards, não lista** — cada um com ícone próprio
   (alvo, estrela, órbita, onda — ligados ao que cada serviço realmente
   entrega), brilho que segue o cursor e leve inclinação 3D no hover
   (ponteiro fino). Lista de texto puro escaneia mal; cards com ícone e
   resposta ao movimento prendem a atenção e comunicam mais rápido.
4. **Botão de CTA "esquenta"** — o disco central que era azul-frio ganhou
   um núcleo âmbar; é o único objeto quente da experiência inteira, o que
   o torna impossível de ignorar sem precisar de tamanho ou piscar.
5. **Barra de progresso de scroll** — linha fina no topo, gradiente azul→
   sinal, mostra o quanto falta da "trajetória". Reduz a ansiedade de "até
   onde isso vai" e reforça visualmente o conceito de jornada que o
   Núcleo AB já representa.

## O que não mudou
- Estrutura, seções, textos principais, arcade, buraco negro e trilha
  sonora — a identidade continua sendo 100% a mesma experiência espacial.
- Todos os elementos novos entram pelo mesmo sistema de reveal em scroll
  já existente (V18), com fallback seguro caso GSAP não carregue.
- Nenhum novo listener de touch/drag; hover 3D dos cards só roda em
  ponteiro fino (`hover:hover` e `pointer:fine`).

## Validação
- Todos os módulos em `assets/js/` passam em `node --check`.
- `prefers-reduced-motion` cobre os elementos novos (pill, glow dos
  cards desativado — sem tilt/rotate).
