const pubsub = require('./pubsub');

const resolvers = {
    Subscription: {
        NEW_JOB_ALERT: { subscribe: () => pubsub.asyncIterator(['NEW_JOB_ALERT'])},
        LOCATION_UPDATE: { subscribe: () => pubsub.asyncIterator(['LOCATION_UPDATE'])},
        ORDER_CANCEL: { subscribe: () => pubsub.asyncIterator(['ORDER_CANCEL'])},
        ORDER_ACCEPTED: { subscribe: () => pubsub.asyncIterator(['ORDER_ACCEPTED'])}
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