require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const commandHandler = require('./handlers/commandHandler');
const eventHandler = require('./handlers/eventHandler');
const database = require('./database');
const { app, setupApiRoutes } = require('./dashboard/api');

// API server port
const API_PORT = process.env.API_PORT || 3000;

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Create collections for commands and cooldowns
client.commands = new Collection();
client.cooldowns = new Collection();

// Make database available to all event handlers
client.database = database;

// Initialize the application
async function init() {
    try {
        // Initialize database
        await database.initDatabase();
        
        // Load command and event handlers
        commandHandler(client);
        eventHandler(client);
        
        // Login to Discord
        await client.login(process.env.DISCORD_TOKEN);
        
        // Set up API routes after client is initialized
        setupApiRoutes(client);
        
        // Start API server
        app.listen(API_PORT, () => {
            console.log(`Dashboard API server running on port ${API_PORT}`);
        });
    } catch (error) {
        console.error('Error initializing application:', error);
        process.exit(1);
    }
}

// Handle errors
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Start the application
init(); 