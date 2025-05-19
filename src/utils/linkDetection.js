/**
 * Utility functions for link detection
 */

// URL regex pattern that matches various URL formats
const URL_PATTERN = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i;

// Alternative pattern that also catches URLs without protocol (e.g., example.com)
const DOMAIN_PATTERN = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i;

/**
 * Checks if a message contains a URL
 * @param {string} content - Message content to check
 * @returns {boolean} - Whether the message contains a URL
 */
function containsUrl(content) {
    if (!content || typeof content !== 'string') return false;
    return URL_PATTERN.test(content) || DOMAIN_PATTERN.test(content);
}

/**
 * Extract all URLs from a message
 * @param {string} content - Message content to extract URLs from
 * @returns {string[]} - Array of URLs found in the message
 */
function extractUrls(content) {
    if (!content || typeof content !== 'string') return [];
    
    const urls = [];
    
    // Extract URLs with protocols
    let match;
    while ((match = URL_PATTERN.exec(content)) !== null) {
        urls.push(match[0]);
        content = content.replace(match[0], ' '.repeat(match[0].length));
    }
    
    // Extract domains without protocols
    while ((match = DOMAIN_PATTERN.exec(content)) !== null) {
        // Only add if not already in the list (to avoid duplicates)
        if (!urls.includes(match[0])) {
            urls.push(match[0]);
        }
        content = content.replace(match[0], ' '.repeat(match[0].length));
    }
    
    return urls;
}

module.exports = {
    containsUrl,
    extractUrls,
    // Export patterns for testing
    URL_PATTERN,
    DOMAIN_PATTERN
}; 