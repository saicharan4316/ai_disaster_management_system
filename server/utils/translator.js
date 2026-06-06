import axios from 'axios';

/**
 * Translates English text to a target regional Indian language using MyMemory API
 * @param {string} text - The text to be translated
 * @param {string} targetLangCode - The target language code ('te', 'ta', 'kn', 'hi')
 * @returns {Promise<string>} - Translated text or original text if translation fails
 */
export const translateText = async (text, targetLangCode) => {
  if (!text || !targetLangCode || targetLangCode === 'en') {
    return text;
  }

  try {
    const response = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: text,
        langpair: `en|${targetLangCode}`
      },
      timeout: 5000 // 5 seconds timeout
    });

    if (response.data && response.data.responseData && response.data.responseData.translatedText) {
      return response.data.responseData.translatedText;
    }
    
    console.warn(`Translation API response invalid, using original text.`);
    return text;
  } catch (error) {
    console.error(`Error in MyMemory Translation: ${error.message}. Returning original text.`);
    return text; // Fallback to original text
  }
};
