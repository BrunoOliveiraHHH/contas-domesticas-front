<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('titulos.categorias') }}</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Novo" @click="abrirNovo" />
    </div>

    <q-table
      :rows="store.itens"
      :columns="colunas"
      row-key="id"
      :loading="store.carregando"
      :pagination="{ rowsPerPage: 25, sortBy: 'nome' }"
      :rows-per-page-options="[10, 25, 50, 100]"
      flat
      bordered
    >
      <template #body-cell-nome="props">
        <q-td :props="props"><CdCategoriaChip :nome="props.row.nome" :cor="props.row.cor" /></q-td>
      </template>
      <template #body-cell-tipo="props">
        <q-td :props="props"
          ><q-badge :color="tipoCor(props.row.tipo)" :label="tipoLabel(props.row.tipo)"
        /></q-td>
      </template>
      <template #body-cell-acoes="props">
        <q-td :props="props" class="text-right">
          <q-btn flat dense round icon="edit" @click="abrirEdicao(props.row)" />
          <q-btn
            flat
            dense
            round
            icon="delete"
            color="negative"
            @click="confirmarRemocao(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 340px">
        <q-card-section class="text-h6">{{ editando ? 'Editar' : 'Novo' }}</q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" @submit="salvar">
            <q-input v-model="form.nome" label="Nome" :rules="[(v) => !!v || 'Informe nome']" />
            <q-select
              v-model="form.tipo"
              :options="['RECEITA', 'DESPESA', 'INVESTIMENTO']"
              label="Tipo"
            />
            <q-input v-model="form.cor" label="Cor" />
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
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useCategoriaStore } from 'stores/categorias'
import type { Categoria, CategoriaRequest } from 'src/services/categorias'
import CdCategoriaChip from 'components/CdCategoriaChip.vue'

const { t } = useI18n()

const $q = useQuasar()
const store = useCategoriaStore()

const TIPO_LABEL: Record<string, string> = {
  RECEITA: 'Receita',
  DESPESA: 'Despesa',
  INVESTIMENTO: 'Investimento'
}
const TIPO_COR: Record<string, string> = {
  RECEITA: 'green-7',
  DESPESA: 'pink-7',
  INVESTIMENTO: 'blue-7'
}
function tipoLabel(t?: string | null) {
  return TIPO_LABEL[t ?? ''] ?? t ?? '—'
}
function tipoCor(t?: string | null) {
  return TIPO_COR[t ?? ''] ?? 'grey-6'
}

const colunas = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' as const, sortable: true },
  {
    name: 'tipo',
    label: 'Tipo',
    field: 'tipo',
    align: 'left' as const,
    sortable: true,
    sort: (a: string | null, b: string | null) => tipoLabel(a).localeCompare(tipoLabel(b))
  },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' as const }
]

const dialog = ref(false)
const salvando = ref(false)
const editando = ref<number | null>(null)
const form = reactive<CategoriaRequest>({ nome: '', tipo: 'RECEITA', cor: '' })

function abrirNovo() {
  editando.value = null
  Object.assign(form, { nome: '', tipo: 'RECEITA', cor: '' })
  dialog.value = true
}

function abrirEdicao(row: Categoria) {
  editando.value = row.id
  Object.assign(form, { nome: row.nome, tipo: row.tipo, cor: row.cor })
  dialog.value = true
}

async function salvar() {
  salvando.value = true
  try {
    await store.salvar({ ...form }, editando.value ?? undefined)
    dialog.value = false
    $q.notify({ type: 'positive', message: 'Salvo' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar' })
  } finally {
    salvando.value = false
  }
}

function confirmarRemocao(row: Categoria) {
  $q.dialog({ title: 'Remover', message: 'Remover este registro?', cancel: true }).onOk(
    async () => {
      try {
        await store.remover(row.id)
        $q.notify({ type: 'positive', message: 'Removido' })
      } catch {
        $q.notify({ type: 'negative', message: 'Nao foi possivel remover' })
      }
    }
  )
}

onMounted(() => store.carregar())
</script>
