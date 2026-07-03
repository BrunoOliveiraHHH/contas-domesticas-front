import { describe, it, expect } from 'vitest'
import { somar, formatBRL } from 'src/util/money'

describe('util/money', () => {
  it('soma com precisao decimal (sem erro de float)', () => {
    expect(somar('0.1', '0.2').toString()).toBe('0.3')
  })

  it('formata em BRL', () => {
    expect(formatBRL('1234.5')).toContain('1.234,5')
  })
})
