# AB Experience

Landing page/experiência digital autoral de Andryo Barbosa (AB), construída com HTML, CSS, JavaScript, GSAP/ScrollTrigger e Three.js/WebGL.

## V17

- Universo WebGL interativo com profundidade e resposta ao scroll.
- Buraco negro e campo espacial contínuos ao longo da experiência.
- Scroll nativo e livre, sem sticky narrativo ou scroll hijacking.
- Hologramas responsivos em fluxo físico no mobile.
- Copy narrativa revelada letra por letra em fade conforme o scroll.
- Arcade AB-01 carregado sob demanda.
- Trilha ambiente opt-in.
- Perfis gráficos efficient / balanced / high.
- Acessibilidade, reduced motion e fallbacks básicos.

## Estrutura

- `index.html`
- `assets/css/main.css`
- `assets/js/`
- `assets/images/`
- `assets/audio/`
- `_headers` (Cloudflare Pages)
- `robots.txt`

## Desenvolvimento local

Como o projeto usa ES Modules, sirva a pasta por HTTP:

```bash
python -m http.server 8080
```

Depois abra `http://localhost:8080`.

## Deploy

Projeto estático preparado para GitHub + Cloudflare Pages. Não requer comando de build; a saída é a raiz do repositório.

Quando o domínio definitivo estiver definido, completar `canonical`, `og:url`, URL absoluta de `og:image` e `sitemap.xml`.
