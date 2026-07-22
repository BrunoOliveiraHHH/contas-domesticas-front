<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('titulos.despesas') }}</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nova" @click="abrirNova" />
    </div>

    <q-table
      :rows="store.itens"
      :columns="colunas"
      row-key="id"
      :loading="store.carregando"
      flat
      bordered
    >
      <template #body-cell-categoria="props">
        <q-td :props="props">{{ nomeCategoria(props.row.categoriaId) }}</q-td>
      </template>
      <template #body-cell-carteira="props">
        <q-td :props="props">{{ nomeCarteira(props.row.carteiraId) }}</q-td>
      </template>
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="corStatus(props.row.status)" :label="props.row.status || '-'" />
        </q-td>
      </template>
      <template #body-cell-acoes="props">
        <q-td :props="props" class="text-right">
          <q-btn
            v-if="props.row.status !== 'PAGO'"
            flat
            dense
            round
            icon="paid"
            color="positive"
            @click="pagar(props.row)"
          />
          <q-btn flat dense round icon="delete" color="negative" @click="remover(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 380px">
        <q-card-section class="text-h6">Nova despesa</q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" @submit="salvar">
            <q-input v-model="form.nome" label="Nome" :rules="[(v) => !!v || 'Informe']" />
            <q-select
              v-model="form.categoriaId"
              :options="categoriaOpcoes"
              label="Categoria"
              emit-value
              map-options
            />
            <q-select
              v-model="form.carteiraId"
              :options="carteiraOpcoes"
              label="Carteira"
              emit-value
              map-options
            />

            <div class="text-caption text-grey">Tipo de despesa</div>
            <q-btn-toggle
              v-model="form.tipo"
              :options="tipoOpcoes"
              spread
              no-caps
              unelevated
              toggle-color="primary"
              color="grey-3"
              text-color="primary"
            />

            <!-- Única -->
            <template v-if="form.tipo === 'UNICA'">
              <q-input v-model.number="form.valor" type="number" step="0.01" label="Valor" />
              <q-input v-model="form.dataVencimento" type="date" label="Vencimento" />
            </template>

            <!-- Recorrente fixa -->
            <template v-else-if="form.tipo === 'RECORRENTE'">
              <q-input v-model.number="form.valor" type="number" step="0.01" label="Valor mensal" />
              <q-input
                v-model.number="form.diaVencimento"
                type="number"
                label="Dia de vencimento (1-31)"
              />
              <div class="text-caption text-grey">Gera um lançamento fixo por mês.</div>
            </template>

            <!-- Parcelada -->
            <template v-else>
              <q-input
                v-model.number="form.parcelas"
                type="number"
                min="2"
                label="Nº de parcelas"
              />
              <q-btn-toggle
                v-model="form.modoValor"
                :options="modoValorOpcoes"
                spread
                no-caps
                unelevated
                toggle-color="secondary"
                color="grey-3"
                text-color="secondary"
              />
              <q-input
                v-model.number="form.valorEntrada"
                type="number"
                step="0.01"
                :label="form.modoValor === 'TOTAL' ? 'Valor total' : 'Valor por parcela'"
              />
              <q-input v-model="form.primeiroVencimento" type="date" label="Primeiro vencimento" />
              <q-banner dense class="bg-grey-2">
                {{ form.parcelas || 0 }}x de {{ brl(valorParcela) }} · total {{ brl(valorTotal) }}
              </q-banner>
            </template>

            <div class="row justify-end q-gutter-sm">
              <q-btn v-close-popup flat label="Cancelar" />
              <q-btn type="submit" color="primary" label="Salvar" :loading="salvando" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatarMoeda, formatarData } from 'src/utils/format'
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useDespesasStore } from 'stores/lancamentos'
import { useCarteirasStore } from 'stores/carteiras'
import { useCategoriaStore } from 'stores/categorias'
import { recorrenciasService } from 'src/services/recorrencias'
import type { Lancamento } from 'src/services/lancamentos'

const { t } = useI18n()

const $q = useQuasar()
const store = useDespesasStore()
const carteiras = useCarteirasStore()
const categorias = useCategoriaStore()

const colunas = [
  { name: 'descricao', label: 'Nome', field: 'descricao', align: 'left' as const, sortable: true },
  { name: 'categoria', label: 'Categoria', field: 'categoriaId', align: 'left' as const },
  { name: 'carteira', label: 'Carteira', field: 'carteiraId', align: 'left' as const },
  {
    name: 'valor',
    label: 'Valor',
    field: 'valor',
    align: 'right' as const,
    sortable: true,
    format: (v: number) => formatarMoeda(v)
  },
  {
    name: 'dataVencimento',
    label: 'Vencimento',
    field: 'dataVencimento',
    align: 'left' as const,
    format: (v: string) => formatarData(v)
  },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' as const }
]

const carteiraOpcoes = computed(() => carteiras.itens.map((c) => ({ label: c.nome, value: c.id })))
const categoriaOpcoes = computed(() =>
  categorias.itens
    .filter((c) => c.tipo === 'DESPESA')
    .map((c) => ({ label: c.nome as string, value: c.id }))
)

function nomeCategoria(id: number) {
  return categorias.itens.find((c) => c.id === id)?.nome ?? '-'
}
function nomeCarteira(id: number) {
  return carteiras.itens.find((c) => c.id === id)?.nome ?? '-'
}

const tipoOpcoes = [
  { label: 'Única', value: 'UNICA' },
  { label: 'Recorrente fixa', value: 'RECORRENTE' },
  { label: 'Parcelada', value: 'PARCELADA' }
]
const modoValorOpcoes = [
  { label: 'Valor total', value: 'TOTAL' },
  { label: 'Valor por parcela', value: 'PARCELA' }
]

const hoje = () => new Date().toISOString().slice(0, 10)

interface FormDespesa {
  nome: string
  categoriaId: number
  carteiraId: number
  tipo: 'UNICA' | 'RECORRENTE' | 'PARCELADA'
  valor: number
  dataVencimento: string
  diaVencimento: number
  parcelas: number
  modoValor: 'TOTAL' | 'PARCELA'
  valorEntrada: number
  primeiroVencimento: string
}

const dialog = ref(false)
const salvando = ref(false)
const form = reactive<FormDespesa>({
  nome: '',
  categoriaId: 0,
  carteiraId: 0,
  tipo: 'UNICA',
  valor: 0,
  dataVencimento: hoje(),
  diaVencimento: 10,
  parcelas: 2,
  modoValor: 'TOTAL',
  valorEntrada: 0,
  primeiroVencimento: hoje()
})

// Cálculo automático total <-> por parcela
const valorTotal = computed(() => {
  const n = form.parcelas || 0
  return form.modoValor === 'TOTAL' ? form.valorEntrada || 0 : (form.valorEntrada || 0) * n
})
const valorParcela = computed(() => {
  const n = form.parcelas || 1
  return form.modoValor === 'TOTAL' ? (form.valorEntrada || 0) / n : form.valorEntrada || 0
})

function brl(v: number) {
  return formatarMoeda(v)
}

function abrirNova() {
  Object.assign(form, {
    nome: '',
    categoriaId: 0,
    carteiraId: 0,
    tipo: 'UNICA',
    valor: 0,
    dataVencimento: hoje(),
    diaVencimento: 10,
    parcelas: 2,
    modoValor: 'TOTAL',
    valorEntrada: 0,
    primeiroVencimento: hoje()
  })
  dialog.value = true
}

function corStatus(status: string | null | undefined) {
  if (status === 'PAGO') return 'positive'
  if (status === 'ATRASADO') return 'negative'
  return 'warning'
}

async function salvar() {
  if (!form.nome || !form.categoriaId || !form.carteiraId) {
    $q.notify({ type: 'warning', message: 'Preencha nome, categoria e carteira' })
    return
  }
  salvando.value = true
  try {
    if (form.tipo === 'UNICA') {
      await store.salvar({
        descricao: form.nome,
        valor: form.valor,
        dataCompetencia: hoje(),
        dataVencimento: form.dataVencimento,
        carteiraId: form.carteiraId,
        categoriaId: form.categoriaId
      })
      $q.notify({ type: 'positive', message: 'Despesa salva' })
    } else if (form.tipo === 'RECORRENTE') {
      await recorrenciasService.criar({
        descricao: form.nome,
        valor: form.valor,
        tipo: 'DESPESA',
        carteiraId: form.carteiraId,
        categoriaId: form.categoriaId,
        frequencia: 'MENSAL',
        diaVencimento: form.diaVencimento,
        dataInicio: hoje(),
        ativa: true
      })
      $q.notify({ type: 'positive', message: 'Despesa recorrente criada' })
    } else {
      const parcelas = await store.parcelar({
        descricao: form.nome,
        valorTotal: valorTotal.value,
        parcelas: form.parcelas,
        primeiroVencimento: form.primeiroVencimento,
        carteiraId: form.carteiraId,
        categoriaId: form.categoriaId
      })
      $q.notify({ type: 'positive', message: `${parcelas.length} parcelas geradas` })
    }
    dialog.value = false
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar' })
  } finally {
    salvando.value = false
  }
}

async function pagar(row: Lancamento) {
  await store.pagar(row.id)
  $q.notify({ type: 'positive', message: 'Marcada como paga' })
}

function remover(row: Lancamento) {
  $q.dialog({ title: 'Remover', message: 'Remover esta despesa?', cancel: true }).onOk(async () => {
    await store.remover(row.id)
    $q.notify({ type: 'positive', message: 'Removida' })
  })
}

onMounted(() => {
  store.carregar()
  carteiras.carregar()
  categorias.carregar()
})
</script>
