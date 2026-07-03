# contas-domesticas-front

Frontend web do projeto **Contas Domesticas** — **Vue 3 + Quasar (app-vite v2) + TypeScript**.

## Proposito

Interface web que consome a **API local** do Contas Domesticas. Cobre financas (familiar/individual
por carteira), **compras** (catalogo de produtos, cotacao por estabelecimento, comparar/escolher,
fechar por loja, reutilizar listas), **investimentos**, **calculadoras**, **Configuracao**
parametrizavel e **Dashboard**. Diferente do app Android (offline-first), o front e **online** — fala
direto com a API, sem banco local nem sincronizacao (o modo PWA da cache/instalavel, nao sync).

## Stack

- **Node 24** (ver `.nvmrc` — use com NVS: `nvs use 24` ou `nvs auto`)
- **Vue 3** (`<script setup lang="ts">`, Composition API) + **TypeScript**
- **Quasar v2** — `@quasar/app-vite` **v2** (wrappers `#q-app/wrappers`)
- **Pinia** (estado) com `pinia-plugin-persistedstate` · **Vue Router** · **Axios** (+ `axios-retry`)
- **@tanstack/vue-query** (estado de servidor) · **@vueuse/core**
- **vee-validate + zod** (validacao) · **big.js** (dinheiro) · **date-fns** (datas)
- **ECharts** + `vue-echarts` (graficos) · **vue-i18n** (pt-BR)
- **PWA** (Quasar PWA mode) — `npm run build:pwa`
- **Vitest** (+ `@vue/test-utils`, `@pinia/testing`, jsdom) · **Cypress** (e2e)
- **ESLint + Prettier** · **husky + lint-staged** (pre-commit)

## Estrutura

```
src/
├── boot/                 # axios (Bearer/refresh + retry), vue-query, i18n, echarts (<v-chart>)
├── layouts/MainLayout.vue
├── pages/                # IndexPage, LoginPage, ErrorNotFound, ...
├── router/               # index.ts + routes.ts (guarda de rota)
├── stores/               # Pinia (auth persistida, ...)
├── services/             # chamadas a API por feature
├── composables/          # calculadoras, etc.
├── i18n/                 # mensagens (pt-BR)
├── util/                 # money.ts (big.js), date.ts (date-fns)
└── css/                  # app.scss, quasar.variables.scss
src-pwa/                  # service worker (modo PWA)
test/                     # unit (Vitest) + cypress (e2e)
```

## Configuracao

A URL da API vem de `API_URL` (padrao `http://localhost:8080`), usada em `quasar.config.js` e no
boot do Axios (o cliente concatena `/api/v1`).

## Rodar

```bash
nvs use 24        # ou: nvs auto  (le o .nvmrc)
npm install
npm run typecheck # vue-tsc --noEmit
npm run dev       # quasar dev (http://localhost:9000)
npm run build     # quasar build -> dist/
npm run build:pwa # build no modo PWA
npm run test:unit # vitest
npm run lint
```

> Requer a **API** (`contas-domesticas-api`) rodando em `localhost:8080`.

## Documentacao

- Roadmap: `contas-domesticas-documentacao/PLANO-frontend.md`.
- Tarefas (blocos + tarefas junior): `contas-domesticas-documentacao/sprint-*/frontend/`.
