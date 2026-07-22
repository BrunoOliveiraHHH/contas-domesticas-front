<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">Configuracao</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Parametro" @click="abrirNovo" />
    </div>

    <q-card flat class="cd-card q-mb-lg">
      <q-card-section class="row items-center q-gutter-md">
        <div class="cd-section-title">Exibicao</div>
        <q-select
          v-model="moeda"
          :options="moedaOpcoes"
          label="Moeda"
          emit-value
          map-options
          dense
          outlined
          style="min-width: 220px"
          @update:model-value="salvarMoeda"
        />
        <div class="text-caption text-grey">Exemplo: {{ exemplo }} · datas em DD/MM/AAAA</div>
      </q-card-section>
    </q-card>

    <div class="text-subtitle1 q-mb-sm">Parametros (indices e aliquotas)</div>
    <q-table
      :rows="store.parametros"
      :columns="colunas"
      row-key="id"
      :loading="store.carregando"
      flat
      bordered
    >
      <template #body-cell-acoes="props">
        <q-td :props="props" class="text-right">
          <q-btn flat dense round icon="edit" color="primary" @click="editar(props.row)" />
          <q-btn flat dense round icon="delete" color="negative" @click="remover(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-separator class="q-my-lg" />

    <div class="text-subtitle1 q-mb-sm">Preferencia</div>
    <q-card flat bordered>
      <q-card-section class="q-gutter-md">
        <q-input v-model="prefChave" label="Chave (ex: tema, moeda_padrao)" dense />
        <div class="row items-center q-gutter-sm">
          <q-input v-model="prefValor" label="Valor" dense class="col" />
          <q-btn
            color="secondary"
            label="Resolver"
            :loading="prefCarregando"
            @click="resolverPref"
          />
          <q-btn color="primary" label="Gravar" :loading="prefCarregando" @click="gravarPref" />
        </div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 360px">
        <q-card-section class="text-h6"
          >{{ editandoId ? 'Editar' : 'Novo' }} parametro</q-card-section
        >
        <q-card-section>
          <q-form class="q-gutter-md" @submit="salvar">
            <q-input
              v-model="form.chave"
              label="Chave (ex: SELIC, CDI, IPCA, IR_ALIQUOTA)"
              :rules="[(v) => !!v || 'Informe']"
            />
            <q-input v-model.number="form.valor" type="number" step="0.0001" label="Valor" />
            <q-input v-model="form.vigenciaInicio" type="date" label="Vigencia inicio" />
            <q-input v-model="form.descricao" label="Descricao" />
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
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useConfiguracaoStore } from 'stores/configuracao'
import { usePreferenciasStore } from 'stores/preferencias'
import { formatarData, formatarMoeda } from 'src/utils/format'
import type { Parametro, ParametroRequest } from 'src/services/configuracao'

const $q = useQuasar()
const store = useConfiguracaoStore()
const preferencias = usePreferenciasStore()

// Moeda de exibicao (base BRL)
const moeda = ref(preferencias.moeda)
const moedaOpcoes = [
  { label: 'Real (R$ · BRL)', value: 'BRL' },
  { label: 'Dolar (US$ · USD)', value: 'USD' },
  { label: 'Euro (€ · EUR)', value: 'EUR' },
  { label: 'Libra (£ · GBP)', value: 'GBP' }
]
const exemplo = computed(() => formatarMoeda(1234.5, moeda.value))
async function salvarMoeda(m: string) {
  try {
    await preferencias.definirMoeda(m)
    $q.notify({ type: 'positive', message: 'Moeda atualizada' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar moeda' })
  }
}

const colunas = [
  { name: 'chave', label: 'Chave', field: 'chave', align: 'left' as const, sortable: true },
  { name: 'valor', label: 'Valor', field: 'valor', align: 'right' as const },
  {
    name: 'vigenciaInicio',
    label: 'Vigencia',
    field: 'vigenciaInicio',
    align: 'left' as const,
    sortable: true,
    format: (v: string) => formatarData(v)
  },
  { name: 'descricao', label: 'Descricao', field: 'descricao', align: 'left' as const },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' as const }
]

const hoje = () => new Date().toISOString().slice(0, 10)

const dialog = ref(false)
const salvando = ref(false)
const editandoId = ref<number | null>(null)
const form = reactive<ParametroRequest>({
  chave: '',
  valor: 0,
  vigenciaInicio: hoje(),
  descricao: ''
})

function abrirNovo() {
  editandoId.value = null
  Object.assign(form, { chave: '', valor: 0, vigenciaInicio: hoje(), descricao: '' })
  dialog.value = true
}

function editar(row: Parametro) {
  editandoId.value = row.id
  Object.assign(form, {
    chave: row.chave,
    valor: row.valor,
    vigenciaInicio: row.vigenciaInicio,
    descricao: row.descricao ?? ''
  })
  dialog.value = true
}

async function salvar() {
  salvando.value = true
  try {
    await store.salvar({ ...form }, editandoId.value ?? undefined)
    dialog.value = false
    $q.notify({ type: 'positive', message: 'Parametro salvo' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar' })
  } finally {
    salvando.value = false
  }
}

function remover(row: Parametro) {
  $q.dialog({ title: 'Remover', message: 'Remover este parametro?', cancel: true }).onOk(
    async () => {
      await store.remover(row.id)
      $q.notify({ type: 'positive', message: 'Removido' })
    }
  )
}

const prefChave = ref('')
const prefValor = ref('')
const prefCarregando = ref(false)

async function resolverPref() {
  if (!prefChave.value) return
  prefCarregando.value = true
  try {
    const pref = await store.resolverPreferencia(prefChave.value)
    prefValor.value = pref.valor
    $q.notify({ type: 'positive', message: 'Preferencia carregada' })
  } catch {
    $q.notify({ type: 'warning', message: 'Preferencia nao encontrada' })
  } finally {
    prefCarregando.value = false
  }
}

async function gravarPref() {
  if (!prefChave.value) return
  prefCarregando.value = true
  try {
    await store.gravarPreferencia(prefChave.value, { valor: prefValor.value })
    $q.notify({ type: 'positive', message: 'Preferencia gravada' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao gravar' })
  } finally {
    prefCarregando.value = false
  }
}

onMounted(() => {
  store.carregar()
})
</script>
