<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md q-gutter-sm">
      <div class="text-h6">{{ t('titulos.dashboard') }}</div>
      <q-space />
      <q-btn-toggle
        v-model="modo"
        :options="modoOpcoes"
        unelevated
        dense
        no-caps
        toggle-color="primary"
        color="grey-3"
        text-color="primary"
        @update:model-value="recarregar"
      />
      <q-select
        v-if="modo === 'MES'"
        v-model="mes"
        :options="mesOpcoes"
        :label="t('comum.mes')"
        dense
        outlined
        emit-value
        map-options
        style="min-width: 130px"
        @update:model-value="recarregar"
      />
      <q-select
        v-if="modo === 'SEMESTRE'"
        v-model="semestre"
        :options="semestreOpcoes"
        label="Semestre"
        dense
        outlined
        emit-value
        map-options
        style="min-width: 150px"
        @update:model-value="recarregar"
      />
      <q-select
        v-model="ano"
        :options="anoOpcoes"
        :label="t('comum.ano')"
        dense
        outlined
        emit-value
        map-options
        style="min-width: 110px"
        @update:model-value="recarregar"
      />
    </div>

    <!-- KPIs em gradiente -->
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

    <!-- Graficos -->
    <div class="row q-col-gutter-md q-mt-none">
      <div class="col-12 col-md-5">
        <q-card flat class="cd-card">
          <q-card-section>
            <div class="cd-section-title q-mb-sm">Despesas por categoria</div>
            <VChart
              v-if="store.despesasPorCategoria.length"
              class="cd-chart"
              :option="donutOption"
              autoresize
            />
            <div v-else class="text-grey q-py-lg text-center">Sem despesas no período.</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-7">
        <q-card flat class="cd-card">
          <q-card-section>
            <div class="cd-section-title q-mb-sm">Evolucao (6 meses)</div>
            <VChart
              v-if="store.evolucao.length"
              class="cd-chart"
              :option="evolucaoOption"
              autoresize
            />
            <div v-else class="text-grey q-py-lg text-center">Sem dados.</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Patrimonio + lista por categoria -->
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
            <div class="cd-section-title q-mb-md">Detalhamento por categoria</div>
            <div v-if="!store.despesasPorCategoria.length" class="text-grey">
              Sem despesas no período.
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
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref } from 'vue'
import VChart from 'vue-echarts'
import { useRelatoriosStore, type ModoPeriodo } from 'stores/relatorios'
import { formatarMoeda, rotuloMesCurto } from 'src/utils/format'

const { t } = useI18n()

const store = useRelatoriosStore()

const agora = new Date()
const modo = ref<ModoPeriodo>(store.modo)
const ano = ref(agora.getFullYear())
const mes = ref(agora.getMonth() + 1)
const semestre = ref(agora.getMonth() + 1 <= 6 ? 1 : 2)

const modoOpcoes = [
  { label: t('comum.mes'), value: 'MES' },
  { label: t('comum.semestre'), value: 'SEMESTRE' },
  { label: t('comum.ano'), value: 'ANO' }
]
const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
]
const mesOpcoes = MESES.map((nome, i) => ({ label: nome, value: i + 1 }))
const semestreOpcoes = [
  { label: '1º semestre', value: 1 },
  { label: '2º semestre', value: 2 }
]
const anoOpcoes = Array.from({ length: 7 }, (_, i) => {
  const y = agora.getFullYear() - 4 + i
  return { label: String(y), value: y }
})

// Ancora YYYY-MM conforme o modo (semestre -> mes 01 ou 07)
const anchor = computed(() => {
  const p = (n: number) => String(n).padStart(2, '0')
  if (modo.value === 'MES') return `${ano.value}-${p(mes.value)}`
  if (modo.value === 'SEMESTRE') return `${ano.value}-${semestre.value === 1 ? '01' : '07'}`
  return `${ano.value}-01`
})

const CORES = [
  '#613178',
  '#d82a76',
  '#8b5a96',
  '#3b82f6',
  '#43a047',
  '#f59e0b',
  '#c72d7b',
  '#5b6bb5',
  '#9b59b6',
  '#b07cc6'
]

const brl = (valor: number | null | undefined) => formatarMoeda(valor)

const comprometimento = computed(() => {
  const r = store.saldo?.receitas ?? 0
  const d = store.saldo?.despesas ?? 0
  if (r <= 0) return '0'
  return ((d / r) * 100).toFixed(0)
})

const donutOption = computed(() => ({
  color: CORES,
  tooltip: { trigger: 'item', formatter: '{b}: R$ {c} ({d}%)' },
  legend: { bottom: 0, type: 'scroll', textStyle: { color: '#8888aa' } },
  series: [
    {
      type: 'pie',
      radius: ['45%', '72%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: 'transparent', borderWidth: 2 },
      label: { show: false },
      data: store.despesasPorCategoria.map((c) => ({ name: c.categoriaNome, value: c.total }))
    }
  ]
}))

const evolucaoOption = computed(() => {
  const labels = store.evolucao.map((e) => rotuloMesCurto(e.periodo))
  return {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { color: '#8888aa' } },
    grid: { left: 8, right: 8, top: 16, bottom: 44, containLabel: true },
    xAxis: { type: 'category', data: labels, axisLabel: { color: '#8888aa' } },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#8888aa' },
      splitLine: { lineStyle: { color: 'rgba(136,136,170,.2)' } }
    },
    series: [
      {
        name: 'Receitas',
        type: 'bar',
        data: store.evolucao.map((e) => e.receitas),
        itemStyle: { color: '#43a047', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: 'Despesas',
        type: 'bar',
        data: store.evolucao.map((e) => e.despesas),
        itemStyle: { color: '#d82a76', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: 'Saldo',
        type: 'line',
        smooth: true,
        data: store.evolucao.map((e) => e.saldo),
        itemStyle: { color: '#613178' },
        lineStyle: { width: 3 }
      }
    ]
  }
})

function recarregar() {
  store.carregar(anchor.value, modo.value)
}

onMounted(() => {
  store.carregar(anchor.value, modo.value)
})
</script>

<style scoped>
.cd-chart {
  height: 280px;
  width: 100%;
}
</style>
