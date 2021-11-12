const resp = require('../../config/api.response');
const view = require('../../utils/views');

module.exports = {
    getServices
}


function getServices(req, res) {
    view.getServices()
        .then(services => resp.success(res, services))
        .catch(err => resp.error(res, 'Error getting services', err));
}