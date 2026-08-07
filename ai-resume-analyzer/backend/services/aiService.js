const { analyzeWithGemini } = require('./geminiService');
const { analyzeWithOpenAI } = require('./openaiService');
const { analyzeWithAnthropic } = require('./anthropicService');
const { DEFAULT_AI, mergeAIResults } = require('./aiShared');

const PROVIDER_TIMEOUT_MS = 30000;

const resolveGeminiModels = () => {
  const models = (process.env.GEMINI_MODELS || '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);

  const primary = process.env.GEMINI_MODEL;
  if (models.length === 0 && primary) models.push(primary);
  if (models.length === 0) models.push('gemini-3.6-flash');
  return models;
};

const buildProviders = () => {
  const enabled = (process.env.AI_PROVIDERS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const use = (name) => enabled.length === 0 || enabled.includes(name);
  const providers = [];

  if (use('gemini') && process.env.GEMINI_API_KEY) {
    resolveGeminiModels().forEach((model) => {
      providers.push({
        key: `gemini:${model}`,
        name: `Gemini (${model})`,
        analyze: (text, jd, targetRole) => analyzeWithGemini(text, jd, targetRole, model)
      });
    });
  }

  if (use('openai') && process.env.OPENAI_API_KEY) {
    providers.push({
      key: 'openai',
      name: 'OpenAI',
      analyze: analyzeWithOpenAI
    });
  }

  if (use('anthropic') && process.env.ANTHROPIC_API_KEY) {
    providers.push({
      key: 'anthropic',
      name: 'Claude',
      analyze: analyzeWithAnthropic
    });
  }

  return providers;
};

const withTimeout = (promise, ms) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Provider timed out')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const analyzeResumeEnsemble = async (text, jd = '', targetRole = '') => {
  const providers = buildProviders();

  if (providers.length === 0) {
    return { ...DEFAULT_AI, used: [], failed: [] };
  }

  const settled = await Promise.allSettled(
    providers.map((provider) => withTimeout(provider.analyze(text, jd, targetRole), PROVIDER_TIMEOUT_MS))
  );

  const results = [];
  const failed = [];

  settled.forEach((entry, i) => {
    if (entry.status === 'fulfilled' && entry.value) {
      results.push({ provider: providers[i], result: entry.value });
    } else {
      const message = entry.reason ? entry.reason.message || String(entry.reason) : 'Unknown error';
      failed.push({ provider: providers[i].name, error: message });
    }
  });

  if (results.length === 0) {
    console.error('[AI] all providers failed:', failed);
    return { ...DEFAULT_AI, used: [], failed };
  }

  results.forEach(({ provider, result }) => {
    console.log(`[AI] ${provider.name} ok (${(result.summary || '').length} chars)`);
  });

  if (failed.length > 0) {
    console.warn('[AI] failed providers:', failed);
  }

  return {
    ...mergeAIResults(results.map((r) => r.result)),
    used: results.map((r) => r.provider.name),
    failed
  };
};

module.exports = { analyzeResumeEnsemble, buildProviders };
