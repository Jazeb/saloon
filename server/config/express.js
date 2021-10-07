const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const express = require("express");
const cors = require('cors');

const app = express();

app.get('/favicon.ico', (req, res) => res.status(200))
app.get('/status', (req, res) => res.status(200).json({ status: true, message: 'server is running' }))

app.use(cors());
app.use(fileUpload({ createParentPath: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.disable('etag').disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('server/assets'));

app.use(express.urlencoded({ extended: false, limit: '1kb' }));

app.use('/user', require('../src/routers/user.route'));
app.use('/services', require('../src/routers/services.route'));
app.use('/admin', require('../src/routers/admin.route'));

app.use((err, req, res, next) => {
    if (err.status == 404) {
        return res.status(err.status).json({
            error: true,
            message: 'Invalid URL'
        });
    }
    res.status(err.status || 500).json({ error: true, message: 'Invalid reuqest' });
    console.trace(err);
    next(err.message);
});

module.exports = app;