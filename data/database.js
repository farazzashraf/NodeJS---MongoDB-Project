const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let database;

async function connect() {
    const client = await MongoClient.connect('mongodb://0.0.0.0:27017');
    database = client.db('blog');
}

function getDb() {
    if (!database) {
        throw { message: 'Database connection not established' };
    }
    return database;
}

module.exports = {
    connectToDatabase: connect,
    getDb: getDb
};

