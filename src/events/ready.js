const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        try {
            console.log(`Logged in as ${client.user.tag}!`);
            
            // Register slash commands
            const commands = [];
            const commandsPath = path.join(__dirname, '../commands');
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
            
            // Check if we have any commands to register
            if (commands.length > 0) {
                const rest = new REST().setToken(process.env.DISCORD_TOKEN);
                
                // Register commands
                try {
                    console.log(`Started refreshing ${commands.length} application (/) commands.`);
                    
                    // The put method is used to fully refresh all commands in the guild with the current set
                    const data = await rest.put(
                        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                        { body: commands },
                    );
                    
                    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
                } catch (error) {
                    console.error(error);
                }
            } else {
                console.log('No commands found to register.');
            }
        } catch (error) {
            console.error('Error in ready event:', error);
        }
    },
}; 