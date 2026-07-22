<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">{{ t('titulos.parcelamento') }}</div>

    <q-card flat bordered style="max-width: 480px">
      <q-card-section>
        <q-form class="q-gutter-md" @submit="gerar">
          <q-input v-model="form.descricao" label="Descricao" :rules="[(v) => !!v || 'Informe']" />
          <q-input v-model.number="form.valorTotal" type="number" step="0.01" label="Valor total" />
          <q-input v-model.number="form.parcelas" type="number" label="Parcelas (min 2)" />
          <q-input v-model="form.primeiroVencimento" type="date" label="Primeiro vencimento" />
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
            label="Categoria (despesa)"
            emit-value
            map-options
          />
          <q-btn type="submit" color="primary" label="Gerar parcelas" :loading="gerando" />
        </q-form>
      </q-card-section>
    </q-card>

    <q-table
      v-if="parcelas.length"
      :rows="parcelas"
      :columns="colunas"
      row-key="id"
      flat
      bordered
      class="q-mt-md"
      style="max-width: 640px"
    />
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
import type { Lancamento, ParcelamentoRequest } from 'src/services/lancamentos'

const { t } = useI18n()

const $q = useQuasar()
const store = useDespesasStore()
const carteiras = useCarteirasStore()
const categorias = useCategoriaStore()

const carteiraOpcoes = computed(() => carteiras.itens.map((c) => ({ label: c.nome, value: c.id })))
const categoriaOpcoes = computed(() =>
  categorias.itens
    .filter((c) => c.tipo === 'DESPESA')
    .map((c) => ({ label: c.nome as string, value: c.id }))
)

const colunas = [
  { name: 'descricao', label: 'Descricao', field: 'descricao', align: 'left' as const },
  {
    name: 'valor',
    label: 'Valor',
    field: 'valor',
    align: 'right' as const,
    format: (v: number) => formatarMoeda(v)
  },
  {
    name: 'dataVencimento',
    label: 'Vencimento',
    field: 'dataVencimento',
    align: 'left' as const,
    format: (v: string) => formatarData(v)
  }
]

const hoje = () => new Date().toISOString().slice(0, 10)

const gerando = ref(false)
const parcelas = ref<Lancamento[]>([])
const form = reactive<ParcelamentoRequest>({
  descricao: '',
  valorTotal: 0,
  parcelas: 2,
  primeiroVencimento: hoje(),
  carteiraId: 0,
  categoriaId: 0
})

async function gerar() {
  gerando.value = true
  try {
    parcelas.value = await store.parcelar({ ...form })
    $q.notify({ type: 'positive', message: `${parcelas.value.length} parcelas geradas` })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao parcelar' })
  } finally {
    gerando.value = false
  }
}

onMounted(() => {
  carteiras.carregar()
  categorias.carregar()
})
</script>
