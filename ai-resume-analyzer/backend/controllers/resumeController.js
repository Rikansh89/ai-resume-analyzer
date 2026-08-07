const { db } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { extractText } = require('../services/parser/textExtractor');
const { parseResume } = require('../services/parser/resumeParser');
const {
  analyzeDeterministically,
  buildFallbackSummary,
  mergeSuggestions,
  safeJsonArray
} = require('../services/atsAnalyzer');
const { analyzeResumeEnsemble } = require('../services/aiService');
const { DEFAULT_AI } = require('../services/aiShared');

const MIN_EXTRACTED_CHARS = 50;
const MAX_EXTRACTED_CHARS = 15000;

const pickJson = (row, field, fallback) => {
  const value = row[field];
  if (value == null || value === '') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const analyzeResume = async (text, jd = '', targetRole = '') => {
  const extracted = parseResume(text);
  const deterministic = analyzeDeterministically(text, jd, targetRole, extracted);

  let ai = { ...DEFAULT_AI };
  try {
    ai = await analyzeResumeEnsemble(text, jd, targetRole);
  } catch (error) {
    console.error('AI enhancement skipped:', error.message);
  }

  return {
    ...deterministic,
    extracted: {
      name: extracted.name,
      email: extracted.email,
      phone: extracted.phone,
      links: extracted.links,
      skills: extracted.skills,
      education: extracted.education,
      experience: extracted.experience,
      projects: extracted.projects,
      certifications: extracted.certifications
    },
    summary: ai.summary || buildFallbackSummary(text),
    ai_section_feedback: ai.section_feedback,
    grammar_suggestions: ai.grammar_suggestions,
    project_suggestions: ai.project_suggestions,
    achievement_suggestions: ai.achievement_suggestions,
    ai_strengths: ai.strengths,
    ai_weaknesses: ai.weaknesses,
    final_review: ai.final_review,
    ai_improvements: ai.improvement_suggestions,
    suggestions: mergeSuggestions(
      [...(ai.improvement_suggestions || []), ...(ai.grammar_suggestions || [])],
      deterministic.deterministic_suggestions
    )
  };
};

exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new HttpError(400, 'No file uploaded.');
  }

  const extractedText = await extractText(req.file.buffer);

  if (extractedText.length < MIN_EXTRACTED_CHARS) {
    throw new HttpError(
      400,
      'Could not extract enough text from the PDF. Please upload a text-based (non-scanned) resume.'
    );
  }

  const jobDescription = (req.body.job_description || '').trim();
  const targetRole = (req.body.target_role || '').trim();

  const analysis = await analyzeResume(extractedText, jobDescription, targetRole);

  const result = db.prepare(
    `INSERT INTO resumes (
      user_id, filename, ats_score, keyword_score, section_score, parse_score, role_label, target_role,
      jd_keyword_count, job_description, category_scores, extracted, strengths, weaknesses, formatting_issues,
      section_analysis, keyword_match_pct, skills_match_pct, matched_skills, missing_skills,
      matched_jd_keywords, missing_keywords, summary, section_feedback, grammar_suggestions,
      project_suggestions, achievement_suggestions, suggestions, final_review, extracted_text
    ) VALUES (${Array(30).fill('?').join(', ')})`
  ).run(
    req.user.id,
    req.file.originalname,
    analysis.ats_score,
    analysis.category_scores.keywordMatch,
    Math.round(analysis.section_analysis.filter((s) => s.present).length / analysis.section_analysis.length * 100),
    analysis.parse_score,
    analysis.role_label,
    analysis.target_role,
    analysis.jd_keyword_count,
    jobDescription || null,
    JSON.stringify(analysis.category_scores),
    JSON.stringify(analysis.extracted),
    JSON.stringify([...new Set([...(analysis.ai_strengths || []), ...(analysis.strengths || [])])]),
    JSON.stringify([...new Set([...(analysis.ai_weaknesses || []), ...(analysis.weaknesses || [])])]),
    JSON.stringify(analysis.formatting_issues),
    JSON.stringify(analysis.section_analysis),
    analysis.jd_analysis.keywordMatchPct,
    analysis.jd_analysis.skillsMatchPct,
    JSON.stringify(analysis.matched_skills),
    JSON.stringify(analysis.missing_skills),
    JSON.stringify(analysis.jd_analysis.matchedJdKeywords),
    JSON.stringify(analysis.jd_analysis.missingKeywords),
    analysis.summary,
    JSON.stringify(analysis.ai_section_feedback),
    JSON.stringify(analysis.grammar_suggestions),
    JSON.stringify(analysis.project_suggestions),
    JSON.stringify(analysis.achievement_suggestions),
    JSON.stringify(analysis.suggestions),
    analysis.final_review,
    extractedText.substring(0, MAX_EXTRACTED_CHARS)
  );

  const row = db.prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?').get(result.lastInsertRowid, req.user.id);
  res.status(201).json({ message: 'Resume analyzed successfully.', resume: serializeReport(row) });
});

const serializeReport = (r) => {
  const categoryScores = pickJson(r, 'category_scores', {});
  const jdAnalysis = {
    hasJd: Boolean(r.job_description),
    targetRole: r.target_role || null,
    jdKeywordCount: r.jd_keyword_count || 0,
    keywordMatchPct: r.keyword_match_pct,
    skillsMatchPct: r.skills_match_pct,
    matchedJdKeywords: safeJsonArray(r.matched_jd_keywords),
    missingKeywords: safeJsonArray(r.missing_keywords)
  };

  return {
    id: r.id,
    filename: r.filename,
    atsScore: r.ats_score,
    parseScore: r.parse_score,
    roleLabel: r.role_label,
    targetRole: r.target_role,
    jdKeywordCount: r.jd_keyword_count || 0,
    scoreBreakdown: categoryScores,
    extracted: pickJson(r, 'extracted', {}),
    jdAnalysis,
    matchedSkills: safeJsonArray(r.matched_skills),
    missingSkills: safeJsonArray(r.missing_skills),
    strengths: safeJsonArray(r.strengths),
    weaknesses: safeJsonArray(r.weaknesses),
    formattingIssues: safeJsonArray(r.formatting_issues),
    sectionAnalysis: safeJsonArray(r.section_analysis),
    summary: r.summary || '',
    suggestions: safeJsonArray(r.suggestions),
    sectionFeedback: safeJsonArray(r.section_feedback),
    grammarSuggestions: safeJsonArray(r.grammar_suggestions),
    projectSuggestions: safeJsonArray(r.project_suggestions),
    achievementSuggestions: safeJsonArray(r.achievement_suggestions),
    finalReview: r.final_review || '',
    uploadDate: r.upload_date
  };
};

exports.getResumes = asyncHandler(async (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM resumes WHERE user_id = ? ORDER BY upload_date DESC, id DESC'
  ).all(req.user.id);

  res.json(rows.map(serializeReport));
});

exports.getResumeById = asyncHandler(async (req, res) => {
  const r = db.prepare(
    'SELECT * FROM resumes WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id);

  if (!r) {
    throw new HttpError(404, 'Resume not found.');
  }

  res.json(serializeReport(r));
});

exports.deleteResume = asyncHandler(async (req, res) => {
  const result = db.prepare(
    'DELETE FROM resumes WHERE id = ? AND user_id = ?'
  ).run(req.params.id, req.user.id);

  if (result.changes === 0) {
    throw new HttpError(404, 'Resume not found.');
  }

  res.json({ message: 'Resume deleted successfully.' });
});
