/* eslint-env node */
import { configure } from 'quasar/wrappers'

export default configure(function (/* ctx */) {
  return {
    boot: ['i18n', 'axios', 'vue-query', 'echarts'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: { browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'] },
      vueRouterMode: 'hash',
      env: {
        API_URL: process.env.API_URL || 'http://localhost:8080'
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
