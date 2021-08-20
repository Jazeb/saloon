const { loadSchemaSync } = require('@graphql-tools/load');
const { addResolversToSchema } = require('@graphql-tools/schema');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { join } = require('path');

const resolvers = require('./resolvers');

const schema = loadSchemaSync(join(__dirname, './schema.graphql'), {
    loaders: [
        new GraphQLFileLoader(),
    ]
});

const schemaWithResolvers = addResolversToSchema({
    schema, resolvers,
});

module.exports = schemaWithResolvers;