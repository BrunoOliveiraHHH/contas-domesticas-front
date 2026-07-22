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

    <!-- KPIs (todos do mesmo tamanho, 2 por linha) -->
    <div class="row q-col-gutter-md">
      <div v-for="k in kpis" :key="k.label" class="col-6">
        <div class="cd-kpi" :class="k.classe">
          <div class="cd-kpi-label">{{ k.label }}</div>
          <div class="cd-kpi-value">{{ k.valor }}</div>
        </div>
      </div>
    </div>

    <!-- Simulador de quitação -->
    <q-card flat class="cd-card q-mt-md">
      <q-card-section>
        <div class="cd-section-title q-mb-sm">Simulador de quitação</div>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-5">
            <q-select
              v-model="pendenciaSel"
              :options="pendenciaOpcoes"
              label="Conta pendente (opcional)"
              emit-value
              map-options
              dense
              outlined
              clearable
              @update:model-value="aoEscolherPendencia"
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="valorSimulacao"
              type="number"
              step="0.01"
              label="Valor a quitar"
              dense
              outlined
            />
          </div>
          <div class="col-12 col-sm-3 text-caption text-grey">
            Sobra mensal estimada: {{ brl(sobraMensal) }}
          </div>
        </div>
        <q-banner class="q-mt-md" :class="simulacao.cor">
          {{ simulacao.texto }}
        </q-banner>
      </q-card-section>
    </q-card>

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
import { useDespesasStore } from 'stores/lancamentos'
import { formatarMoeda, rotuloMesCurto } from 'src/utils/format'

const { t } = useI18n()

const store = useRelatoriosStore()
const despesasStore = useDespesasStore()

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

// KPIs (todos do mesmo tamanho, 2 por linha)
const kpis = computed(() => {
  const s = store.saldo
  const receitas = s?.receitas ?? 0
  const despesas = s?.despesas ?? 0
  const saldo = s?.saldo ?? 0
  const aPagar = s?.aPagar ?? 0
  const atrasadas = s?.atrasadas ?? 0
  const assinaturas = s?.assinaturas ?? 0

  const saldoProjetado = saldo - aPagar
  const taxaPoupanca = receitas > 0 ? (saldo / receitas) * 100 : 0
  const pctPago = despesas > 0 ? ((despesas - aPagar) / despesas) * 100 : 0
  const reservaMeses = despesas > 0 ? store.patrimonio / despesas : 0

  const evo = store.evolucao
  const despPrev = evo.length >= 2 ? (evo[evo.length - 2]?.despesas ?? 0) : 0
  const variacao = despPrev > 0 ? ((despesas - despPrev) / despPrev) * 100 : 0
  const setaVar = variacao > 0 ? '▲' : variacao < 0 ? '▼' : ''

  const maior = store.despesasPorCategoria[0]

  return [
    { label: 'Receitas', valor: brl(receitas), classe: 'rec' },
    { label: 'Despesas', valor: brl(despesas), classe: 'sai' },
    { label: 'A pagar', valor: brl(aPagar), classe: 'warn' },
    { label: 'Atrasadas', valor: brl(atrasadas), classe: 'danger' },
    { label: 'Saldo', valor: brl(saldo), classe: 'sal' },
    { label: 'Saldo projetado', valor: brl(saldoProjetado), classe: 'teal' },
    { label: 'Comprometimento', valor: `${comprometimento.value}%`, classe: 'comp' },
    { label: 'Taxa de poupança', valor: `${taxaPoupanca.toFixed(0)}%`, classe: 'rec' },
    { label: '% pago do mês', valor: `${pctPago.toFixed(0)}%`, classe: 'comp' },
    { label: 'Assinaturas/fixas', valor: brl(assinaturas), classe: 'teal' },
    {
      label: 'Variação vs mês ant.',
      valor: `${setaVar} ${Math.abs(variacao).toFixed(0)}%`,
      classe: 'sai'
    },
    { label: 'Reserva de emergência', valor: `${reservaMeses.toFixed(1)} meses`, classe: 'sal' },
    {
      label: 'Maior categoria',
      valor: maior ? `${maior.categoriaNome} · ${brl(maior.total)}` : '—',
      classe: 'sai'
    }
  ]
})

// Simulador de quitação
const valorSimulacao = ref(0)
const pendenciaSel = ref<number | null>(null)
const pendenciaOpcoes = computed(() =>
  despesasStore.itens
    .filter((d) => d.status !== 'PAGO')
    .map((d) => ({ label: `${d.descricao} · ${brl(d.valor)}`, value: d.id }))
)
function aoEscolherPendencia(id: number | null) {
  const d = despesasStore.itens.find((x) => x.id === id)
  if (d) valorSimulacao.value = d.valor
}
const sobraMensal = computed(() => {
  const positivos = store.evolucao.map((e) => e.saldo).filter((v) => v > 0)
  if (positivos.length) return positivos.reduce((a, b) => a + b, 0) / positivos.length
  const saldo = store.saldo?.saldo ?? 0
  return saldo > 0 ? saldo : 0
})
const simulacao = computed(() => {
  const valor = valorSimulacao.value || 0
  if (valor <= 0) return { texto: 'Escolha uma conta ou informe um valor.', cor: 'bg-grey-3' }
  const sobra = sobraMensal.value
  if (sobra <= 0) {
    return {
      texto: 'Sem sobra mensal no momento — não dá para projetar a quitação.',
      cor: 'bg-red-2'
    }
  }
  const meses = Math.ceil(valor / sobra)
  const alvo = new Date(agora.getFullYear(), agora.getMonth() + meses, 1)
  const rotulo = `${String(alvo.getMonth() + 1).padStart(2, '0')}/${alvo.getFullYear()}`
  return {
    texto: `Guardando ~${brl(sobra)}/mês, você quita em ~${meses} ${meses === 1 ? 'mês' : 'meses'} (previsão: ${rotulo}).`,
    cor: 'bg-green-2'
  }
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
  despesasStore.carregar()
})
</script>

<style scoped>
.cd-chart {
  height: 280px;
  width: 100%;
}
</style>
