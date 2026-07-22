<template>
  <div class="flex flex-center" style="min-height: 100vh">
    <q-card style="width: 340px" flat bordered>
      <q-card-section class="text-center">
        <div class="text-h6">Entrar</div>
        <div class="text-caption text-grey">Contas Domesticas</div>
      </q-card-section>
      <q-card-section>
        <q-form class="q-gutter-md" @submit="entrar">
          <q-input v-model="login" label="Login" :rules="[(v) => !!v || 'Informe o login']" />
          <q-input
            v-model="senha"
            type="password"
            label="Senha"
            :rules="[(v) => !!v || 'Informe a senha']"
          />
          <q-btn
            type="submit"
            color="primary"
            label="Entrar"
            class="full-width"
            :loading="carregando"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const login = ref('')
const senha = ref('')
const carregando = ref(false)
const router = useRouter()
const auth = useAuthStore()

async function entrar() {
  carregando.value = true
  try {
    await auth.login({ login: login.value, senha: senha.value })
    router.push('/')
  } finally {
    carregando.value = false
  }
}
</script>
