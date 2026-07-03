import { boot } from 'quasar/wrappers'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

export default boot(({ app }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } }
  })
  app.use(VueQueryPlugin, { queryClient })
})
