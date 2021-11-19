const pubsub = require('./pubsub');

const resolvers = {
    Subscription: {
        NEW_JOB_ALERT: { subscribe: () => pubsub.asyncIterator(['NEW_JOB_ALERT'])},
        LOCATION_UPDATE: { subscribe: () => pubsub.asyncIterator(['LOCATION_UPDATE'])},
        ORDER_STATUS: { subscribe: () => pubsub.asyncIterator(['ORDER_STATUS'])}
    },

    // this query is not used
    Query: {
        GET_PRODUCT: async (_, args, __, ___) => {
            args.status = 'LIVE'
            return
        }
    }
};

module.exports = resolvers