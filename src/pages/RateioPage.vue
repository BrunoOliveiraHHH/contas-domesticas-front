<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">{{ t('titulos.divisao') }}</div>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">Dividir uma despesa (partes iguais)</div>
        <div class="q-gutter-md" style="max-width: 480px">
          <q-select
            v-model="despesaId"
            :options="despesaOpcoes"
            label="Despesa"
            emit-value
            map-options
          />
          <q-select
            v-model="participantes"
            :options="usuarioOpcoes"
            label="Participantes"
            emit-value
            map-options
            multiple
            use-chips
          />
          <q-btn color="primary" label="Dividir igualmente" :loading="rateando" @click="ratear" />
        </div>
      </q-card-section>
    </q-card>

    <div class="row items-center q-mb-md">
      <div class="text-subtitle1">Acerto do periodo</div>
      <q-space />
      <q-input
        v-model="periodo"
        type="month"
        dense
        label="Periodo"
        style="max-width: 180px"
        @update:model-value="carregarAcerto"
      />
    </div>
    <q-table
      :rows="acerto"
      :columns="colunas"
      row-key="usuarioId"
      :loading="carregandoAcerto"
      flat
      bordered
    >
      <template #body-cell-total="props">
        <q-td :props="props" class="text-right">
          <span class="cd-money" :class="props.row.total >= 0 ? 'cd-money--pos' : 'cd-money--neg'">
            {{ props.row.total >= 0 ? '+' : '−' }} {{ brl(Math.abs(props.row.total)) }}
          </span>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatarMoeda } from 'src/utils/format'
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useDespesasStore } from 'stores/lancamentos'
import { rateiosService, type AcertoItem } from 'src/services/lancamentos'
import { usuariosService, type Usuario } from 'src/services/usuarios'

const { t } = useI18n()

const $q = useQuasar()
const store = useDespesasStore()

const usuarios = ref<Usuario[]>([])
const usuarioOpcoes = computed(() =>
  usuarios.value.map((u) => ({ label: u.nomeExibicao || u.login, value: u.id }))
)
const despesaOpcoes = computed(() =>
  store.itens.map((d) => ({ label: `${d.descricao} (${brl(d.valor)})`, value: d.id }))
)

const brl = (valor: number | null | undefined) => formatarMoeda(valor)

const despesaId = ref<number | null>(null)
const participantes = ref<number[]>([])
const rateando = ref(false)

async function ratear() {
  if (!despesaId.value || participantes.value.length === 0) {
    $q.notify({ type: 'warning', message: 'Selecione a despesa e os participantes' })
    return
  }
  rateando.value = true
  try {
    await store.ratear(despesaId.value, {
      tipo: 'IGUAL',
      participantes: participantes.value.map((usuarioId) => ({ usuarioId }))
    })
    $q.notify({ type: 'positive', message: 'Despesa dividida' })
    await carregarAcerto()
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao dividir' })
  } finally {
    rateando.value = false
  }
}

const colunas = [
  {
    name: 'usuarioLogin',
    label: 'Usuario',
    field: 'usuarioLogin',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'total',
    label: 'Saldo (a receber / a pagar)',
    field: 'total',
    align: 'right' as const,
    sortable: true
  }
]

const periodo = ref(new Date().toISOString().slice(0, 7))
const acerto = ref<AcertoItem[]>([])
const carregandoAcerto = ref(false)

async function carregarAcerto() {
  carregandoAcerto.value = true
  try {
    acerto.value = await rateiosService.acerto(periodo.value)
  } finally {
    carregandoAcerto.value = false
  }
}

onMounted(async () => {
  store.carregar()
  usuarios.value = await usuariosService.listar()
  await carregarAcerto()
})
</script>
