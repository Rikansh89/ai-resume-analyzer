const Anthropic = require('@anthropic-ai/sdk');
const { parseAnalysisResponse, buildPrompt, delay } = require('./aiShared');

const MAX_PROMPT_CHARS = 4000;
const MAX_RETRIES = 3;
const RETRYABLE_STATUS = new Set([500, 502, 503, 529]);
const RETRY_DELAY_BASE_MS = 1500;

const analyzeWithAnthropic = async (text, jd, targetRole) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Missing Anthropic API key. Add ANTHROPIC_API_KEY to the backend .env file.'
    );
  }

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
  const client = new Anthropic({ apiKey });
  const resumeText = text.substring(0, MAX_PROMPT_CHARS);

  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: 1024,
        temperature: 0.3,
        messages: [{ role: 'user', content: buildPrompt(resumeText, jd, targetRole) }]
      });

      const content = (response.content || [])
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('');

      return parseAnalysisResponse(content);
    } catch (error) {
      lastError = error;

      const message = error.message || String(error);
      const status = error.status;

      if (status === 429 || /rate.?limit|quota/i.test(message)) {
        throw new Error(
          'Anthropic quota exceeded. Please try again later or use a new Anthropic API key.'
        );
      }

      if (status === 401 || /invalid x-api-key|authentication/i.test(message)) {
        throw new Error(
          'Anthropic API key is invalid. Check ANTHROPIC_API_KEY in the backend .env file.'
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
    'Anthropic request failed: ' + (lastError ? lastError.message || String(lastError) : 'Unknown error')
  );
};

module.exports = { analyzeWithAnthropic };
