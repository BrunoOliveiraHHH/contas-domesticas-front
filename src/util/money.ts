import Big from 'big.js'

// Aritmetica decimal para valores monetarios (evita erro de float).
export const money = (v: Big.BigSource = 0): Big => new Big(v)

export const somar = (...vals: Big.BigSource[]): Big =>
  vals.reduce<Big>((acc, v) => acc.plus(v), new Big(0))

export const formatBRL = (v: Big.BigSource): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v))
