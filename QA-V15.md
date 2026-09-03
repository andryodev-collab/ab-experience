# QA — AB Experience V15 / Mobile Hologram & Statement Rhythm

## Objetivo

Corrigir o corte visual dos hologramas em telas estreitas e desacelerar a leitura de `ATRAÇÃO / RITMO / PRESENÇA / MEMÓRIA / AÇÃO`, mantendo scroll nativo, profundidade do universo e arquitetura livre da V14.

## Cards holográficos no mobile/coarse pointer

- continuam como conteúdo físico da página;
- `pointer-events:none` permanece;
- largura mobile reduzida para `min(80vw, 330px)` em até 480 px;
- largura coarse/tablet limitada a `min(82vw, 350px)`;
- todos ficam centralizados e em coluna;
- `transform-origin` centralizado;
- mobile não recebe mais deslocamento lateral durante entrada/saída;
- mobile não recebe Z positivo nem rotação Y, evitando expansão/corte nas bordas;
- profundidade do card mobile passa a ser escala + opacidade + luz holográfica;
- conteúdo interno revela em sequência mais lenta: SIGNAL → título → linha → texto → saída;
- landscape touch/coarse também permanece em coluna, sem voltar à grade 2×2.

## Statement mobile

- cada palavra ocupa um bloco físico de aproximadamente 42–44svh em portrait;
- landscape coarse usa blocos de 62svh para manter ritmo em telas baixas;
- entrada: opacity + translate + scale, sem blur pesado;
- palavra permanece visível por um trecho antes de perder intensidade;
- próxima palavra só assume quando o usuário efetivamente chega ao seu bloco;
- não existe pin, sticky ou trava de scroll.

## Validação técnica

- todos os módulos JS passam `node --check`;
- HTML parseado sem erro;
- CSS com chaves balanceadas;
- regras mobile dos cards confirmadas;
- regras de espaçamento/altura das palavras confirmadas;
- Draggable continua ausente;
- não foi adicionado `touch-action:none` ou bloqueio de `body`.

## Limitação do ambiente

O Chromium desta sandbox bloqueou navegação HTTP/file para o projeto durante este passe, então não foi possível gerar um novo smoke test completo do runtime GSAP/WebGL. A revisão desta V15 foi feita sobre a V14 já auditada, com validação estática das regras alteradas e sintaxe dos módulos.

Antes de publicar, validar em um celular real principalmente:

1. bordas esquerda/direita dos quatro hologramas durante toda a entrada e saída;
2. leitura individual das cinco palavras em um swipe lento;
3. swipe rápido atravessando a seção para confirmar que nada segura a navegação.
