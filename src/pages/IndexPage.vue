<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6 text-weight-bold" style="color: var(--cd-primary)">Dashboard</div>
      <q-space />
      <q-input
        v-model="periodo"
        type="month"
        dense
        outlined
        label="Periodo"
        style="max-width: 180px"
        @update:model-value="recarregar"
      />
    </div>

    <!-- KPIs em gradiente (identico ao projeto anterior) -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-3">
        <div class="cd-kpi rec">
          <div class="cd-kpi-label">Receitas</div>
          <div class="cd-kpi-value">{{ brl(store.saldo?.receitas ?? 0) }}</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <div class="cd-kpi sai">
          <div class="cd-kpi-label">Despesas</div>
          <div class="cd-kpi-value">{{ brl(store.saldo?.despesas ?? 0) }}</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <div class="cd-kpi sal">
          <div class="cd-kpi-label">Saldo</div>
          <div class="cd-kpi-value">{{ brl(store.saldo?.saldo ?? 0) }}</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <div class="cd-kpi comp">
          <div class="cd-kpi-label">Comprometimento</div>
          <div class="cd-kpi-value">{{ comprometimento }}%</div>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-none">
      <div class="col-12 col-md-4">
        <q-card flat class="cd-card full-height">
          <q-card-section>
            <div class="cd-section-title q-mb-sm">Patrimonio investido</div>
            <div class="text-h5 text-weight-bold" style="color: var(--cd-primary)">
              {{ brl(store.patrimonio) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-8">
        <q-card flat class="cd-card">
          <q-card-section>
            <div class="cd-section-title q-mb-md">Despesas por categoria</div>
            <div v-if="!store.despesasPorCategoria.length" class="text-grey">
              Sem despesas no periodo.
            </div>
            <div v-for="c in store.despesasPorCategoria" :key="c.categoriaId" class="q-mb-md">
              <div class="row items-center q-mb-xs">
                <div class="col">{{ c.categoriaNome }}</div>
                <div class="col-auto text-weight-medium">{{ brl(c.total) }}</div>
                <div class="col-auto text-grey q-ml-sm" style="min-width: 48px; text-align: right">
                  {{ c.percentual.toFixed(0) }}%
                </div>
              </div>
              <q-linear-progress
                :value="c.percentual / 100"
                color="accent"
                track-color="grey-3"
                size="9px"
                rounded
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRelatoriosStore } from 'stores/relatorios'

const store = useRelatoriosStore()
const periodo = ref(store.periodo)

function brl(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const comprometimento = computed(() => {
  const r = store.saldo?.receitas ?? 0
  const d = store.saldo?.despesas ?? 0
  if (r <= 0) return '0'
  return ((d / r) * 100).toFixed(0)
})

function recarregar() {
  store.carregar(periodo.value)
}

onMounted(() => {
  store.carregar(periodo.value)
})
</script>
