import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const toDate = (d: string | Date): Date => (typeof d === 'string' ? parseISO(d) : d)

export const formatData = (d: string | Date): string =>
  format(toDate(d), 'dd/MM/yyyy', { locale: ptBR })

export const formatDataHora = (d: string | Date): string =>
  format(toDate(d), 'dd/MM/yyyy HH:mm', { locale: ptBR })
