const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows a list of available commands'),
    
    async execute(interaction) {
        // Create an embed for the help command
        const helpEmbed = new EmbedBuilder()
            .setTitle('Bot Help')
            .setDescription('Here are the available commands:')
            .setColor('#0099ff')
            .addFields(
                { name: '/help', value: 'Shows this help message' },
                { name: '/set_channel', value: 'Set a channel for link monitoring' },
                { name: '/set_timeout', value: 'Set the timeout duration for link violations' },
                { name: '/exempt_user', value: 'Exempt a user from link timeout' },
                { name: '/exempt_role', value: 'Exempt a role from link timeout' },
                { name: '/ask', value: 'Ask a question to the NLP model' }
            )
            .setTimestamp()
            .setFooter({ text: 'Discord Link Timeout & NLP Bot' });
        
        // Reply with the embed
        await interaction.reply({ embeds: [helpEmbed] });
    },
}; 