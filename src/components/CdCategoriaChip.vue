<template>
  <q-chip dense square class="cd-cat-chip" :style="{ '--c': cor }">
    <span class="cd-cat-dot" />{{ nome || '—' }}
  </q-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ nome?: string | null; cor?: string | null }>()

const PALETA = [
  '#613178',
  '#d82a76',
  '#8b5a96',
  '#3b82f6',
  '#43a047',
  '#f59e0b',
  '#0d9488',
  '#ef4444',
  '#5b6bb5',
  '#9b59b6'
]

// Usa a cor da categoria; se ausente, deriva uma cor estável do nome.
const cor = computed(() => {
  if (props.cor) return props.cor
  const s = props.nome ?? ''
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return PALETA[h % PALETA.length]
})
</script>

<style scoped>
.cd-cat-chip {
  background: color-mix(in srgb, var(--c) 14%, transparent);
  color: var(--c);
  font-weight: 600;
}
.cd-cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c);
  display: inline-block;
  margin-right: 6px;
}
</style>
