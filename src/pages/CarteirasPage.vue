<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('titulos.carteiras') }}</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nova" @click="abrirNova" />
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
        <q-td :props="props">
          <q-badge
            :color="props.row.tipo === 'FAMILIAR' ? 'purple-6' : 'blue-7'"
            :label="props.row.tipo === 'FAMILIAR' ? 'Familiar' : 'Individual'"
          />
        </q-td>
      </template>
      <template #body-cell-saldoInicial="props">
        <q-td :props="props" class="text-right"
          ><span class="cd-money">{{ brl(props.row.saldoInicial) }}</span></q-td
        >
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
        <q-card-section class="text-h6">{{
          editando ? 'Editar carteira' : 'Nova carteira'
        }}</q-card-section>
        <q-card-section>
          <q-form @submit="salvar" class="q-gutter-md">
            <q-input v-model="form.nome" label="Nome" :rules="[(v) => !!v || 'Informe o nome']" />
            <q-select v-model="form.tipo" :options="tipos" label="Tipo" emit-value map-options />
            <q-input v-model.number="form.saldoInicial" type="number" label="Saldo inicial" />
            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="Cancelar" v-close-popup />
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
import { useCarteirasStore } from 'stores/carteiras'
import { formatarMoeda } from 'src/utils/format'
import type { Carteira, CarteiraRequest, TipoCarteira } from 'src/services/carteiras'

const { t } = useI18n()

const $q = useQuasar()
const store = useCarteirasStore()

const brl = (v: number | null | undefined) => formatarMoeda(v)

const colunas = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' as const, sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' as const, sortable: true },
  {
    name: 'saldoInicial',
    label: 'Saldo inicial',
    field: 'saldoInicial',
    align: 'right' as const,
    sortable: true
  },
  { name: 'moeda', label: 'Moeda', field: 'moeda', align: 'left' as const, sortable: true },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' as const }
]
const tipos = [
  { label: 'Familiar', value: 'FAMILIAR' },
  { label: 'Individual', value: 'INDIVIDUAL' }
]

const dialog = ref(false)
const salvando = ref(false)
const editando = ref<number | null>(null)
const form = reactive<CarteiraRequest>({ nome: '', tipo: 'FAMILIAR', saldoInicial: 0 })

function abrirNova() {
  editando.value = null
  Object.assign(form, { nome: '', tipo: 'FAMILIAR' as TipoCarteira, saldoInicial: 0 })
  dialog.value = true
}

function abrirEdicao(c: Carteira) {
  editando.value = c.id
  Object.assign(form, { nome: c.nome, tipo: c.tipo, saldoInicial: c.saldoInicial })
  dialog.value = true
}

async function salvar() {
  salvando.value = true
  try {
    await store.salvar({ ...form }, editando.value ?? undefined)
    dialog.value = false
    $q.notify({ type: 'positive', message: 'Carteira salva' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar' })
  } finally {
    salvando.value = false
  }
}

function confirmarRemocao(c: Carteira) {
  $q.dialog({ title: 'Remover', message: `Remover a carteira "${c.nome}"?`, cancel: true }).onOk(
    async () => {
      try {
        await store.remover(c.id)
        $q.notify({ type: 'positive', message: 'Removida' })
      } catch {
        $q.notify({ type: 'negative', message: 'Nao foi possivel remover' })
      }
    }
  )
}

onMounted(() => store.carregar())
</script>
