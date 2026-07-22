<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('titulos.receitas') }}</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nova" @click="abrirNova" />
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="col-12 col-md-4">
          <q-input v-model="busca" dense outlined clearable debounce="200" label="Buscar">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-6 col-md-3">
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
        <div class="col-6 col-md-3">
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
        <div class="col-3 col-md-1 flex items-center">
          <q-toggle v-model="agrupar" label="Mês" dense />
        </div>
      </q-card-section>
    </q-card>

    <!-- Totais -->
    <div class="row q-gutter-sm q-mb-sm">
      <q-chip square color="grey-2" text-color="primary" icon="request_quote">
        {{ filtradas.length }} receita(s)
      </q-chip>
      <q-chip square color="grey-2" class="cd-money cd-money--pos" icon="trending_up">
        Total + {{ brl(total) }}
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
        <q-tr v-if="props.row.__grupo" :props="props" class="cd-grupo-row">
          <q-td colspan="100%">
            <q-icon name="event" size="16px" class="q-mr-sm" />
            {{ labelMes(props.row.mes) }}
            <span class="float-right cd-money cd-money--pos">+ {{ brl(props.row.subtotal) }}</span>
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
            <q-td key="valor" :props="props" class="text-right">
              <span class="cd-money cd-money--pos">+ {{ brl(props.row.valor) }}</span>
            </q-td>
            <q-td key="carteira" :props="props">{{ nomeCarteira(props.row.carteiraId) }}</q-td>
            <q-td key="periodo" :props="props">{{ periodoLabel(props.row) }}</q-td>
            <q-td key="acoes" :props="props" class="text-right">
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
          <q-tr v-if="expandidos.has(props.row.id)" :props="props" class="cd-detalhe-row">
            <q-td colspan="100%">
              <div class="row q-col-gutter-md text-caption q-py-xs">
                <div><b>Início:</b> {{ formatarData(props.row.dataInicio) }}</div>
                <div>
                  <b>Fim:</b>
                  {{ props.row.dataFim ? formatarData(props.row.dataFim) : 'sem prazo' }}
                </div>
                <div><b>Competência:</b> {{ formatarData(props.row.dataCompetencia) }}</div>
                <div><b>Carteira:</b> {{ nomeCarteira(props.row.carteiraId) }}</div>
              </div>
            </q-td>
          </q-tr>
        </template>
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 380px">
        <q-card-section class="text-h6">Nova receita</q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" @submit="salvar">
            <q-input v-model="form.descricao" label="Nome" :rules="[(v) => !!v || 'Informe']" />
            <q-select
              v-model="form.categoriaId"
              :options="categoriaOpcoes"
              label="Categoria (salário, 13º, freelancer...)"
              emit-value
              map-options
            />
            <q-input v-model.number="form.valor" type="number" step="0.01" label="Valor" />
            <q-select
              v-model="form.carteiraId"
              :options="carteiraOpcoes"
              label="Carteira"
              emit-value
              map-options
            />
            <q-input v-model="form.dataInicio" type="date" label="Início" />
            <q-input v-model="form.dataFim" type="date" label="Fim (vazio = sem prazo)" clearable />
            <div class="text-caption text-grey">
              Sem data fim, a receita vale por tempo indeterminado.
            </div>
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
import { useReceitasStore } from 'stores/lancamentos'
import { useCarteirasStore } from 'stores/carteiras'
import { useCategoriaStore } from 'stores/categorias'
import type { Lancamento, ReceitaRequest } from 'src/services/lancamentos'
import CdCategoriaChip from 'components/CdCategoriaChip.vue'

const { t } = useI18n()

const $q = useQuasar()
const store = useReceitasStore()
const carteiras = useCarteirasStore()
const categorias = useCategoriaStore()

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
    name: 'valor',
    label: 'Valor',
    field: 'valor',
    align: 'right' as const,
    sortable: true,
    format: (v: number) => formatarMoeda(v)
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
    name: 'periodo',
    label: 'Período',
    field: 'dataInicio',
    align: 'left' as const,
    sortable: true
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
const anoAtual = new Date().getFullYear()
const anoOpcoes = Array.from({ length: 7 }, (_, i) => {
  const y = anoAtual - 4 + i
  return { label: String(y), value: y }
})

const carteiraOpcoes = computed(() => carteiras.itens.map((c) => ({ label: c.nome, value: c.id })))
const categoriaOpcoes = computed(() =>
  categorias.itens
    .filter((c) => c.tipo === 'RECEITA')
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
function periodoLabel(row: Lancamento) {
  const ini = formatarData(row.dataInicio)
  return row.dataFim ? `${ini} – ${formatarData(row.dataFim)}` : `${ini} – sem prazo`
}

// ===== Filtros / agrupamento / expansão =====
const busca = ref('')
const fCategoria = ref<number | null>(null)
const fCarteira = ref<number | null>(null)
const fAno = ref<number | null>(null)
const agrupar = ref(false)
const expandidos = ref<Set<number>>(new Set())
const paginacao = ref({ rowsPerPage: 25, sortBy: 'periodo', descending: true })

const chaveData = (r: Lancamento) => r.dataInicio || r.dataCompetencia || ''
const mesDe = (r: Lancamento) => chaveData(r).slice(0, 7)

const filtradas = computed(() => {
  const termo = (busca.value || '').trim().toLowerCase()
  return store.itens.filter((r) => {
    if (termo && !r.descricao.toLowerCase().includes(termo)) return false
    if (fCategoria.value && r.categoriaId !== fCategoria.value) return false
    if (fCarteira.value && r.carteiraId !== fCarteira.value) return false
    if (fAno.value) {
      const [y] = mesDe(r).split('-')
      if (Number(y) !== fAno.value) return false
    }
    return true
  })
})

const total = computed(() => filtradas.value.reduce((s, r) => s + (r.valor || 0), 0))

function labelMes(mes: string) {
  const [y, m] = mes.split('-')
  return `${MESES[Number(m) - 1] ?? m}/${y}`
}

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

function manterOrdem<T>(rows: readonly T[]): readonly T[] {
  return rows
}

function alternar(id: number) {
  const s = new Set(expandidos.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  expandidos.value = s
}

const hoje = () => new Date().toISOString().slice(0, 10)

const dialog = ref(false)
const salvando = ref(false)
const form = reactive<{
  descricao: string
  valor: number
  categoriaId: number
  carteiraId: number
  dataInicio: string
  dataFim: string | null
}>({
  descricao: '',
  valor: 0,
  categoriaId: 0,
  carteiraId: 0,
  dataInicio: hoje(),
  dataFim: null
})

function brl(v: number) {
  return formatarMoeda(v)
}

function abrirNova() {
  Object.assign(form, {
    descricao: '',
    valor: 0,
    categoriaId: 0,
    carteiraId: 0,
    dataInicio: hoje(),
    dataFim: null
  })
  dialog.value = true
}

async function salvar() {
  if (!form.descricao || !form.categoriaId || !form.carteiraId || !form.dataInicio) {
    $q.notify({ type: 'warning', message: 'Preencha nome, categoria, carteira e início' })
    return
  }
  salvando.value = true
  try {
    const req: ReceitaRequest = {
      descricao: form.descricao,
      valor: form.valor,
      dataCompetencia: form.dataInicio,
      carteiraId: form.carteiraId,
      categoriaId: form.categoriaId,
      dataInicio: form.dataInicio,
      dataFim: form.dataFim
    }
    await store.salvar(req)
    dialog.value = false
    $q.notify({ type: 'positive', message: 'Receita salva' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar' })
  } finally {
    salvando.value = false
  }
}

function remover(row: Lancamento) {
  $q.dialog({ title: 'Remover', message: 'Remover esta receita?', cancel: true }).onOk(async () => {
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
