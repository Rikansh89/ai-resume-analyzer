const DEFAULT_AI = {
  summary: '',
  strengths: [],
  weaknesses: [],
  section_feedback: [],
  grammar_suggestions: [],
  project_suggestions: [],
  achievement_suggestions: [],
  improvement_suggestions: [],
  final_review: ''
};

const pickText = (value) => (typeof value === 'string' ? value.trim() : '');
const pickArray = (value, limit = 10) =>
  Array.isArray(value) ? value.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim()).slice(0, limit) : [];

const parseAnalysisResponse = (raw) => {
  try {
    const cleaned = String(raw || '')
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    const sectionFeedback = Array.isArray(parsed.section_feedback)
      ? parsed.section_feedback
        .filter((s) => s && typeof s === 'object')
        .slice(0, 10)
        .map((s) => ({
          section: pickText(s.section) || 'Section',
          status: pickText(s.status) || 'Improve',
          feedback: pickText(s.feedback)
        }))
      : [];

    return {
      summary: pickText(parsed.summary),
      strengths: pickArray(parsed.strengths, 6),
      weaknesses: pickArray(parsed.weaknesses, 6),
      section_feedback: sectionFeedback,
      grammar_suggestions: pickArray(parsed.grammar_suggestions, 6),
      project_suggestions: pickArray(parsed.project_suggestions, 6),
      achievement_suggestions: pickArray(parsed.achievement_suggestions, 6),
      improvement_suggestions: pickArray(parsed.improvement_suggestions, 6),
      final_review: pickText(parsed.final_review)
    };
  } catch {
    return { ...DEFAULT_AI };
  }
};

const buildPrompt = (text, jd, targetRole) => `
You are an expert ATS (Applicant Tracking System) reviewer for ${targetRole || 'Software Engineer'} roles.
${jd ? `
Job description to match against:
${jd}
` : targetRole ? `
Target role to evaluate fit for: ${targetRole}.
` : ''}
Analyze the resume and return ONLY valid JSON with this exact structure:

{
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "section_feedback": [],
  "grammar_suggestions": [],
  "project_suggestions": [],
  "achievement_suggestions": [],
  "improvement_suggestions": [],
  "final_review": ""
}

Rules:
- summary: concise 2-3 sentence professional profile of the candidate${jd ? ', focused on fit with the job description' : ''}.
- strengths: 3-4 specific strengths with evidence from the resume.
- weaknesses: 3-4 specific gaps${jd ? ' (e.g. missing JD keywords, weak metrics)' : ''}.
- section_feedback: one object per major section present on the resume: { "section": "Summary", "status": "Good" | "Improve", "feedback": "1-2 sentence actionable note" }.
- grammar_suggestions: 2-3 concrete grammar, tone, or clarity fixes.
- project_suggestions: 2-3 ways to present projects more convincingly (or which projects to add).
- achievement_suggestions: 2-3 metrics/achievements to add or reword.
- improvement_suggestions: 3-5 overall prioritized improvements.
- final_review: 2-3 sentence overall verdict${jd ? ' as a hiring manager deciding whether to interview this candidate' : ''}.
- Never invent facts or numbers that are not on the resume.
- Do NOT return an ATS score or percentage — the score is computed by the system.
- Do not return markdown. Return JSON only.

Resume:
${text}
`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeKey = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .slice(0, 60);

const pickLongest = (values) => {
  const unique = [...new Set(values.filter((v) => v && v.trim()))];
  if (unique.length === 0) return '';
  return unique.sort((a, b) => b.length - a.length)[0].trim();
};

const mergeList = (lists, limit = 6) => {
  const seen = new Set();
  const merged = [];
  lists.forEach((list) => {
    (list || []).forEach((s) => {
      const key = normalizeKey(s);
      if (s && key && !seen.has(key) && merged.length < limit) {
        seen.add(key);
        merged.push(String(s).trim());
      }
    });
  });
  return merged;
};

const mergeAIResults = (results) => {
  const merge = (field, limit) => mergeList(results.map((r) => r[field]), limit);
  const longest = (field) => pickLongest(results.map((r) => r[field]));

  const sectionFeedback = [];
  const seenSections = new Set();
  results.forEach((r) => {
    (r.section_feedback || []).forEach((s) => {
      const key = normalizeKey(s.section);
      if (s.feedback && key && !seenSections.has(key)) {
        seenSections.add(key);
        sectionFeedback.push(s);
      }
    });
  });

  return {
    summary: longest('summary'),
    strengths: merge('strengths', 6),
    weaknesses: merge('weaknesses', 6),
    section_feedback: sectionFeedback.slice(0, 10),
    grammar_suggestions: merge('grammar_suggestions', 6),
    project_suggestions: merge('project_suggestions', 6),
    achievement_suggestions: merge('achievement_suggestions', 6),
    improvement_suggestions: merge('improvement_suggestions', 6),
    final_review: longest('final_review')
  };
};

module.exports = {
  DEFAULT_AI,
  parseAnalysisResponse,
  buildPrompt,
  delay,
  mergeAIResults
};
