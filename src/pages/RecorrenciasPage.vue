<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">Recorrencias</div>
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
      <template #body-cell-ativa="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.ativa ? 'positive' : 'grey'"
            :label="props.row.ativa ? 'ativa' : 'inativa'"
          />
        </q-td>
      </template>
      <template #body-cell-acoes="props">
        <q-td :props="props" class="text-right">
          <q-btn flat dense round icon="play_arrow" color="primary" @click="abrirGerar(props.row)">
            <q-tooltip>Gerar lancamento</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="delete" color="negative" @click="remover(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 380px">
        <q-card-section class="text-h6">Nova recorrencia</q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" @submit="salvar">
            <q-input
              v-model="form.descricao"
              label="Descricao"
              :rules="[(v) => !!v || 'Informe']"
            />
            <q-input v-model.number="form.valor" type="number" step="0.01" label="Valor" />
            <q-select v-model="form.tipo" :options="tipos" label="Tipo" />
            <q-select
              v-model="form.carteiraId"
              :options="carteiraOpcoes"
              label="Carteira"
              emit-value
              map-options
            />
            <q-select
              v-model="form.categoriaId"
              :options="categoriaOpcoes"
              label="Categoria"
              emit-value
              map-options
            />
            <q-select v-model="form.frequencia" :options="frequencias" label="Frequencia" />
            <q-input
              v-model.number="form.diaVencimento"
              type="number"
              label="Dia de vencimento (1-31)"
            />
            <q-input v-model="form.dataInicio" type="date" label="Data inicio" />
            <q-input v-model="form.dataFim" type="date" label="Data fim (opcional)" />
            <div class="row justify-end q-gutter-sm">
              <q-btn v-close-popup flat label="Cancelar" />
              <q-btn type="submit" color="primary" label="Salvar" :loading="salvando" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogGerar">
      <q-card style="min-width: 320px">
        <q-card-section class="text-h6">Gerar lancamento</q-card-section>
        <q-card-section>
          <q-input v-model="competencia" type="date" label="Competencia" />
          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn v-close-popup flat label="Cancelar" />
            <q-btn color="primary" label="Gerar" :loading="salvando" @click="gerar" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRecorrenciasStore } from 'stores/recorrencias'
import { useCarteirasStore } from 'stores/carteiras'
import { useCategoriaStore } from 'stores/categorias'
import type { Recorrencia, RecorrenciaRequest, Frequencia } from 'src/services/recorrencias'

const $q = useQuasar()
const store = useRecorrenciasStore()
const carteiras = useCarteirasStore()
const categorias = useCategoriaStore()

const tipos = ['RECEITA', 'DESPESA']
const frequencias: Frequencia[] = ['SEMANAL', 'MENSAL', 'ANUAL']

const colunas = [
  { name: 'descricao', label: 'Descricao', field: 'descricao', align: 'left' as const },
  { name: 'valor', label: 'Valor', field: 'valor', align: 'right' as const },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' as const },
  { name: 'frequencia', label: 'Frequencia', field: 'frequencia', align: 'left' as const },
  { name: 'ativa', label: 'Ativa', field: 'ativa', align: 'left' as const },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' as const }
]

const carteiraOpcoes = computed(() => carteiras.itens.map((c) => ({ label: c.nome, value: c.id })))
const categoriaOpcoes = computed(() =>
  categorias.itens.map((c) => ({ label: c.nome as string, value: c.id }))
)

const hoje = () => new Date().toISOString().slice(0, 10)

const dialog = ref(false)
const salvando = ref(false)
const form = reactive<RecorrenciaRequest>({
  descricao: '',
  valor: 0,
  tipo: 'DESPESA',
  carteiraId: 0,
  categoriaId: 0,
  frequencia: 'MENSAL',
  diaVencimento: 1,
  dataInicio: hoje(),
  dataFim: null
})

function abrirNova() {
  Object.assign(form, {
    descricao: '',
    valor: 0,
    tipo: 'DESPESA',
    carteiraId: 0,
    categoriaId: 0,
    frequencia: 'MENSAL',
    diaVencimento: 1,
    dataInicio: hoje(),
    dataFim: null
  })
  dialog.value = true
}

async function salvar() {
  salvando.value = true
  try {
    await store.salvar({ ...form })
    dialog.value = false
    $q.notify({ type: 'positive', message: 'Recorrencia salva' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar' })
  } finally {
    salvando.value = false
  }
}

const dialogGerar = ref(false)
const recorrenciaGerar = ref<Recorrencia | null>(null)
const competencia = ref(hoje())

function abrirGerar(row: Recorrencia) {
  recorrenciaGerar.value = row
  competencia.value = hoje()
  dialogGerar.value = true
}

async function gerar() {
  if (!recorrenciaGerar.value) return
  salvando.value = true
  try {
    await store.gerar(recorrenciaGerar.value.id, competencia.value)
    dialogGerar.value = false
    $q.notify({ type: 'positive', message: 'Lancamento gerado' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao gerar' })
  } finally {
    salvando.value = false
  }
}

function remover(row: Recorrencia) {
  $q.dialog({ title: 'Remover', message: 'Remover esta recorrencia?', cancel: true }).onOk(
    async () => {
      await store.remover(row.id)
      $q.notify({ type: 'positive', message: 'Removida' })
    }
  )
}

onMounted(() => {
  store.carregar()
  carteiras.carregar()
  categorias.carregar()
})
</script>
