require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');

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

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Handle errors
client.on('error', error => {
    console.error('Discord client error:', error);
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN); 