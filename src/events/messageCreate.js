const { containsUrl, extractUrls } = require('../utils/linkDetection');
const { isMonitored } = require('../commands/set_channel');
const { getTimeoutDuration } = require('../commands/set_timeout');

// Default timeout duration in seconds (can be overridden via configuration)
const DEFAULT_TIMEOUT_DURATION = parseInt(process.env.TIMEOUT_DURATION) || 300; // 5 minutes

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {
        // Ignore messages from bots
        if (message.author.bot) return;
        
        // Check if the channel is being monitored
        const isMonitoredChannel = isMonitored(message.channel.id);
        
        // Check if the message contains a URL and if the channel is being monitored
        if (isMonitoredChannel && containsUrl(message.content)) {
            try {
                // Extract the URLs from the message for logging purposes
                const urls = extractUrls(message.content);
                
                // Get the timeout duration
                const timeoutDuration = getTimeoutDuration();
                
                // Check if the user or their role is exempt (will be implemented with database later)
                const isExempt = false; // Placeholder until exemption system is implemented
                
                if (!isExempt) {
                    // Get the member for timeout functionality
                    const member = message.member;
                    
                    if (member && member.moderatable) {
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
                    } else {
                        console.log(`[WARNING] Could not timeout user ${message.author.tag} (not moderatable)`);
                    }
                }
            } catch (error) {
                console.error('[ERROR] Error in link detection:', error);
            }
        }
    },
}; 