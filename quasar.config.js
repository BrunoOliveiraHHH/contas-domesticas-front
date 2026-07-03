/* eslint-env node */
import { configure } from 'quasar/wrappers'

export default configure(function (/* ctx */) {
  return {
    boot: ['axios'],

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

    animations: []
  }
})
