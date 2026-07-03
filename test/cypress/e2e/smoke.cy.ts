describe('smoke', () => {
  it('abre a tela de login', () => {
    cy.visit('/#/login')
    cy.contains('Entrar')
  })
})
