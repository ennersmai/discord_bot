const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Import command information from help.js
const { COMMANDS } = require('./help');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('command_help')
        .setDescription('Shows detailed help for a specific command')
        .addStringOption(option => 
            option.setName('command')
                .setDescription('The command to get help for')
                .setRequired(true)
                .addChoices(
                    { name: 'help', value: 'help' },
                    { name: 'status', value: 'status' },
                    { name: 'command_help', value: 'command_help' },
                    { name: 'ask', value: 'ask' },
                    { name: 'set_channel', value: 'set_channel' },
                    { name: 'set_timeout', value: 'set_timeout' },
                    { name: 'exempt_user', value: 'exempt_user' },
                    { name: 'exempt_role', value: 'exempt_role' },
                    { name: 'set_language', value: 'set_language' }
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
            
            // Get command name from options
            const commandName = interaction.options.getString('command');
            
            // Find command in list
            const command = COMMANDS.find(cmd => cmd.name === commandName);
            
            // If command not found, return error
            if (!command) {
                return await interaction.reply({
                    content: language === 'bg'
                        ? `Командата /${commandName} не е намерена.`
                        : `Command /${commandName} not found.`,
                    ephemeral: true
                });
            }
            
            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(`/${command.name}`)
                .setDescription(command.description)
                .setColor('#5865F2')
                .addFields(
                    {
                        name: language === 'bg' ? 'Категория' : 'Category',
                        value: `${command.category.emoji} ${command.category.name}`,
                        inline: true
                    },
                    {
                        name: language === 'bg' ? 'Употреба' : 'Usage',
                        value: `\`${command.usage}\``,
                        inline: true
                    }
                )
                .setTimestamp()
                .setFooter({ 
                    text: language === 'bg' 
                        ? 'Използвайте /help за списък с всички команди'
                        : 'Use /help for a list of all commands'
                });
            
            // Add examples if available
            if (command.examples && command.examples.length > 0) {
                embed.addFields({
                    name: language === 'bg' ? 'Примери' : 'Examples',
                    value: command.examples.map(example => `\`${example}\``).join('\n'),
                    inline: false
                });
            }
            
            // Get current bot user
            const botUser = client.user;
            if (botUser && botUser.avatarURL()) {
                embed.setThumbnail(botUser.avatarURL());
            }
            
            // Send embed
            await interaction.reply({
                embeds: [embed]
            });
        } catch (error) {
            console.error('Error executing command_help:', error);
            await interaction.reply({
                content: language === 'bg'
                    ? 'Възникна грешка при изпълнението на командата.'
                    : 'An error occurred while executing the command.',
                ephemeral: true
            });
        }
    }
}; 