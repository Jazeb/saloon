const request = require('request');
const { PORT, URL } = require('./constant');
const baseUrl = `${URL}:${PORT}`;

module.exports = {
    baseUrl, request
}