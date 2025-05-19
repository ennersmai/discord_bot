const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_language')
        .setDescription('Set the default language for the bot')
        .addStringOption(option => 
            option.setName('language')
                .setDescription('Language to use')
                .setRequired(true)
                .addChoices(
                    { name: 'English', value: 'en' },
                    { name: 'Bulgarian', value: 'bg' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), // Only admins can use this command
    
    async execute(interaction, client) {
        try {
            // Get the database service
            const db = client.database;
            
            // Get the guild ID
            const guildId = interaction.guild.id;
            
            // Get the language from options
            const language = interaction.options.getString('language');
            
            // Defer reply since database operations might take some time
            await interaction.deferReply({ ephemeral: true });
            
            // Update the default language
            await db.updateDefaultLanguage(guildId, language);
            
            // Format the success message based on the selected language
            let successMessage;
            if (language === 'bg') {
                successMessage = `✅ Езикът по подразбиране е зададен на български.`;
            } else {
                successMessage = `✅ Default language has been set to English.`;
            }
            
            // Reply with success message
            await interaction.editReply({
                content: successMessage,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error setting default language:', error);
            
            // Handle the error gracefully
            if (interaction.deferred) {
                await interaction.editReply({
                    content: '❌ There was an error while setting the default language. Please try again later.',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: '❌ There was an error while setting the default language. Please try again later.',
                    ephemeral: true
                });
            }
        }
    }
}; 