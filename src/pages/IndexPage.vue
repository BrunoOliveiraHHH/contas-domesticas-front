<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">Dashboard</div>
      <q-space />
      <q-input
        v-model="periodo"
        type="month"
        dense
        label="Periodo"
        style="max-width: 180px"
        @update:model-value="recarregar"
      />
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Receitas</div>
            <div class="text-h6 text-positive">{{ brl(store.saldo?.receitas ?? 0) }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Despesas</div>
            <div class="text-h6 text-negative">{{ brl(store.saldo?.despesas ?? 0) }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Saldo</div>
            <div class="text-h6" :class="saldoCor">{{ brl(store.saldo?.saldo ?? 0) }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="q-mt-md">
      <q-card-section>
        <div class="text-subtitle1">Patrimonio investido</div>
        <div class="text-h5 text-primary">{{ brl(store.patrimonio) }}</div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="q-mt-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">Despesas por categoria</div>
        <div v-if="!store.despesasPorCategoria.length" class="text-grey">
          Sem despesas no periodo.
        </div>
        <div v-for="c in store.despesasPorCategoria" :key="c.categoriaId" class="q-mb-sm">
          <div class="row items-center">
            <div class="col">{{ c.categoriaNome }}</div>
            <div class="col-auto text-weight-medium">{{ brl(c.total) }}</div>
            <div class="col-auto text-grey q-ml-sm" style="min-width: 48px; text-align: right">
              {{ (c.percentual * 100).toFixed(0) }}%
            </div>
          </div>
          <q-linear-progress
            :value="c.percentual"
            color="negative"
            track-color="grey-3"
            size="10px"
            rounded
          />
        </div>
      </q-card-section>
    </q-card>
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

const saldoCor = computed(() =>
  (store.saldo?.saldo ?? 0) >= 0 ? 'text-positive' : 'text-negative'
)

function recarregar() {
  store.carregar(periodo.value)
}

onMounted(() => {
  store.carregar(periodo.value)
})
</script>
