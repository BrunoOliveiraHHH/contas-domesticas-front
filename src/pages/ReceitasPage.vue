<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('titulos.receitas') }}</div>
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
      <template #body-cell-periodo="props">
        <q-td :props="props">{{ periodoLabel(props.row) }}</q-td>
      </template>
      <template #body-cell-acoes="props">
        <q-td :props="props" class="text-right">
          <q-btn flat dense round icon="delete" color="negative" @click="remover(props.row)" />
        </q-td>
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

const { t } = useI18n()

const $q = useQuasar()
const store = useReceitasStore()
const carteiras = useCarteirasStore()
const categorias = useCategoriaStore()

const colunas = [
  { name: 'descricao', label: 'Nome', field: 'descricao', align: 'left' as const, sortable: true },
  { name: 'categoria', label: 'Categoria', field: 'categoriaId', align: 'left' as const },
  {
    name: 'valor',
    label: 'Valor',
    field: 'valor',
    align: 'right' as const,
    sortable: true,
    format: (v: number) => formatarMoeda(v)
  },
  { name: 'carteira', label: 'Carteira', field: 'carteiraId', align: 'left' as const },
  { name: 'periodo', label: 'Período', field: 'dataInicio', align: 'left' as const },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' as const }
]

const carteiraOpcoes = computed(() => carteiras.itens.map((c) => ({ label: c.nome, value: c.id })))
const categoriaOpcoes = computed(() =>
  categorias.itens
    .filter((c) => c.tipo === 'RECEITA')
    .map((c) => ({ label: c.nome as string, value: c.id }))
)

function nomeCategoria(id: number) {
  return categorias.itens.find((c) => c.id === id)?.nome ?? '-'
}
function nomeCarteira(id: number) {
  return carteiras.itens.find((c) => c.id === id)?.nome ?? '-'
}
function periodoLabel(row: Lancamento) {
  const ini = formatarData(row.dataInicio)
  return row.dataFim ? `${ini} – ${formatarData(row.dataFim)}` : `${ini} – sem prazo`
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
