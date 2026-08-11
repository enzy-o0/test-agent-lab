describe('sample', () => {
    it('finds the content "Design Your Sundae!"', () => {
        cy.visit(Cypress.config().baseUrl);
        cy.contains('Design Your Sundae!');
    });
});
