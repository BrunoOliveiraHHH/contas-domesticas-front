<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('titulos.despesas') }}</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nova" @click="abrirNova" />
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="col-12 col-md-3">
          <q-input
            v-model="busca"
            dense
            outlined
            clearable
            debounce="200"
            label="Buscar"
            prepend-inner-icon="search"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-6 col-md-2">
          <q-select
            v-model="fStatus"
            :options="statusOpcoes"
            dense
            outlined
            clearable
            emit-value
            map-options
            label="Status"
          />
        </div>
        <div class="col-6 col-md-2">
          <q-select
            v-model="fCategoria"
            :options="categoriaOpcoes"
            dense
            outlined
            clearable
            emit-value
            map-options
            label="Categoria"
          />
        </div>
        <div class="col-6 col-md-2">
          <q-select
            v-model="fCarteira"
            :options="carteiraOpcoes"
            dense
            outlined
            clearable
            emit-value
            map-options
            label="Carteira"
          />
        </div>
        <div class="col-3 col-md-1">
          <q-select
            v-model="fMes"
            :options="mesOpcoes"
            dense
            outlined
            clearable
            emit-value
            map-options
            label="Mês"
          />
        </div>
        <div class="col-3 col-md-1">
          <q-select
            v-model="fAno"
            :options="anoOpcoes"
            dense
            outlined
            clearable
            emit-value
            map-options
            label="Ano"
          />
        </div>
        <div class="col-12 col-md-1 flex items-center">
          <q-toggle v-model="agrupar" label="Mês" dense />
        </div>
      </q-card-section>
    </q-card>

    <!-- Totais -->
    <div class="row q-gutter-sm q-mb-sm">
      <q-chip square color="grey-2" text-color="primary" icon="receipt_long">
        {{ filtradas.length }} lançamento(s)
      </q-chip>
      <q-chip square color="grey-2" class="cd-money cd-money--neg" icon="payments">
        Total − {{ brl(total) }}
      </q-chip>
      <q-chip v-if="totalAPagar > 0" square color="orange-2" text-color="orange-9" icon="schedule">
        A pagar {{ brl(totalAPagar) }}
      </q-chip>
    </div>

    <q-table
      :rows="linhas"
      :columns="colunas"
      row-key="id"
      :loading="store.carregando"
      :sort-method="agrupar ? manterOrdem : undefined"
      :pagination="paginacao"
      :rows-per-page-options="[10, 25, 50, 100]"
      flat
      bordered
    >
      <template #body="props">
        <!-- Cabeçalho de grupo (mês) -->
        <q-tr v-if="props.row.__grupo" :props="props" class="cd-grupo-row">
          <q-td colspan="100%">
            <q-icon name="event" size="16px" class="q-mr-sm" />
            {{ labelMes(props.row.mes) }}
            <span class="float-right">{{ brl(props.row.subtotal) }}</span>
          </q-td>
        </q-tr>
        <template v-else>
          <q-tr :props="props" class="cursor-pointer" @click="alternar(props.row.id)">
            <q-td key="descricao" :props="props">
              <q-icon
                :name="expandidos.has(props.row.id) ? 'expand_more' : 'chevron_right'"
                size="18px"
                class="q-mr-xs text-grey"
              />
              {{ props.row.descricao }}
            </q-td>
            <q-td key="categoria" :props="props">
              <CdCategoriaChip
                :nome="nomeCategoria(props.row.categoriaId)"
                :cor="corCategoria(props.row.categoriaId)"
              />
            </q-td>
            <q-td key="carteira" :props="props">{{ nomeCarteira(props.row.carteiraId) }}</q-td>
            <q-td key="valor" :props="props" class="text-right">
              <span class="cd-money cd-money--neg">− {{ brl(props.row.valor) }}</span>
            </q-td>
            <q-td key="dataVencimento" :props="props">
              <span :class="{ 'cd-venc-atrasado': ehAtrasado(props.row) }">
                <q-icon v-if="ehAtrasado(props.row)" name="warning" size="14px" class="q-mr-xs" />
                {{ formatarData(props.row.dataVencimento) }}
              </span>
            </q-td>
            <q-td key="status" :props="props"><CdStatusBadge :status="props.row.status" /></q-td>
            <q-td key="acoes" :props="props" class="text-right">
              <q-btn
                v-if="props.row.status !== 'PAGO'"
                flat
                dense
                round
                icon="paid"
                color="positive"
                @click.stop="pagar(props.row)"
              >
                <q-tooltip>Marcar como paga</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                @click.stop="remover(props.row)"
              />
            </q-td>
          </q-tr>
          <!-- Detalhe expansível -->
          <q-tr v-if="expandidos.has(props.row.id)" :props="props" class="cd-detalhe-row">
            <q-td colspan="100%">
              <div class="row q-col-gutter-md text-caption q-py-xs">
                <div><b>Competência:</b> {{ formatarData(props.row.dataCompetencia) }}</div>
                <div><b>Vencimento:</b> {{ formatarData(props.row.dataVencimento) }}</div>
                <div><b>Pagamento:</b> {{ formatarData(props.row.dataPagamento) }}</div>
                <div><b>Carteira:</b> {{ nomeCarteira(props.row.carteiraId) }}</div>
              </div>
            </q-td>
          </q-tr>
        </template>
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
import CdStatusBadge from 'components/CdStatusBadge.vue'
import CdCategoriaChip from 'components/CdCategoriaChip.vue'

const { t } = useI18n()

const $q = useQuasar()
const store = useDespesasStore()
const carteiras = useCarteirasStore()
const categorias = useCategoriaStore()

// Ordem lógica de status (atrasado é o mais urgente)
const STATUS_ORDEM: Record<string, number> = { ATRASADO: 0, PENDENTE: 1, PAGO: 2 }

const colunas = [
  { name: 'descricao', label: 'Nome', field: 'descricao', align: 'left' as const, sortable: true },
  {
    name: 'categoria',
    label: 'Categoria',
    field: 'categoriaId',
    align: 'left' as const,
    sortable: true,
    sort: (_a: unknown, _b: unknown, ra: Lancamento, rb: Lancamento) =>
      nomeCategoria(ra.categoriaId).localeCompare(nomeCategoria(rb.categoriaId))
  },
  {
    name: 'carteira',
    label: 'Carteira',
    field: 'carteiraId',
    align: 'left' as const,
    sortable: true,
    sort: (_a: unknown, _b: unknown, ra: Lancamento, rb: Lancamento) =>
      nomeCarteira(ra.carteiraId).localeCompare(nomeCarteira(rb.carteiraId))
  },
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
    sortable: true,
    format: (v: string) => formatarData(v)
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'left' as const,
    sortable: true,
    sort: (a: string | null, b: string | null) =>
      (STATUS_ORDEM[a ?? ''] ?? 9) - (STATUS_ORDEM[b ?? ''] ?? 9)
  },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' as const }
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
const anoAtual = new Date().getFullYear()
const anoOpcoes = Array.from({ length: 7 }, (_, i) => {
  const y = anoAtual - 4 + i
  return { label: String(y), value: y }
})
const statusOpcoes = [
  { label: 'Pago', value: 'PAGO' },
  { label: 'Pendente', value: 'PENDENTE' },
  { label: 'Atrasado', value: 'ATRASADO' }
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
function corCategoria(id: number) {
  return categorias.itens.find((c) => c.id === id)?.cor ?? null
}
function nomeCarteira(id: number) {
  return carteiras.itens.find((c) => c.id === id)?.nome ?? '-'
}

// ===== Filtros / agrupamento / expansão =====
const busca = ref('')
const fStatus = ref<string | null>(null)
const fCategoria = ref<number | null>(null)
const fCarteira = ref<number | null>(null)
const fMes = ref<number | null>(null)
const fAno = ref<number | null>(null)
const agrupar = ref(false)
const expandidos = ref<Set<number>>(new Set())
const paginacao = ref({ rowsPerPage: 25, sortBy: 'dataVencimento', descending: true })

const hojeIso = new Date().toISOString().slice(0, 10)
const chaveData = (r: Lancamento) => r.dataVencimento || r.dataCompetencia || ''
const mesDe = (r: Lancamento) => chaveData(r).slice(0, 7)

function ehAtrasado(r: Lancamento) {
  if (r.status === 'ATRASADO') return true
  return r.status !== 'PAGO' && !!r.dataVencimento && r.dataVencimento < hojeIso
}

const filtradas = computed(() => {
  const termo = (busca.value || '').trim().toLowerCase()
  return store.itens.filter((r) => {
    if (termo && !r.descricao.toLowerCase().includes(termo)) return false
    if (fStatus.value && r.status !== fStatus.value) return false
    if (fCategoria.value && r.categoriaId !== fCategoria.value) return false
    if (fCarteira.value && r.carteiraId !== fCarteira.value) return false
    if (fMes.value || fAno.value) {
      const [y, m] = mesDe(r).split('-')
      if (fAno.value && Number(y) !== fAno.value) return false
      if (fMes.value && Number(m) !== fMes.value) return false
    }
    return true
  })
})

const total = computed(() => filtradas.value.reduce((s, r) => s + (r.valor || 0), 0))
const totalAPagar = computed(() =>
  filtradas.value.filter((r) => r.status !== 'PAGO').reduce((s, r) => s + (r.valor || 0), 0)
)

function labelMes(mes: string) {
  const [y, m] = mes.split('-')
  return `${MESES[Number(m) - 1] ?? m}/${y}`
}

// Linhas exibidas: com cabeçalhos de grupo quando "agrupar" está ativo
const linhas = computed(() => {
  const base = filtradas.value
  if (!agrupar.value) return base
  const ordenadas = [...base].sort((a, b) => chaveData(b).localeCompare(chaveData(a)))
  const subtotais: Record<string, number> = {}
  ordenadas.forEach((r) => {
    const mes = mesDe(r)
    subtotais[mes] = (subtotais[mes] || 0) + (r.valor || 0)
  })
  const out: (Lancamento | { __grupo: true; id: string; mes: string; subtotal: number })[] = []
  let atual = ''
  ordenadas.forEach((r) => {
    const mes = mesDe(r)
    if (mes !== atual) {
      atual = mes
      out.push({ __grupo: true, id: `g-${mes}`, mes, subtotal: subtotais[mes] ?? 0 })
    }
    out.push(r)
  })
  return out
})

// Ao agrupar, preserva a ordem já montada (com os cabeçalhos de grupo).
// Quando não agrupado, sort-method fica undefined e o q-table ordena por coluna.
function manterOrdem<T>(rows: readonly T[]): readonly T[] {
  return rows
}

function alternar(id: number) {
  const s = new Set(expandidos.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  expandidos.value = s
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
