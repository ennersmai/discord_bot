const { SlashCommandBuilder } = require('discord.js');
const { getGeminiResponse, isGeminiAvailable } = require('../utils/geminiClient');

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
                ))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of assistance needed')
                .setRequired(false)
                .addChoices(
                    { name: 'General', value: 'general' },
                    { name: 'Moderation Help', value: 'moderation' },
                    { name: 'Code Help', value: 'codeHelp' }
                )),
    
    async execute(interaction, client) {
        try {
            // Check if Gemini API is available
            if (!isGeminiAvailable()) {
                return await interaction.reply({
                    content: 'The AI service is currently unavailable. Please try again later.',
                    ephemeral: true
                });
            }
            
            // Get the database service
            const db = client.database;
            
            // Get the guild ID
            const guildId = interaction.guild?.id;
            
            // Defer the reply since Gemini API might take some time
            await interaction.deferReply();
            
            // Get the question from options
            const question = interaction.options.getString('question');
            
            // Get options from command
            let language = interaction.options.getString('language');
            const useCase = interaction.options.getString('type') || 'general';
            
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
            const response = await getGeminiResponse(question, language, useCase);
            
            // If response is too long, split it into chunks
            if (response.length > 2000) {
                const chunks = splitMessage(response, { maxLength: 2000 });
                
                // Send the first chunk as a reply
                await interaction.editReply({
                    content: chunks[0]
                });
                
                // Send the rest as follow-up messages
                for (let i = 1; i < chunks.length; i++) {
                    await interaction.followUp({
                        content: chunks[i]
                    });
                }
            } else {
                // Reply with the response if it's not too long
                await interaction.editReply({
                    content: response
                });
            }
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

// Utility function to split long messages
function splitMessage(text, { maxLength = 2000 } = {}) {
    if (text.length <= maxLength) return [text];
    
    const chunks = [];
    let currentChunk = '';
    
    // Split text by newlines
    const lines = text.split('\n');
    
    for (const line of lines) {
        // If adding this line would exceed maxLength, push current chunk and start a new one
        if (currentChunk.length + line.length + 1 > maxLength) {
            chunks.push(currentChunk);
            currentChunk = line;
        } else {
            // Otherwise, add line to current chunk
            if (currentChunk) currentChunk += '\n';
            currentChunk += line;
        }
    }
    
    // Push the final chunk
    if (currentChunk) chunks.push(currentChunk);
    
    return chunks;
} 