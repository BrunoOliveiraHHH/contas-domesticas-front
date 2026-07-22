import { usePreferenciasStore } from 'stores/preferencias'

// Moeda configurada nas preferencias (base BRL). Locale sempre pt-BR para exibicao.
export function formatarMoeda(valor: number | null | undefined, moeda?: string): string {
  const cur = moeda || safeMoeda()
  return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: cur })
}

function safeMoeda(): string {
  try {
    return usePreferenciasStore().moeda || 'BRL'
  } catch {
    return 'BRL'
  }
}

// Data no formato brasileiro DD/MM/AAAA. Aceita 'YYYY-MM-DD' ou ISO completo.
export function formatarData(iso: string | null | undefined): string {
  if (!iso) return '-'
  const s = String(iso).slice(0, 10)
  const [y, m, d] = s.split('-')
  if (!y || !m || !d) return String(iso)
  return `${d}/${m}/${y}`
}

// Periodo 'YYYY-MM' -> 'MM/AAAA'. Ano 'YYYY' -> 'AAAA'.
export function formatarPeriodo(p: string): string {
  const [y, m] = p.split('-')
  if (m) return `${m}/${y}`
  return String(y)
}

// Rotulo curto de mes 'YYYY-MM' -> 'MM/AA' (para eixos de grafico).
export function rotuloMesCurto(p: string): string {
  const [y, m] = p.split('-')
  return `${m}/${(y ?? '').slice(2)}`
}
