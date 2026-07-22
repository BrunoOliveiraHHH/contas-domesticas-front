<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="cd-header">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="row items-center no-wrap">
          <q-icon name="account_balance_wallet" class="q-mr-sm" />
          {{ t('app.nome') }}
        </q-toolbar-title>
        <q-btn
          flat
          dense
          round
          :icon="dark ? 'light_mode' : 'dark_mode'"
          :aria-label="dark ? t('comum.temaClaro') : t('comum.temaEscuro')"
          @click="alternarTema"
        />
        <q-btn flat dense round icon="logout" :aria-label="t('comum.sair')" @click="sair" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list padding>
        <q-item-label header class="cd-section-title">Menu</q-item-label>
        <q-item v-for="l in links" :key="l.label" clickable :to="l.to" exact>
          <q-item-section avatar><q-icon :name="l.icon" /></q-item-section>
          <q-item-section>{{ l.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'
import { usePreferenciasStore } from 'stores/preferencias'

const { t } = useI18n()
const $q = useQuasar()
const preferencias = usePreferenciasStore()
onMounted(() => {
  preferencias.carregar()
})
const leftDrawerOpen = ref(false)
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// Tema (claro/escuro) — persistido em localStorage
const dark = ref(localStorage.getItem('cd_dark') === '1')
$q.dark.set(dark.value)
function alternarTema() {
  dark.value = !dark.value
  $q.dark.set(dark.value)
  localStorage.setItem('cd_dark', dark.value ? '1' : '0')
}

// Menu (labels via i18n)
const links = [
  { label: t('nav.dashboard'), icon: 'dashboard', to: '/' },
  { label: t('nav.receitas'), icon: 'trending_up', to: '/receitas' },
  { label: t('nav.despesas'), icon: 'trending_down', to: '/despesas' },
  { label: t('nav.recorrencias'), icon: 'autorenew', to: '/recorrencias' },
  { label: t('nav.parcelamento'), icon: 'credit_card', to: '/parcelamento' },
  { label: t('nav.divisao'), icon: 'groups', to: '/divisao' },
  { label: t('nav.carteiras'), icon: 'account_balance_wallet', to: '/carteiras' },
  { label: t('nav.categorias'), icon: 'category', to: '/categorias' },
  { label: t('nav.formasPagamento'), icon: 'payments', to: '/formas-pagamento' },
  { label: t('nav.mercados'), icon: 'store', to: '/mercados' },
  { label: t('nav.unidades'), icon: 'straighten', to: '/unidades-medida' },
  { label: t('nav.produtos'), icon: 'inventory_2', to: '/produtos' },
  { label: t('nav.compras'), icon: 'shopping_cart', to: '/listas-compra' },
  { label: t('nav.investimentos'), icon: 'savings', to: '/investimentos' },
  { label: t('nav.calculadoras'), icon: 'calculate', to: '/calculadoras' },
  { label: t('nav.configuracao'), icon: 'settings', to: '/configuracao' },
  { label: t('nav.sincronizacao'), icon: 'sync', to: '/sincronizacao' }
]

const router = useRouter()
const auth = useAuthStore()
const sair = () => {
  auth.logout()
  router.push('/login')
}
</script>
