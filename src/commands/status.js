const { SlashCommandBuilder, EmbedBuilder, version: discordJsVersion } = require('discord.js');
const { isGeminiAvailable } = require('../utils/geminiClient');
const { version: nodeVersion } = require('process');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Shows bot status and information')
        .setDefaultMemberPermissions(0x0000000000000020), // MANAGE_SERVER permission
    
    async execute(interaction, client) {
        try {
            // Get the database service
            const db = client.database;
            
            // Get the guild ID
            const guildId = interaction.guild.id;
            
            // Get guild settings
            const guildSettings = await db.getGuildSettings(guildId);
            
            // Get monitored channels
            const monitoredChannels = await db.getMonitoredChannels(guildId);
            
            // Get stats
            const uptime = formatUptime(client.uptime);
            const memoryUsage = Math.round(process.memoryUsage().rss / 1024 / 1024);
            const isGeminiRunning = isGeminiAvailable();
            const hostname = os.hostname();
            const systemUptime = formatUptime(os.uptime() * 1000);
            
            // Create embed
            const embed = new EmbedBuilder()
                .setTitle('Bot Status')
                .setDescription('Current status and configuration information')
                .setColor('#5865F2')
                .addFields(
                    {
                        name: 'System',
                        value: [
                            `**Node.js:** ${nodeVersion}`,
                            `**Discord.js:** ${discordJsVersion}`,
                            `**Host:** ${hostname}`,
                            `**System Uptime:** ${systemUptime}`,
                            `**Memory Usage:** ${memoryUsage} MB`
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: 'Bot',
                        value: [
                            `**Uptime:** ${uptime}`,
                            `**Gemini API:** ${isGeminiRunning ? '✅ Connected' : '❌ Disconnected'}`
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: 'Configuration',
                        value: [
                            `**Default Language:** ${guildSettings.defaultLanguage === 'en' ? 'English' : 'Bulgarian'}`,
                            `**Timeout Duration:** ${guildSettings.timeoutDuration} seconds`,
                            `**Monitored Channels:** ${monitoredChannels.length}`,
                        ].join('\n'),
                        inline: false
                    }
                )
                .setTimestamp()
                .setFooter({ text: `Bot ID: ${client.user.id}` });
            
            // Get current bot user
            if (client.user.avatarURL()) {
                embed.setThumbnail(client.user.avatarURL());
            }
            
            // Send embed
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        } catch (error) {
            console.error('Error executing status command:', error);
            await interaction.reply({
                content: 'An error occurred while fetching the bot status.',
                ephemeral: true
            });
        }
    }
};

// Format uptime into readable format
function formatUptime(uptime) {
    const totalSeconds = Math.floor(uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    
    return parts.join(' ');
} 