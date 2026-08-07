const { GoogleGenerativeAI } = require('@google/generative-ai');
const { parseAnalysisResponse, buildPrompt, delay } = require('./aiShared');

const MAX_PROMPT_CHARS = 4000;
const MAX_RETRIES = 3;
const RETRYABLE_STATUS = new Set([500, 503]);
const RETRY_DELAY_BASE_MS = 1500;

const analyzeWithGemini = async (text, jd, targetRole, model) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Missing Gemini API key. Add GEMINI_API_KEY to the backend .env file.'
    );
  }

  const modelName = model || process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelRef = genAI.getGenerativeModel({ model: modelName });
  const resumeText = text.substring(0, MAX_PROMPT_CHARS);

  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      const result = await modelRef.generateContent(buildPrompt(resumeText, jd, targetRole));
      return parseAnalysisResponse(result.response.text());
    } catch (error) {
      lastError = error;

      const message = error.message || String(error);
      const status = error.status;

      if (status === 429 || /quota|quota exceeded/i.test(message)) {
        throw new Error(
          'AI quota exceeded. Please try again later or use a new Gemini API key.'
        );
      }

      if (RETRYABLE_STATUS.has(status) && attempt < MAX_RETRIES - 1) {
        await delay(RETRY_DELAY_BASE_MS * (attempt + 1));
        continue;
      }

      break;
    }
  }

  const message = lastError ? lastError.message || String(lastError) : 'Unknown Gemini error';
  const status = lastError ? lastError.status : null;

  if (
    status === 400 ||
    status === 403 ||
    /API key not valid|API_KEY_INVALID/i.test(message)
  ) {
    throw new Error(
      'Gemini API key is invalid. Check GEMINI_API_KEY in the backend .env file.'
    );
  }

  if (status === 404 || /not found/i.test(message)) {
    throw new Error(
      'Gemini model is unavailable. Check the model name in the backend configuration.'
    );
  }

  if (status === 503 || /high demand|Service Unavailable/i.test(message)) {
    throw new Error(
      'Gemini is temporarily overloaded. Please try again in a few moments.'
    );
  }

  throw new Error('Gemini request failed: ' + message);
};

module.exports = { analyzeWithGemini };
