const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Define command categories
const CATEGORIES = {
    GENERAL: {
        name: 'General',
        emoji: '🌐',
        description: 'General bot commands'
    },
    MODERATION: {
        name: 'Moderation',
        emoji: '🛡️',
        description: 'Commands for server moderation'
    },
    CONFIGURATION: {
        name: 'Configuration',
        emoji: '⚙️',
        description: 'Bot configuration commands'
    },
    NLP: {
        name: 'AI & NLP',
        emoji: '🤖',
        description: 'AI-powered commands'
    }
};

// Define command info
const COMMANDS = [
    {
        name: 'help',
        description: 'Shows this help message',
        category: CATEGORIES.GENERAL,
        usage: '/help [category]'
    },
    {
        name: 'status',
        description: 'Shows bot status and information',
        category: CATEGORIES.GENERAL,
        usage: '/status',
        examples: [
            '/status'
        ]
    },
    {
        name: 'command_help',
        description: 'Shows detailed help for a specific command',
        category: CATEGORIES.GENERAL,
        usage: '/command_help <command>',
        examples: [
            '/command_help command:ask',
            '/command_help command:set_timeout'
        ]
    },
    {
        name: 'ask',
        description: 'Ask a question to the AI assistant',
        category: CATEGORIES.NLP,
        usage: '/ask <question> [language] [type]',
        examples: [
            '/ask What is Discord?',
            '/ask Какво е Discord? language:Bulgarian',
            '/ask How to code in JavaScript? type:Code Help'
        ]
    },
    {
        name: 'set_channel',
        description: 'Set a channel for link monitoring',
        category: CATEGORIES.CONFIGURATION,
        usage: '/set_channel <channel> <enable>',
        examples: [
            '/set_channel #general enable:True',
            '/set_channel #links enable:False'
        ]
    },
    {
        name: 'set_timeout',
        description: 'Set the timeout duration for link violations',
        category: CATEGORIES.MODERATION,
        usage: '/set_timeout <duration>',
        examples: [
            '/set_timeout duration:300',
            '/set_timeout duration:600'
        ]
    },
    {
        name: 'exempt_user',
        description: 'Exempt a user from link timeout',
        category: CATEGORIES.MODERATION,
        usage: '/exempt_user <user> <enable> [reason] [days]',
        examples: [
            '/exempt_user @username enable:True',
            '/exempt_user @username enable:True reason:Trusted member days:30'
        ]
    },
    {
        name: 'exempt_role',
        description: 'Exempt a role from link timeout',
        category: CATEGORIES.MODERATION,
        usage: '/exempt_role <role> <enable> [reason] [days]',
        examples: [
            '/exempt_role @Moderator enable:True',
            '/exempt_role @Trusted enable:True reason:Trusted role days:0'
        ]
    },
    {
        name: 'set_language',
        description: 'Set the default language for the bot',
        category: CATEGORIES.CONFIGURATION,
        usage: '/set_language <language>',
        examples: [
            '/set_language language:English',
            '/set_language language:Bulgarian'
        ]
    }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows information about available commands')
        .addStringOption(option => 
            option.setName('category')
                .setDescription('Filter commands by category')
                .setRequired(false)
                .addChoices(
                    { name: 'All', value: 'all' },
                    { name: 'General', value: 'general' },
                    { name: 'Moderation', value: 'moderation' },
                    { name: 'Configuration', value: 'configuration' },
                    { name: 'AI & NLP', value: 'nlp' }
                )),
    
    async execute(interaction, client) {
        try {
            // Get the database service
            const db = client.database;
            
            // Get the guild ID
            const guildId = interaction.guild?.id;
            
            // Get language from database if available
            let language = 'en';
            if (guildId) {
                try {
                    const guildSettings = await db.getGuildSettings(guildId);
                    language = guildSettings.defaultLanguage;
                } catch (error) {
                    console.error('Error getting guild settings for language:', error);
                }
            }
            
            // Get category filter if specified
            const categoryFilter = interaction.options.getString('category') || 'all';
            
            // Filter commands by category if specified
            const filteredCommands = categoryFilter === 'all'
                ? COMMANDS
                : COMMANDS.filter(cmd => {
                    const category = cmd.category.name.toLowerCase();
                    return category === categoryFilter;
                });
                
            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(language === 'bg' ? 'Помощ с командите' : 'Command Help')
                .setDescription(language === 'bg' 
                    ? 'Тук е списък с наличните команди:'
                    : 'Here are the available commands:')
                .setColor('#5865F2')
                .setTimestamp()
                .setFooter({ 
                    text: language === 'bg' 
                        ? 'Използвайте /help [категория] за повече информация'
                        : 'Use /help [category] for more information' 
                });
                
            // Get current bot user
            const botUser = client.user;
            if (botUser && botUser.avatarURL()) {
                embed.setThumbnail(botUser.avatarURL());
            }
            
            // Group commands by category for better organization
            const commandsByCategory = {};
            
            filteredCommands.forEach(cmd => {
                const categoryName = cmd.category.name;
                if (!commandsByCategory[categoryName]) {
                    commandsByCategory[categoryName] = [];
                }
                commandsByCategory[categoryName].push(cmd);
            });
            
            // Add fields for each category
            Object.entries(commandsByCategory).forEach(([categoryName, commands]) => {
                const category = commands[0].category;
                
                let fieldText = '';
                commands.forEach(cmd => {
                    fieldText += `**/${cmd.name}** - ${cmd.description}\n`;
                });
                
                embed.addFields({
                    name: `${category.emoji} ${categoryName}`,
                    value: fieldText,
                    inline: false
                });
            });
            
            // Send embed
            await interaction.reply({
                embeds: [embed]
            });
        } catch (error) {
            console.error('Error executing help command:', error);
            await interaction.reply({
                content: language === 'bg'
                    ? 'Възникна грешка при изпълнението на командата.'
                    : 'An error occurred while executing the command.',
                ephemeral: true
            });
        }
    },

    // Export COMMANDS for use in other files
    COMMANDS,
    CATEGORIES
}; 