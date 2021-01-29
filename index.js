const {
    ApolloServer
} = require('apollo-server');
const dotenv = require('dotenv')

// Load database connection function
const db = require('./config/connectdb');

// Load env variables
dotenv.config({ path: './config.env' })

// Connect to database
db.connectDB();

// Load typedefs
const typeDefs = require('./graphql/typedefs');

// Load resolvers
const resolvers = require('./graphql/resolvers')


const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req })
});

server.listen({
        port: 5000
    })
    .then(res => {
        console.log(`Server running at ${res.url}`);
    });