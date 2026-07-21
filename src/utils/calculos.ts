// Funcoes puras de calculo financeiro (espelhadas no app Android).

export interface ResultadoInvestimento {
  totalInvestido: number
  montante: number
  juros: number
}

/**
 * Juros compostos com aportes mensais.
 * @param inicial aporte inicial
 * @param mensal aporte mensal
 * @param taxaMensalPercent taxa ao mes em % (ex: 1 = 1%)
 * @param meses numero de meses
 */
export function calcularInvestimento(
  inicial: number,
  mensal: number,
  taxaMensalPercent: number,
  meses: number
): ResultadoInvestimento {
  const i = taxaMensalPercent / 100
  let montante = inicial
  for (let m = 0; m < meses; m++) {
    montante = montante * (1 + i) + mensal
  }
  const totalInvestido = inicial + mensal * meses
  return {
    totalInvestido,
    montante,
    juros: montante - totalInvestido
  }
}

export interface ParcelaFinanciamento {
  numero: number
  juros: number
  amortizacao: number
  parcela: number
  saldo: number
}

export interface ResultadoFinanciamento {
  parcelas: ParcelaFinanciamento[]
  totalPago: number
  totalJuros: number
}

/**
 * Tabela Price (parcelas fixas) ou SAC (amortizacao constante).
 */
export function calcularFinanciamento(
  valor: number,
  taxaMensalPercent: number,
  meses: number,
  sistema: 'PRICE' | 'SAC'
): ResultadoFinanciamento {
  const i = taxaMensalPercent / 100
  const parcelas: ParcelaFinanciamento[] = []
  let saldo = valor
  let totalPago = 0

  if (sistema === 'PRICE') {
    const parcela = i === 0 ? valor / meses : (valor * i) / (1 - Math.pow(1 + i, -meses))
    for (let n = 1; n <= meses; n++) {
      const juros = saldo * i
      const amortizacao = parcela - juros
      saldo = Math.max(0, saldo - amortizacao)
      totalPago += parcela
      parcelas.push({ numero: n, juros, amortizacao, parcela, saldo })
    }
  } else {
    const amortizacao = valor / meses
    for (let n = 1; n <= meses; n++) {
      const juros = saldo * i
      const parcela = amortizacao + juros
      saldo = Math.max(0, saldo - amortizacao)
      totalPago += parcela
      parcelas.push({ numero: n, juros, amortizacao, parcela, saldo })
    }
  }

  return { parcelas, totalPago, totalJuros: totalPago - valor }
}

/**
 * Preco por unidade base (para comparar embalagens).
 */
export function precoPorUnidade(preco: number, quantidade: number): number {
  if (quantidade <= 0) return 0
  return preco / quantidade
}
