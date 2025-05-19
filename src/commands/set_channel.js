const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

// For now, we'll use a global array to store monitored channels
// This will be replaced with database storage in a later phase
const monitoredChannels = new Set();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_channel')
        .setDescription('Set a channel for link monitoring')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel to monitor')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
        .addBooleanOption(option =>
            option.setName('enable')
                .setDescription('Enable or disable link monitoring for this channel')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), // Only moderators can use this command
    
    async execute(interaction, client) {
        try {
            // Get the database service
            const db = client.database;
            
            // Get the guild ID
            const guildId = interaction.guild.id;
            
            // Get the channel and enable flag from options
            const channel = interaction.options.getChannel('channel');
            const enable = interaction.options.getBoolean('enable');
            
            // Defer reply since database operations might take some time
            await interaction.deferReply({ ephemeral: true });
            
            if (enable) {
                // Add the channel to monitored channels
                await db.addMonitoredChannel(guildId, channel.id);
                await interaction.editReply({
                    content: `✅ Link monitoring has been enabled for <#${channel.id}>.`,
                    ephemeral: true
                });
            } else {
                // Remove the channel from monitored channels
                await db.removeMonitoredChannel(guildId, channel.id);
                await interaction.editReply({
                    content: `✅ Link monitoring has been disabled for <#${channel.id}>.`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error setting monitored channel:', error);
            
            // Handle the error gracefully
            if (interaction.deferred) {
                await interaction.editReply({
                    content: '❌ There was an error while configuring the channel. Please try again later.',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: '❌ There was an error while configuring the channel. Please try again later.',
                    ephemeral: true
                });
            }
        }
    },
    
    // Check if a channel is being monitored
    isMonitored: (channelId) => monitoredChannels.has(channelId),
    
    // Get all monitored channels
    getMonitoredChannels: () => [...monitoredChannels]
}; 