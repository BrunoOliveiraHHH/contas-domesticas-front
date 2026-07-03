import { register } from 'register-service-worker'
import { Notify } from 'quasar'

// Registro do service worker (modo PWA). Ver quasar.config.js > pwa.
register(process.env.SERVICE_WORKER_FILE, {
  ready() {
    // App servido do cache por um service worker
  },
  registered(/* registration */) {},
  cached(/* registration */) {},
  updatefound(/* registration */) {},
  updated(/* registration */) {
    Notify.create({
      message: 'Nova versao disponivel. Recarregue a pagina.',
      color: 'primary',
      actions: [{ label: 'Recarregar', color: 'white', handler: () => location.reload() }],
      timeout: 0
    })
  },
  offline() {
    Notify.create({ message: 'Sem conexao. App em modo offline.', color: 'warning' })
  },
  error(/* err */) {}
})
