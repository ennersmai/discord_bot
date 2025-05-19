const { containsUrl, extractUrls } = require('../utils/linkDetection');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        // Get database service
        const db = client.database;
        
        // Ignore messages from bots
        if (message.author.bot) return;
        
        const guildId = message.guild?.id;
        if (!guildId) return; // Ignore DMs
        
        try {
            // Check if the channel is being monitored
            const isMonitored = await db.isChannelMonitored(guildId, message.channel.id);
            
            // Check if the message contains a URL and if the channel is being monitored
            if (isMonitored && containsUrl(message.content)) {
                // Extract the URLs from the message for logging purposes
                const urls = extractUrls(message.content);
                
                // Get guild settings for timeout duration
                const guildSettings = await db.getGuildSettings(guildId);
                const timeoutDuration = guildSettings.timeoutDuration;
                
                // Get member roles for exemption check
                const memberRoles = message.member.roles.cache.map(role => role.id);
                
                // Check if the user or their role is exempt
                const isExempt = await db.isExempt(guildId, message.author.id, memberRoles);
                
                if (!isExempt) {
                    // Get the member for timeout functionality
                    const member = message.member;
                    
                    if (member && member.moderatable) {
                        try {
                            // Apply timeout
                            await member.timeout(timeoutDuration * 1000, 'Posted link in restricted channel');
                            
                            // Log the action
                            console.log(`[TIMEOUT] User ${message.author.tag} timed out for ${timeoutDuration} seconds for posting ${urls.join(', ')}`);
                            
                            // Send a message to the user
                            await message.reply({
                                content: `You have been timed out for ${timeoutDuration} seconds for posting a link in this channel.`,
                                ephemeral: true // Make the message only visible to the user
                            });
                            
                            // Delete the message containing the link
                            await message.delete();
                            
                            // Log to database
                            await db.logTimeout(
                                guildId,
                                message.author.id,
                                message.channel.id,
                                timeoutDuration,
                                'Posted link in restricted channel',
                                urls.join(', '),
                                message.content
                            );
                        } catch (error) {
                            console.error('Error applying timeout:', error);
                            // Graceful fallback - just delete the message if we can't timeout
                            try {
                                await message.delete();
                                console.log(`[WARNING] Could not timeout user ${message.author.tag}, message deleted instead`);
                            } catch (deleteError) {
                                console.error('Error deleting message:', deleteError);
                            }
                        }
                    } else {
                        console.log(`[WARNING] Could not timeout user ${message.author.tag} (not moderatable)`);
                        // Try to delete the message anyway
                        try {
                            await message.delete();
                        } catch (error) {
                            console.error('Error deleting message:', error);
                        }
                    }
                } else {
                    console.log(`[INFO] User ${message.author.tag} is exempt from timeout`);
                }
            }
        } catch (error) {
            console.error('[ERROR] Error in link detection:', error);
        }
    },
}; 