const _ = require('lodash');
const { verifyToken, validateUser } = require('../utils/shared');

const authAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const auth_token = authHeader && authHeader.split(' ')[1];
        if (auth_token == null) return res.sendStatus(401);
    
        const token = await verifyToken(auth_token);
        if (!token) return res.sendStatus(401);
    
        // const user = await validateUser(token);
        // if (!user) return res.sendStatus(401);
        req.user = token;
        next();
        
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
        return
    }
}

const authCustomer = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const auth_token = authHeader && authHeader.split(' ')[1];
        if (auth_token == null) return res.sendStatus(401);
    
        const token = await verifyToken(auth_token);
        if (!token || token.user_type !== 'CUSTOMER') return res.sendStatus(401);
    
        const user = await validateUser(token);
        if (!user) return res.sendStatus(401);
        req.user = user;
        next();
        
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
        return
    }
}

const authVendor = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const auth_token = authHeader && authHeader.split(' ')[1];
        if (auth_token == null) return res.sendStatus(401);
        
        const token = await verifyToken(auth_token);
        if (!token || token.user_type !== 'VENDOR') return res.sendStatus(401);
        
        const user = await validateUser(token);
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return
    }
}

module.exports = { authCustomer, authVendor, authAdmin };
