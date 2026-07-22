<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-btn flat dense round icon="arrow_back" @click="voltar" />
      <div class="text-h6 q-ml-sm">{{ store.listaAtual?.nome || 'Lista' }}</div>
      <q-badge
        v-if="store.listaAtual"
        :color="store.listaAtual.status === 'ABERTA' ? 'primary' : 'positive'"
        :label="store.listaAtual.status"
        class="q-ml-md"
      />
      <q-space />
      <q-btn
        v-if="store.listaAtual?.status === 'ABERTA'"
        outline
        color="secondary"
        icon="inventory"
        label="Repor estoque"
        class="q-mr-sm"
        :loading="repondo"
        @click="reporEstoque"
      />
      <q-btn
        v-if="store.listaAtual?.status === 'ABERTA'"
        color="primary"
        icon="add"
        label="Item"
        @click="dialogItem = true"
      />
    </div>

    <q-table :rows="store.itensLista" :columns="colunas" row-key="id" flat bordered>
      <template #body-cell-mercado="props">
        <q-td :props="props">
          {{ nomeMercado(props.row.mercadoEscolhidoId) }}
        </q-td>
      </template>
      <template #body-cell-comprado="props">
        <q-td :props="props">
          <q-icon
            :name="props.row.comprado ? 'check_circle' : 'radio_button_unchecked'"
            :color="props.row.comprado ? 'positive' : 'grey'"
          />
        </q-td>
      </template>
      <template #body-cell-acoes="props">
        <q-td :props="props" class="text-right">
          <q-btn
            flat
            dense
            round
            icon="storefront"
            color="primary"
            @click="abrirEscolha(props.row)"
          >
            <q-tooltip>Escolher estabelecimento</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="price_change" @click="abrirCotacao(props.row)">
            <q-tooltip>Cotacoes</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="delete" color="negative" @click="removerItem(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Novo item -->
    <q-dialog v-model="dialogItem">
      <q-card style="min-width: 340px">
        <q-card-section class="text-h6">Novo item</q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" @submit="adicionarItem">
            <q-select
              v-model="itemForm.produtoId"
              :options="produtoOpcoes"
              label="Produto"
              emit-value
              map-options
            />
            <q-input
              v-model.number="itemForm.quantidade"
              type="number"
              step="0.001"
              label="Quantidade"
            />
            <q-select
              v-model="itemForm.unidadeMedidaId"
              :options="unidadeOpcoes"
              label="Unidade"
              emit-value
              map-options
              clearable
            />
            <div class="row justify-end q-gutter-sm">
              <q-btn v-close-popup flat label="Cancelar" />
              <q-btn type="submit" color="primary" label="Adicionar" :loading="salvando" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Escolher estabelecimento -->
    <q-dialog v-model="dialogEscolha">
      <q-card style="min-width: 320px">
        <q-card-section class="text-h6">Escolher estabelecimento</q-card-section>
        <q-card-section>
          <q-select
            v-model="mercadoEscolha"
            :options="mercadoOpcoes"
            label="Estabelecimento"
            emit-value
            map-options
          />
          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn v-close-popup flat label="Cancelar" />
            <q-btn
              color="primary"
              label="Confirmar"
              :loading="salvando"
              @click="confirmarEscolha"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Cotacoes do produto -->
    <q-dialog v-model="dialogCotacao">
      <q-card style="min-width: 360px">
        <q-card-section class="text-h6">
          Cotacoes
          <div class="text-caption text-grey">{{ itemCotacao?.produtoNome }}</div>
        </q-card-section>
        <q-card-section>
          <q-list bordered separator>
            <q-item v-for="c in cotacoes" :key="c.id">
              <q-item-section>{{ nomeMercado(c.mercadoId) }}</q-item-section>
              <q-item-section side>{{ brl(c.precoUnitario) }}</q-item-section>
            </q-item>
            <q-item v-if="!cotacoes.length">
              <q-item-section class="text-grey">Sem cotacoes</q-item-section>
            </q-item>
          </q-list>
          <q-form class="q-gutter-md q-mt-md" @submit="adicionarCotacao">
            <q-select
              v-model="cotacaoForm.mercadoId"
              :options="mercadoOpcoes"
              label="Estabelecimento"
              emit-value
              map-options
            />
            <q-input
              v-model.number="cotacaoForm.precoUnitario"
              type="number"
              step="0.01"
              label="Preco unitario"
            />
            <div class="row justify-end q-gutter-sm">
              <q-btn v-close-popup flat label="Fechar" />
              <q-btn type="submit" color="primary" label="Adicionar" :loading="salvando" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { formatarMoeda } from 'src/utils/format'
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useComprasStore } from 'stores/compras'
import { useProdutoStore } from 'stores/produtos'
import { useMercadoStore } from 'stores/mercados'
import { useUnidadeMedidaStore } from 'stores/unidadesMedida'
import type {
  ItemCompra,
  ItemCompraRequest,
  CotacaoProduto,
  CotacaoProdutoRequest
} from 'src/services/compras'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const store = useComprasStore()
const produtos = useProdutoStore()
const mercados = useMercadoStore()
const unidades = useUnidadeMedidaStore()

const listaId = Number(route.params.id)

const colunas = [
  { name: 'produtoNome', label: 'Produto', field: 'produtoNome', align: 'left' as const },
  { name: 'quantidade', label: 'Qtd', field: 'quantidade', align: 'right' as const },
  { name: 'mercado', label: 'Estabelecimento', field: 'mercado', align: 'left' as const },
  {
    name: 'precoUnitario',
    label: 'Preco',
    field: 'precoUnitario',
    align: 'right' as const,
    format: (v: number | null) => (v == null ? '-' : brl(v))
  },
  { name: 'comprado', label: 'Comprado', field: 'comprado', align: 'center' as const },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' as const }
]

const produtoOpcoes = computed(() =>
  produtos.itens.map((p) => ({ label: p.nome ?? `#${p.id}`, value: p.id }))
)
const mercadoOpcoes = computed(() =>
  mercados.itens.map((m) => ({ label: m.nome ?? `#${m.id}`, value: m.id }))
)
const unidadeOpcoes = computed(() =>
  unidades.itens.map((u) => ({ label: u.sigla ?? u.nome ?? `#${u.id}`, value: u.id }))
)

const brl = (valor: number | null | undefined) => formatarMoeda(valor)
function nomeMercado(id: number | null) {
  if (id == null) return '-'
  return mercados.itens.find((m) => m.id === id)?.nome ?? `#${id}`
}

const salvando = ref(false)

// Repor estoque (adiciona os produtos abaixo do minimo)
const repondo = ref(false)
async function reporEstoque() {
  repondo.value = true
  try {
    const adicionados = await store.reporEstoque(listaId)
    if (adicionados.length) {
      $q.notify({ type: 'positive', message: `${adicionados.length} item(ns) adicionado(s)` })
    } else {
      $q.notify({ type: 'info', message: 'Nenhum produto abaixo do mínimo' })
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao repor estoque' })
  } finally {
    repondo.value = false
  }
}

// Novo item
const dialogItem = ref(false)
const itemForm = reactive<ItemCompraRequest>({ produtoId: 0, quantidade: 1, unidadeMedidaId: null })
async function adicionarItem() {
  salvando.value = true
  try {
    await store.adicionarItem(listaId, { ...itemForm })
    dialogItem.value = false
    Object.assign(itemForm, { produtoId: 0, quantidade: 1, unidadeMedidaId: null })
    $q.notify({ type: 'positive', message: 'Item adicionado' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao adicionar' })
  } finally {
    salvando.value = false
  }
}

// Escolha
const dialogEscolha = ref(false)
const itemEscolha = ref<ItemCompra | null>(null)
const mercadoEscolha = ref<number | null>(null)
function abrirEscolha(row: ItemCompra) {
  itemEscolha.value = row
  mercadoEscolha.value = row.mercadoEscolhidoId
  dialogEscolha.value = true
}
async function confirmarEscolha() {
  if (!itemEscolha.value || !mercadoEscolha.value) return
  salvando.value = true
  try {
    await store.escolherMercado(listaId, itemEscolha.value.id, mercadoEscolha.value)
    dialogEscolha.value = false
    $q.notify({ type: 'positive', message: 'Estabelecimento definido' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao escolher' })
  } finally {
    salvando.value = false
  }
}

// Cotacoes
const dialogCotacao = ref(false)
const itemCotacao = ref<ItemCompra | null>(null)
const cotacoes = ref<CotacaoProduto[]>([])
const cotacaoForm = reactive<CotacaoProdutoRequest>({ mercadoId: 0, precoUnitario: 0 })
async function abrirCotacao(row: ItemCompra) {
  itemCotacao.value = row
  Object.assign(cotacaoForm, { mercadoId: 0, precoUnitario: 0 })
  cotacoes.value = await store.cotacoes(row.produtoId)
  dialogCotacao.value = true
}
async function adicionarCotacao() {
  if (!itemCotacao.value) return
  salvando.value = true
  try {
    await store.adicionarCotacao(itemCotacao.value.produtoId, { ...cotacaoForm })
    cotacoes.value = await store.cotacoes(itemCotacao.value.produtoId)
    $q.notify({ type: 'positive', message: 'Cotacao adicionada' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao cotar' })
  } finally {
    salvando.value = false
  }
}

function removerItem(row: ItemCompra) {
  $q.dialog({ title: 'Remover', message: 'Remover este item?', cancel: true }).onOk(async () => {
    await store.removerItem(listaId, row.id)
    $q.notify({ type: 'positive', message: 'Item removido' })
  })
}

function voltar() {
  router.push('/listas-compra')
}

onMounted(() => {
  store.abrir(listaId)
  produtos.carregar()
  mercados.carregar()
  unidades.carregar()
})
</script>
