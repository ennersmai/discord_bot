const { SlashCommandBuilder } = require('discord.js');
const { getGeminiResponse } = require('../utils/geminiClient');

// Default language setting (will be replaced with database storage later)
const defaultLanguage = process.env.DEFAULT_LANGUAGE || 'en';

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
    
    async execute(interaction) {
        try {
            // Defer the reply since Gemini API might take some time
            await interaction.deferReply();
            
            // Get the question and language from options
            const question = interaction.options.getString('question');
            const language = interaction.options.getString('language') || defaultLanguage;
            
            // Get response from Gemini
            const response = await getGeminiResponse(question, language);
            
            // Reply with the response
            await interaction.editReply({
                content: response
            });
        } catch (error) {
            console.error('Error executing ask command:', error);
            
            // Handle errors based on language
            const errorMessage = language === 'bg'
                ? 'Възникна грешка при обработката на вашето запитване.'
                : 'An error occurred while processing your request.';
            
            if (interaction.deferred) {
                await interaction.editReply({ content: errorMessage });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    },
}; 