const { SlashCommandBuilder } = require('discord.js');
const { getGeminiResponse } = require('../utils/geminiClient');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Ask a question to the NLP model')
        .addStringOption(option => 
            option.setName('question')
                .setDescription('Your question')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('language')
                .setDescription('Response language (en/bg)')
                .setRequired(false)
                .addChoices(
                    { name: 'English', value: 'en' },
                    { name: 'Bulgarian', value: 'bg' }
                )),
    
    async execute(interaction, client) {
        try {
            // Get the database service
            const db = client.database;
            
            // Get the guild ID
            const guildId = interaction.guild?.id;
            
            // Defer the reply since Gemini API might take some time
            await interaction.deferReply();
            
            // Get the question from options
            const question = interaction.options.getString('question');
            
            // Get language from options or use guild default
            let language = interaction.options.getString('language');
            
            // If no language specified, get the default language from database
            if (!language && guildId) {
                try {
                    const guildSettings = await db.getGuildSettings(guildId);
                    language = guildSettings.defaultLanguage;
                } catch (error) {
                    console.error('Error getting guild settings for language:', error);
                    // Fallback to English if there's an error
                    language = 'en';
                }
            } else if (!language) {
                // If not in a guild, default to English
                language = 'en';
            }
            
            // Get response from Gemini
            const response = await getGeminiResponse(question, language);
            
            // Reply with the response
            await interaction.editReply({
                content: response
            });
        } catch (error) {
            console.error('Error executing ask command:', error);
            
            // Graceful fallback - determine error message based on language
            const language = interaction.options.getString('language') || 'en';
            const errorMessage = language === 'bg'
                ? 'Възникна грешка при обработката на вашето запитване. Моля, опитайте отново по-късно.'
                : 'An error occurred while processing your request. Please try again later.';
            
            if (interaction.deferred) {
                await interaction.editReply({ content: errorMessage });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    },
}; 