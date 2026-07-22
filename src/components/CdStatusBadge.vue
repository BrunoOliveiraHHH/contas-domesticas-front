<template>
  <q-badge :color="cfg.cor" class="cd-status">
    <q-icon :name="cfg.icone" size="12px" class="q-mr-xs" />{{ cfg.label }}
  </q-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status?: string | null }>()

const MAP: Record<string, { cor: string; icone: string; label: string }> = {
  PAGO: { cor: 'positive', icone: 'check_circle', label: 'Pago' },
  PENDENTE: { cor: 'warning', icone: 'schedule', label: 'Pendente' },
  ATRASADO: { cor: 'negative', icone: 'warning', label: 'Atrasado' }
}

const cfg = computed(
  () => MAP[props.status ?? ''] ?? { cor: 'grey-5', icone: 'remove', label: props.status || '—' }
)
</script>

<style scoped>
.cd-status {
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 700;
}
</style>
