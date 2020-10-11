describe('Blog app', function() {
    beforeEach(function() {
        cy.request('POST', 'http://localhost:3001/api/testing/reset');
        const user = {
            username: 'root',
            password: 'password',
            name: 'Root User'
        };
        cy.request('POST', 'http://localhost:3001/api/users', user);
        cy.visit('http://localhost:3000');
    });

    it('Login form is shown', function() {
        cy.contains('Log in');
    });

    describe('Login', function() {
        it('succeeds with correct credentials', function() {
            cy.get('#username').type('root');
            cy.get('#password').type('password');
            cy.contains('Log in').parent().find('button').click();

            cy.contains('Root User logged in');
        });

        it('fails with wrong credentials', function() {
            cy.get('#username').type('root');
            cy.get('#password').type('wrongpassword');
            cy.contains('Log in').parent().find('button').click();

            cy.get('.error')
                .should('contain', 'Wrong username or password')
                .and('have.css', 'color', 'rgb(255, 0, 0)');
        });

        describe('when logged in', function() {
            beforeEach(function() {
                cy.login({ username: 'root', password: 'password' });
            });

            it('a new blog can be added', function() {
                cy.contains('New blog').click();

                cy.get('#title').type('Blog title from Cypress');
                cy.get('#author').type('Cypress author');
                cy.get('#url').type('http://blogurl.com');
                cy.get('#create-blog-form').contains('Create').click();

                cy.get('.success')
                    .should('contain', 'New blog created')
                    .and('have.css', 'color', 'rgb(0, 128, 0)');
                cy.should('contain', 'Blog title from Cypress');
                cy.should('contain', 'Cypress author');
            });

            describe('and a blog exists', function() {
                beforeEach(function() {
                    cy.createBlog({
                        title: 'Another blog from Cypress',
                        author: 'Cypress author',
                        url: 'http://cypresstestingblogapp.nice'
                    });
                });

                it('it is possible to add a like to a blog', function() {
                    cy.contains('Another blog from Cypress')
                        .parent()
                        .contains('view')
                        .click();

                    cy.contains('Another blog from Cypress')
                        .parent()
                        .should('contain', '0 likes');

                    // Add like
                    cy.addLike('Another blog from Cypress');

                    cy.contains('Another blog from Cypress')
                        .parent()
                        .should('contain', '1 likes');

                });

                it('it is possible to delete a blog', function() {
                    cy.contains('Another blog from Cypress')
                        .parent()
                        .contains('view')
                        .click();

                    cy.contains('Another blog from Cypress')
                        .parent()
                        .contains('delete')
                        .click();

                    cy.should('not.contain', 'Another blog from Cypress');
                });
            });

            describe('and multiple blogs exist', function() {
                beforeEach(function() {
                    cy.createBlog({
                        title: 'Blog from Cypress - number 1',
                        author: 'Cypress author',
                        url: 'http://cypresstestingblogapp.nice'
                    }).then(() =>
                        cy.createBlog({
                            title: 'Blog from Cypress - number 2',
                            author: 'Cypress author',
                            url: 'http://cypresstestingblogapp.nice',
                            likes: 1
                        })).then(() =>
                        cy.createBlog({
                            title: 'Blog from Cypress - number 3',
                            author: 'Cypress author',
                            url: 'http://cypresstestingblogapp.nice',
                            likes: 2
                        }));
                });

                it('blogs are ordered by number of likes', function() {
                    cy.get('.blog>b')
                        .then(blogs => {
                            expect(blogs[0].textContent).to.equal('Blog from Cypress - number 3');
                            expect(blogs[1].textContent).to.equal('Blog from Cypress - number 2');
                            expect(blogs[2].textContent).to.equal('Blog from Cypress - number 1');
                        });
                });
            });
        });
    });
});
