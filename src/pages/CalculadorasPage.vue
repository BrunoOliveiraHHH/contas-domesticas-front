<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">{{ t('titulos.calculadoras') }}</div>

    <q-tabs v-model="aba" dense align="left" class="text-primary q-mb-md">
      <q-tab name="investimento" label="Investimento" />
      <q-tab name="ir" label="IR" />
      <q-tab name="financiamento" label="Financiamento" />
      <q-tab name="preco" label="Preco/unidade" />
    </q-tabs>

    <q-tab-panels v-model="aba" animated>
      <!-- Investimento -->
      <q-tab-panel name="investimento">
        <div class="q-gutter-md" style="max-width: 420px">
          <q-input v-model.number="inv.inicial" type="number" label="Aporte inicial" />
          <q-input v-model.number="inv.mensal" type="number" label="Aporte mensal" />
          <q-input v-model.number="inv.taxa" type="number" step="0.01" label="Taxa mensal (%)" />
          <q-input v-model.number="inv.meses" type="number" label="Meses" />
        </div>
        <q-list bordered class="q-mt-md" style="max-width: 420px">
          <q-item>
            <q-item-section>Total investido</q-item-section>
            <q-item-section side>{{ brl(invResultado.totalInvestido) }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Juros</q-item-section>
            <q-item-section side>{{ brl(invResultado.juros) }}</q-item-section>
          </q-item>
          <q-item class="text-weight-bold">
            <q-item-section>Montante</q-item-section>
            <q-item-section side>{{ brl(invResultado.montante) }}</q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <!-- IR -->
      <q-tab-panel name="ir">
        <div class="q-gutter-md" style="max-width: 420px">
          <q-input v-model.number="ir.rendimento" type="number" label="Rendimento (R$)" />
          <q-input v-model.number="ir.dias" type="number" label="Dias aplicado" />
          <q-btn
            color="primary"
            label="Calcular (via API)"
            :loading="ir.carregando"
            @click="calcularIr"
          />
        </div>
        <q-list v-if="ir.aliquota != null" bordered class="q-mt-md" style="max-width: 420px">
          <q-item>
            <q-item-section>Aliquota</q-item-section>
            <q-item-section side>{{ (ir.aliquota * 100).toFixed(1) }}%</q-item-section>
          </q-item>
          <q-item class="text-weight-bold">
            <q-item-section>Imposto</q-item-section>
            <q-item-section side>{{ brl(ir.rendimento * ir.aliquota) }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Liquido</q-item-section>
            <q-item-section side>{{ brl(ir.rendimento * (1 - ir.aliquota)) }}</q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <!-- Financiamento -->
      <q-tab-panel name="financiamento">
        <div class="q-gutter-md" style="max-width: 420px">
          <q-input v-model.number="fin.valor" type="number" label="Valor financiado" />
          <q-input v-model.number="fin.taxa" type="number" step="0.01" label="Taxa mensal (%)" />
          <q-input v-model.number="fin.meses" type="number" label="Meses" />
          <q-select v-model="fin.sistema" :options="['PRICE', 'SAC']" label="Sistema" />
        </div>
        <q-list bordered class="q-mt-md" style="max-width: 420px">
          <q-item>
            <q-item-section>1a parcela</q-item-section>
            <q-item-section side>{{ brl(finResultado.parcelas[0]?.parcela ?? 0) }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Ultima parcela</q-item-section>
            <q-item-section side>{{ brl(ultimaParcela) }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Total juros</q-item-section>
            <q-item-section side>{{ brl(finResultado.totalJuros) }}</q-item-section>
          </q-item>
          <q-item class="text-weight-bold">
            <q-item-section>Total pago</q-item-section>
            <q-item-section side>{{ brl(finResultado.totalPago) }}</q-item-section>
          </q-item>
        </q-list>
        <q-table
          :rows="finResultado.parcelas"
          :columns="colunasFin"
          row-key="numero"
          dense
          flat
          bordered
          class="q-mt-md"
          :rows-per-page-options="[12, 24, 0]"
        />
      </q-tab-panel>

      <!-- Preco por unidade -->
      <q-tab-panel name="preco">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <div class="text-subtitle2 q-mb-sm">Opcao A</div>
            <q-input v-model.number="precoA.preco" type="number" label="Preco (R$)" />
            <q-input v-model.number="precoA.qtd" type="number" label="Quantidade" />
            <div class="q-mt-sm">Unitario: {{ brl(unitA) }}</div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="text-subtitle2 q-mb-sm">Opcao B</div>
            <q-input v-model.number="precoB.preco" type="number" label="Preco (R$)" />
            <q-input v-model.number="precoB.qtd" type="number" label="Quantidade" />
            <div class="q-mt-sm">Unitario: {{ brl(unitB) }}</div>
          </div>
        </div>
        <q-banner v-if="unitA > 0 && unitB > 0" class="q-mt-md" :class="melhor.cor">
          {{ melhor.texto }}
        </q-banner>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatarMoeda } from 'src/utils/format'
import { computed, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { parametrosService } from 'src/services/configuracao'
import { calcularInvestimento, calcularFinanciamento, precoPorUnidade } from 'src/utils/calculos'

const { t } = useI18n()

const $q = useQuasar()
const aba = ref('investimento')

const brl = (valor: number | null | undefined) => formatarMoeda(valor)

// Investimento
const inv = reactive({ inicial: 1000, mensal: 200, taxa: 1, meses: 12 })
const invResultado = computed(() =>
  calcularInvestimento(inv.inicial || 0, inv.mensal || 0, inv.taxa || 0, inv.meses || 0)
)

// IR
const ir = reactive<{
  rendimento: number
  dias: number
  aliquota: number | null
  carregando: boolean
}>({ rendimento: 1000, dias: 200, aliquota: null, carregando: false })
async function calcularIr() {
  ir.carregando = true
  try {
    const resp = await parametrosService.impostoIr(ir.dias)
    ir.aliquota = resp.aliquota
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao consultar aliquota' })
  } finally {
    ir.carregando = false
  }
}

// Financiamento
const fin = reactive<{ valor: number; taxa: number; meses: number; sistema: 'PRICE' | 'SAC' }>({
  valor: 10000,
  taxa: 1.5,
  meses: 24,
  sistema: 'PRICE'
})
const finResultado = computed(() =>
  calcularFinanciamento(fin.valor || 0, fin.taxa || 0, fin.meses || 1, fin.sistema)
)
const ultimaParcela = computed(() => {
  const p = finResultado.value.parcelas
  return p.length ? (p[p.length - 1]?.parcela ?? 0) : 0
})
const colunasFin = [
  { name: 'numero', label: '#', field: 'numero', align: 'right' as const },
  {
    name: 'parcela',
    label: 'Parcela',
    field: 'parcela',
    align: 'right' as const,
    format: (v: number) => brl(v)
  },
  {
    name: 'juros',
    label: 'Juros',
    field: 'juros',
    align: 'right' as const,
    format: (v: number) => brl(v)
  },
  {
    name: 'amortizacao',
    label: 'Amortizacao',
    field: 'amortizacao',
    align: 'right' as const,
    format: (v: number) => brl(v)
  },
  {
    name: 'saldo',
    label: 'Saldo',
    field: 'saldo',
    align: 'right' as const,
    format: (v: number) => brl(v)
  }
]

// Preco por unidade
const precoA = reactive({ preco: 10, qtd: 500 })
const precoB = reactive({ preco: 18, qtd: 1000 })
const unitA = computed(() => precoPorUnidade(precoA.preco || 0, precoA.qtd || 0))
const unitB = computed(() => precoPorUnidade(precoB.preco || 0, precoB.qtd || 0))
const melhor = computed(() => {
  if (unitA.value === unitB.value) return { texto: 'Preco unitario igual', cor: 'bg-grey-3' }
  const aMelhor = unitA.value < unitB.value
  return {
    texto: `Opcao ${aMelhor ? 'A' : 'B'} e mais vantajosa (${brl(aMelhor ? unitA.value : unitB.value)} por unidade)`,
    cor: 'bg-green-2'
  }
})
</script>
