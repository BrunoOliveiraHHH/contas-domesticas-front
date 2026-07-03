/* eslint-disable */
declare namespace NodeJS {
  interface ProcessEnv {
    API_URL: string
    VUE_ROUTER_MODE: 'hash' | 'history'
    VUE_ROUTER_BASE: string
    SERVER: boolean
    CLIENT: boolean
    DEV: boolean
    PROD: boolean
    SERVICE_WORKER_FILE: string
  }
}
