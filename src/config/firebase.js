const { db, connect, disconnect } = require('./database');

module.exports = { db, getFirebaseApp: connect, storage: disconnect };
