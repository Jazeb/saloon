const request = require('request');
const { PORT, URL } = require('./constant');
const baseUrl = `${URL}:${PORT}`;

test('User Login', (done) => {
    request.post(`${baseUrl}/api/auth/signin`, {
        form:{
            email:'jazeb@outlook.com',
            password:'password'
        }
    }, (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/)
    });
    done();
});