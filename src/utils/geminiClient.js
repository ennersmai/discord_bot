const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gemini model name
const MODEL_NAME = 'gemini-1.5-pro';

/**
 * Get response from Gemini model
 * @param {string} prompt - The user's question or prompt
 * @param {string} language - The language to use (en/bg)
 * @returns {Promise<string>} - The model's response
 */
async function getGeminiResponse(prompt, language = 'en') {
    try {
        // Get the model
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // Prepare the language-specific prompt
        let finalPrompt = prompt;
        if (language === 'bg') {
            finalPrompt = `Please respond in Bulgarian language: ${prompt}`;
        }

        // Generate content
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error('Error getting Gemini response:', error);
        
        // Return appropriate error message based on language
        if (language === 'bg') {
            return 'Възникна грешка при обработката на вашето запитване. Моля, опитайте отново по-късно.';
        } else {
            return 'An error occurred while processing your request. Please try again later.';
        }
    }
}

module.exports = {
    getGeminiResponse
}; 