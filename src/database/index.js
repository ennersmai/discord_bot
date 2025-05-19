const { syncDatabase } = require('./models');
const dbService = require('./services/dbService');

// Initialize the database
async function initDatabase() {
    try {
        console.log('Initializing database...');
        await syncDatabase();
        console.log('Database initialized successfully!');
        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        return false;
    }
}

module.exports = {
    initDatabase,
    ...dbService
}; 