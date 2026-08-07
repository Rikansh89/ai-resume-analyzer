const OpenAI = require('openai');
const { parseAnalysisResponse, buildPrompt, delay } = require('./aiShared');

const MAX_PROMPT_CHARS = 4000;
const MAX_RETRIES = 3;
const RETRYABLE_STATUS = new Set([500, 502, 503, 529]);
const RETRY_DELAY_BASE_MS = 1500;

const analyzeWithOpenAI = async (text, jd, targetRole) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Missing OpenAI API key. Add OPENAI_API_KEY to the backend .env file.'
    );
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const client = new OpenAI({ apiKey });
  const resumeText = text.substring(0, MAX_PROMPT_CHARS);

  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      const completion = await client.chat.completions.create({
        model,
        temperature: 0.3,
        messages: [{ role: 'user', content: buildPrompt(resumeText, jd, targetRole) }]
      });

      return parseAnalysisResponse(completion.choices?.[0]?.message?.content || '');
    } catch (error) {
      lastError = error;

      const message = error.message || String(error);
      const status = error.status;

      if (status === 429 || /insufficient_quota|quota|rate.?limit/i.test(message)) {
        throw new Error(
          'OpenAI quota exceeded. Please try again later or use a new OpenAI API key.'
        );
      }

      if (status === 401 || /invalid api key|authentication/i.test(message)) {
        throw new Error(
          'OpenAI API key is invalid. Check OPENAI_API_KEY in the backend .env file.'
        );
      }

      if (RETRYABLE_STATUS.has(status) && attempt < MAX_RETRIES - 1) {
        await delay(RETRY_DELAY_BASE_MS * (attempt + 1));
        continue;
      }

      break;
    }
  }

  throw new Error(
    'OpenAI request failed: ' + (lastError ? lastError.message || String(lastError) : 'Unknown error')
  );
};

module.exports = { analyzeWithOpenAI };
