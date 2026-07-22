<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('titulos.mercados') }}</div>
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
      <template #body-cell-tipo="props">
        <q-td :props="props"
          ><q-badge outline color="primary" :label="tipoLabel(props.row.tipo)"
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
              :options="['SUPERMERCADO', 'ARMAZEM', 'MERCEARIA', 'CONSTRUCAO', 'FARMACIA', 'OUTRO']"
              label="Tipo"
            />
            <q-input v-model="form.endereco" label="Endereco" />
            <q-input v-model="form.bairro" label="Bairro" />
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
import { useMercadoStore } from 'stores/mercados'
import type { Mercado, MercadoRequest } from 'src/services/mercados'

const { t } = useI18n()

const $q = useQuasar()
const store = useMercadoStore()

const TIPO_LABEL: Record<string, string> = {
  SUPERMERCADO: 'Supermercado',
  ARMAZEM: 'Armazém',
  MERCEARIA: 'Mercearia',
  CONSTRUCAO: 'Construção',
  FARMACIA: 'Farmácia',
  OUTRO: 'Outro'
}
function tipoLabel(t?: string | null) {
  return TIPO_LABEL[t ?? ''] ?? t ?? '—'
}

const colunas = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' as const, sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' as const, sortable: true },
  { name: 'bairro', label: 'Bairro', field: 'bairro', align: 'left' as const, sortable: true },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' as const }
]

const dialog = ref(false)
const salvando = ref(false)
const editando = ref<number | null>(null)
const form = reactive<MercadoRequest>({ nome: '', tipo: 'SUPERMERCADO', endereco: '', bairro: '' })

function abrirNovo() {
  editando.value = null
  Object.assign(form, { nome: '', tipo: 'SUPERMERCADO', endereco: '', bairro: '' })
  dialog.value = true
}

function abrirEdicao(row: Mercado) {
  editando.value = row.id
  Object.assign(form, {
    nome: row.nome,
    tipo: row.tipo,
    endereco: row.endereco,
    bairro: row.bairro
  })
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

function confirmarRemocao(row: Mercado) {
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
