<template>
  <q-page class="flex flex-center column q-pa-md">
    <q-icon name="account_balance_wallet" size="64px" color="primary" />
    <div class="text-h5 q-mt-md">Contas Domesticas</div>
    <div class="text-subtitle2 text-grey">Frontend Vue 3 + Quasar + TypeScript</div>
    <div class="text-caption q-mt-sm">API: {{ apiUrl }}</div>
  </q-page>
</template>

<script setup lang="ts">
const apiUrl = (process.env.API_URL || 'http://localhost:8080') + '/api/v1'
</script>
