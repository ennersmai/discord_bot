const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// For now, we'll use a global variable to store the timeout duration
// This will be replaced with database storage in a later phase
let timeoutDuration = parseInt(process.env.TIMEOUT_DURATION) || 300; // Default 5 minutes

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
    
    async execute(interaction) {
        try {
            // Get the duration from the options
            const duration = interaction.options.getInteger('duration');
            
            // Update the timeout duration
            timeoutDuration = duration;
            
            // We would store this in a database in the future
            
            // Reply with success message
            await interaction.reply({
                content: `✅ Timeout duration has been set to ${duration} seconds.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error setting timeout duration:', error);
            await interaction.reply({
                content: '❌ There was an error while setting the timeout duration.',
                ephemeral: true
            });
        }
    },
    
    // Export the timeoutDuration so other files can access it
    getTimeoutDuration: () => timeoutDuration
}; 