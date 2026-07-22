<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="cd-header">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="row items-center no-wrap">
          <q-icon name="account_balance_wallet" class="q-mr-sm" />
          Contas Domesticas
        </q-toolbar-title>
        <q-btn
          flat
          dense
          round
          :icon="dark ? 'light_mode' : 'dark_mode'"
          :aria-label="dark ? 'Tema claro' : 'Tema escuro'"
          @click="alternarTema"
        />
        <q-btn flat dense round icon="logout" aria-label="Sair" @click="sair" />
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()
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

// Menu (vai crescendo conforme as features sao adicionadas)
const links = [
  { label: 'Dashboard', icon: 'dashboard', to: '/' },
  { label: 'Receitas', icon: 'trending_up', to: '/receitas' },
  { label: 'Despesas', icon: 'trending_down', to: '/despesas' },
  { label: 'Recorrencias', icon: 'autorenew', to: '/recorrencias' },
  { label: 'Parcelamento', icon: 'credit_card', to: '/parcelamento' },
  { label: 'Rateio', icon: 'groups', to: '/rateio' },
  { label: 'Carteiras', icon: 'account_balance_wallet', to: '/carteiras' },
  { label: 'Categorias', icon: 'category', to: '/categorias' },
  { label: 'Formas de pagamento', icon: 'payments', to: '/formas-pagamento' },
  { label: 'Mercados', icon: 'store', to: '/mercados' },
  { label: 'Unidades', icon: 'straighten', to: '/unidades-medida' },
  { label: 'Produtos', icon: 'inventory_2', to: '/produtos' },
  { label: 'Compras', icon: 'shopping_cart', to: '/listas-compra' },
  { label: 'Investimentos', icon: 'savings', to: '/investimentos' },
  { label: 'Calculadoras', icon: 'calculate', to: '/calculadoras' },
  { label: 'Configuracao', icon: 'settings', to: '/configuracao' },
  { label: 'Sincronizacao', icon: 'sync', to: '/sincronizacao' }
]

const router = useRouter()
const auth = useAuthStore()
const sair = () => {
  auth.logout()
  router.push('/login')
}
</script>
