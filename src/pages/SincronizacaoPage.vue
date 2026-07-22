<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('titulos.sincronizacao') }}</div>
      <q-space />
      <q-btn
        color="primary"
        icon="sync"
        label="Sincronizar agora"
        :loading="store.sincronizando"
        @click="sincronizar"
      />
    </div>

    <q-banner class="bg-grey-2 q-mb-md">
      <template #avatar><q-icon name="schedule" color="primary" /></template>
      Ultima sincronizacao: {{ store.ultimaSync ? formatar(store.ultimaSync) : 'nunca' }}
      <div class="text-caption text-grey">
        Puxa o delta de mercados (entidade de referencia) desde o ultimo carimbo. Merge por versao
        com tombstone (deletado).
      </div>
    </q-banner>

    <q-table
      :rows="store.registros"
      :columns="colunas"
      row-key="uuid"
      :loading="store.sincronizando"
      flat
      bordered
    >
      <template #body-cell-deletado="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.deletado ? 'negative' : 'positive'"
            :label="props.row.deletado ? 'removido' : 'ativo'"
          />
        </q-td>
      </template>
    </q-table>

    <div v-if="store.registros.length" class="q-mt-md">
      <q-btn
        outline
        color="secondary"
        icon="upload"
        label="Reenviar (merge)"
        :loading="enviando"
        @click="enviar"
      />
      <div class="text-caption text-grey q-mt-xs">
        Reenvia os registros exibidos para o merge (last-write-wins por versao).
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useSyncStore } from 'stores/sync'

const { t } = useI18n()

const $q = useQuasar()
const store = useSyncStore()
const enviando = ref(false)

const colunas = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' as const },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' as const },
  { name: 'versao', label: 'Versao', field: 'versao', align: 'right' as const },
  { name: 'deletado', label: 'Estado', field: 'deletado', align: 'left' as const },
  { name: 'atualizadoEm', label: 'Atualizado em', field: 'atualizadoEm', align: 'left' as const }
]

function formatar(iso: string) {
  return new Date(iso).toLocaleString('pt-BR')
}

async function sincronizar() {
  try {
    const registros = await store.sincronizar()
    $q.notify({ type: 'positive', message: `${registros.length} registro(s) sincronizado(s)` })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao sincronizar' })
  }
}

async function enviar() {
  enviando.value = true
  try {
    await store.enviar(store.registros)
    $q.notify({ type: 'positive', message: 'Merge enviado' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao enviar' })
  } finally {
    enviando.value = false
  }
}
</script>
