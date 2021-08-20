const { products } = require('./Queries');
const pubsub = require('./pubsub');

const resolvers = {
    Subscription: {
        BID_PLACED: { subscribe: () => pubsub.asyncIterator(['BID_PLACED'])},
        CALL_STATUS: { subscribe: () => pubsub.asyncIterator(['CALL_STATUS'])},
        PRODUCT_ADDED: { subscribe: () => pubsub.asyncIterator(['PRODUCT_ADDED']) },
        SESSION_STARTED: { subscribe: () => pubsub.asyncIterator(['SESSION_STARTED'])}
    },

    Query: {
        LIVE_PRODUCTS: async (_, args, __, ___) => {
            args.status = 'LIVE'
            return await products(args)
        },
        UPCOMMING_PRODUCTS: async (_, args, __, ___) => {
            args.status = 'UPCOMING'

            return await products(args) 
        }
    },

    // we are not using mutations
    Mutation: {
        createProduct: () => {
            let pro = {
                status: 'UPCOMMING',
                in_session: true,
                title: 'Title 3',
                description: 'Test Description 3',
                starting_bid_price: 36,
                product_type: 'NEW',
                quantity: 1,
                is_favourite: true
            }
            products.push(pro)
            return pro
        }
    }
};

module.exports = resolvers