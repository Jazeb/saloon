const { ApolloServer } = require('apollo-server-express');

const schemaWithResolvers = require('./graphql/index');
const { CONFIG } = require("./config/keys");


const app = require("./config/express");
const PORT = CONFIG.port || 3001;
const ENV = CONFIG.env;

const http = require('http').createServer(app);

const apolloServer = new ApolloServer({
    
    schema: schemaWithResolvers,
    subscriptions: {
        keepAlive: true,
        onConnect: (connectionParams, webSocket, context) => console.log('Connected!'),
        onDisconnect: (webSocket, context) => console.log('Disconnected!')
    }
});

apolloServer.applyMiddleware({ app });
apolloServer.installSubscriptionHandlers(http);

http.listen(PORT, _ => console.log(`Server is running on port ${PORT}, ${ENV} `));


// const io = require('socket.io').listen(http);
// io.on('connection', (socket) => {
//     console.log(socket.id);
//     socket.emit('hello', socket.id)
// });