const _ = require('lodash');
const { CONFIG } = require("../config/keys");
const { verifyToken } = require('../utils/shared');

const authenticateToken = async (req, res, next) => {
    if (!CONFIG.auth) {
        let user = { id: 1 }
        req.user = user;
        return next();
    }
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401);

    const user = await verifyToken(token);
    if (!user) return res.sendStatus(401);
    if (_.isEmpty(user)) return res.sendStatus(401);
    req.user = user;
    return next();
}

module.exports = authenticateToken;
