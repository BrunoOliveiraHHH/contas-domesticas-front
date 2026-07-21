import { api } from 'boot/axios'

export interface FormaPagamento {
  id: number
  nome?: string
  tipo?: string
  diaFechamento?: number
  diaVencimento?: number
}

export type FormaPagamentoRequest = {
  nome?: string
  tipo?: string
  diaFechamento?: number
  diaVencimento?: number
}

const base = '/formas-pagamento'

export const formasPagamentoService = {
  listar: () => api.get<FormaPagamento[]>(base).then((r) => r.data),
  criar: (body: FormaPagamentoRequest) => api.post<FormaPagamento>(base, body).then((r) => r.data),
  atualizar: (id: number, body: FormaPagamentoRequest) =>
    api.put<FormaPagamento>(`${base}/${id}`, body).then((r) => r.data),
  remover: (id: number) => api.delete(`${base}/${id}`).then(() => undefined)
}
