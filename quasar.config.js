/* eslint-env node */
import { defineConfig } from '#q-app/wrappers'
import { readFileSync, existsSync } from 'node:fs'

// Carrega variaveis do .env na raiz do projeto (nao versionado).
function carregarDotenv() {
  const vars = {}
  if (existsSync('.env')) {
    for (const linha of readFileSync('.env', 'utf-8').split('\n')) {
      const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) vars[m[1]] = m[2].trim()
    }
  }
  return vars
}
const dotenv = carregarDotenv()

export default defineConfig(function (/* ctx */) {
  return {
    boot: ['i18n', 'axios', 'vue-query', 'echarts'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: { browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'] },
      vueRouterMode: 'history',
      env: {
        API_URL: process.env.API_URL || dotenv.API_URL || 'http://localhost:8080'
      }
    },

    devServer: {
      open: true,
      port: 9000
    },

    framework: {
      config: {},
      plugins: ['Notify', 'Dialog', 'LoadingBar']
    },

    animations: [],

    pwa: {
      workboxMode: 'GenerateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
      manifest: {
        name: 'Contas Domesticas',
        short_name: 'Contas',
        description: 'Financas familiar/individual, compras e investimentos',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#1976d2',
        icons: [
          { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    }
  }
})
