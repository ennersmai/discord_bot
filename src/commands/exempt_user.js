const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('exempt_user')
        .setDescription('Exempt a user from link timeout')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to exempt')
                .setRequired(true))
        .addBooleanOption(option => 
            option.setName('enable')
                .setDescription('Enable or disable the exemption')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for the exemption')
                .setRequired(false))
        .addIntegerOption(option => 
            option.setName('days')
                .setDescription('Number of days for the exemption to last (0 for permanent)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(365))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), // Only moderators can use this command
    
    async execute(interaction, client) {
        try {
            // Get the database service
            const db = client.database;
            
            // Get the guild ID
            const guildId = interaction.guild.id;
            
            // Get the options
            const user = interaction.options.getUser('user');
            const enable = interaction.options.getBoolean('enable');
            const reason = interaction.options.getString('reason');
            const days = interaction.options.getInteger('days') || 0;
            
            // Defer reply since database operations might take some time
            await interaction.deferReply({ ephemeral: true });
            
            if (enable) {
                // Calculate expiry date if days is specified
                let expiresAt = null;
                if (days > 0) {
                    expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + days);
                }
                
                // Add the user exemption
                await db.addUserExemption(guildId, user.id, reason, expiresAt);
                
                // Format success message
                let successMessage = `✅ ${user.tag} has been exempted from link timeouts`;
                
                if (days > 0) {
                    successMessage += ` for ${days} days`;
                } else {
                    successMessage += ` permanently`;
                }
                
                if (reason) {
                    successMessage += `. Reason: ${reason}`;
                } else {
                    successMessage += `.`;
                }
                
                await interaction.editReply({
                    content: successMessage,
                    ephemeral: true
                });
            } else {
                // Remove the user exemption
                await db.removeUserExemption(guildId, user.id);
                
                await interaction.editReply({
                    content: `✅ Exemption for ${user.tag} has been removed.`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error managing user exemption:', error);
            
            // Handle the error gracefully
            if (interaction.deferred) {
                await interaction.editReply({
                    content: '❌ There was an error while managing the user exemption. Please try again later.',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: '❌ There was an error while managing the user exemption. Please try again later.',
                    ephemeral: true
                });
            }
        }
    }
}; 