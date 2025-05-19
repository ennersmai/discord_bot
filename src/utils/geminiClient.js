const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI with error handling
let genAI;
try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
    console.error('Failed to initialize Google Generative AI:', error);
    // Provide a fallback or graceful degradation
    genAI = null;
}

// Gemini model name - using the more capable pro model
const MODEL_NAME = 'gemini-1.5-pro';

// Rate limiting configuration
const MAX_REQUESTS_PER_MINUTE = 10;
const requestTimestamps = [];

// Check if we've hit the rate limit
function isRateLimited() {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    
    // Remove timestamps older than 1 minute
    while (requestTimestamps.length > 0 && requestTimestamps[0] < oneMinuteAgo) {
        requestTimestamps.shift();
    }
    
    // Check if we've hit the limit
    return requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE;
}

// Add system prompts based on different use cases
const prompts = {
    general: "You are a helpful assistant for a Discord server. Provide clear, accurate, and concise responses.",
    moderation: "You are a moderation assistant. Help with understanding Discord's rules and best practices for community management.",
    codeHelp: "You are a coding assistant. Help with coding questions, provide examples, and explain programming concepts clearly."
};

/**
 * Get response from Gemini model
 * @param {string} prompt - The user's question or prompt
 * @param {string} language - The language to use (en/bg)
 * @param {string} useCase - The type of prompt to use (default: general)
 * @returns {Promise<string>} - The model's response
 */
async function getGeminiResponse(prompt, language = 'en', useCase = 'general') {
    try {
        // Check if API is available
        if (!genAI) {
            throw new Error('Gemini API is not available');
        }
        
        // Check rate limiting
        if (isRateLimited()) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        // Track this request for rate limiting
        requestTimestamps.push(Date.now());
        
        // Get the model
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // Select system prompt based on use case
        const systemPrompt = prompts[useCase] || prompts.general;

        // Prepare the language-specific prompt
        let finalPrompt = prompt;
        
        // Add language instruction for Bulgarian
        if (language === 'bg') {
            finalPrompt = `${systemPrompt} Please respond in Bulgarian language to this query: ${prompt}`;
        } else {
            finalPrompt = `${systemPrompt} ${prompt}`;
        }

        // Generate content with enhanced error handling
        const result = await model.generateContent(finalPrompt);
        const response = result.response;
        const text = response.text();
        
        // Return trimmed response (remove excessive whitespace)
        return text.trim();
    } catch (error) {
        console.error('Error getting Gemini response:', error);
        
        // Provide a graceful fallback message based on language
        if (language === 'bg') {
            return 'Извинявам се, но в момента имам проблем с обработката на вашето запитване. Моля, опитайте отново по-късно.';
        } else {
            return 'I apologize, but I\'m currently experiencing issues processing your request. Please try again later.';
        }
    }
}

/**
 * Check if the Gemini API is available
 * @returns {boolean} - Whether the API is available
 */
function isGeminiAvailable() {
    return genAI !== null;
}

module.exports = {
    getGeminiResponse,
    isGeminiAvailable
}; 