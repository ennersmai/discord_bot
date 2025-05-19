module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        try {
            // Handle slash commands
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                
                if (!command) {
                    console.error(`No command matching ${interaction.commandName} was found.`);
                    return;
                }
                
                try {
                    await command.execute(interaction, client);
                } catch (error) {
                    console.error(`Error executing ${interaction.commandName}`);
                    console.error(error);
                    
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ 
                            content: 'There was an error while executing this command!', 
                            ephemeral: true 
                        });
                    } else {
                        await interaction.reply({ 
                            content: 'There was an error while executing this command!', 
                            ephemeral: true 
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error in interactionCreate event:', error);
        }
    },
}; 