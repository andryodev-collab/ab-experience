# QA — AB Experience V17

## Alteração
- Sistema central `text-reveal.js` para revelar a copy narrativa letra por letra via ScrollTrigger.
- Hero, hologramas, palavras conceituais, serviços, arcade intro, sobre, processo, CTA e assinatura final usam o mesmo princípio.
- Menu, botões, placar e estados do jogo são excluídos para preservar interação imediata.
- Nenhum deslocamento é aplicado às letras: apenas opacity.
- `prefers-reduced-motion` exibe todo o texto imediatamente.
- Fallback de aplicação também força caracteres visíveis.

## Validação
- 31 IDs, todos únicos.
- Referências locais do HTML presentes.
- Todos os módulos em `assets/js/` passam em `node --check`.
- 52 blocos narrativos selecionados, ~1.674 caracteres não-espaço no efeito.
- Não foram adicionados listeners de touch, drag ou scroll blocking.
- O teste visual headless não concluiu neste ambiente (Chromium travou na inicialização), portanto o runtime visual deve ser conferido no navegador real como nas versões anteriores.
