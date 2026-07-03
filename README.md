# contas-domesticas-front

Frontend web do projeto **Contas Domesticas** — **Vue 3 + Quasar CLI (Vite)**.

## Proposito

Interface web que consome a **API local** do Contas Domesticas. Cobre financas (familiar/individual
por carteira), **compras** (catalogo de produtos, cotacao por estabelecimento, comparar/escolher,
fechar por loja, reutilizar listas), **investimentos**, **calculadoras**, **Configuracao**
parametrizavel e **Dashboard**. Diferente do app Android (offline-first), o front e **online** — fala
direto com a API, sem banco local nem sincronizacao.

## Stack

- Vue 3 (`<script setup>`, Composition API)
- Quasar v2 (CLI Vite) — `@quasar/app-vite`
- Pinia (estado) · Vue Router · Axios (boot com interceptors)
- Vitest (unit) · Cypress (e2e, a configurar)

## Estrutura

```
src/
├── boot/axios.js         # instancia Axios (baseURL da API + Bearer/refresh)
├── layouts/MainLayout.vue
├── pages/                # IndexPage, LoginPage, ErrorNotFound, ...
├── router/               # index.js + routes.js (guarda de rota)
├── stores/               # Pinia (auth, ...)
├── services/             # chamadas a API por feature
├── composables/          # calculadoras, etc.
└── css/                  # app.scss, quasar.variables.scss
```

## Configuracao

A URL da API vem de `API_URL` (padrao `http://localhost:8080`), usada em `quasar.config.js` e no
boot do Axios (o cliente concatena `/api/v1`).

## Rodar

```bash
npm install
npm run dev      # quasar dev (http://localhost:9000)
npm run build    # quasar build -> dist/
```

> Requer a **API** (`contas-domesticas-api`) rodando em `localhost:8080`.

## Documentacao

- Roadmap: `contas-domesticas-documentacao/PLANO-frontend.md`.
- Tarefas (blocos + tarefas junior): `contas-domesticas-documentacao/sprint-*/frontend/`.
