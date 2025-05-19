const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_timeout')
        .setDescription('Set the timeout duration for users who post links')
        .addIntegerOption(option => 
            option.setName('duration')
                .setDescription('Duration in seconds')
                .setRequired(true)
                .setMinValue(5)
                .setMaxValue(2419200)) // Discord's max timeout is 28 days (2,419,200 seconds)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), // Only moderators can use this command
    
    async execute(interaction, client) {
        try {
            // Get the database service
            const db = client.database;
            
            // Get the guild ID
            const guildId = interaction.guild.id;
            
            // Get the duration from the options
            const duration = interaction.options.getInteger('duration');
            
            // Defer reply since database operations might take some time
            await interaction.deferReply({ ephemeral: true });
            
            // Update the timeout duration in the database
            await db.updateTimeoutDuration(guildId, duration);
            
            // Reply with success message
            await interaction.editReply({
                content: `✅ Timeout duration has been set to ${duration} seconds.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error setting timeout duration:', error);
            
            // Handle the error gracefully
            if (interaction.deferred) {
                await interaction.editReply({
                    content: '❌ There was an error while setting the timeout duration. Please try again later.',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: '❌ There was an error while setting the timeout duration. Please try again later.',
                    ephemeral: true
                });
            }
        }
    }
}; 