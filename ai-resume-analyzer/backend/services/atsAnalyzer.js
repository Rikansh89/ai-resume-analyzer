const { ROLES, ALL_KEYWORDS, FALLBACK_CORE_SKILLS } = require('./parser/skills');
const { analyzeGrammar } = require('./parser/grammarAnalyzer');
const { SECTION_PATTERNS } = require('./parser/resumeParser');

const WEIGHTS = {
  parsing: 0.1,
  contact: 0.05,
  skillsMatch: 0.2,
  keywordMatch: 0.2,
  experience: 0.15,
  education: 0.1,
  projects: 0.1,
  formatting: 0.05,
  grammar: 0.05
};

const MAX_MATCHED_SKILLS = 40;
const MAX_SUGGESTIONS = 8;
const MIN_SKILL_SCORE = 4;

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const matchesKeyword = (text, keyword) =>
  new RegExp('(?<!\\w)' + escapeRegex(keyword) + '(?!\\w)', 'i').test(text);

const findRole = (key) => ROLES.find((r) => r.key === key) || null;

const detectRole = (text) => {
  let best = null;
  let bestScore = 0;
  ROLES.forEach((role) => {
    const score = role.keywords.filter((k) => matchesKeyword(text, k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = role;
    }
  });
  return bestScore >= MIN_SKILL_SCORE ? best : null;
};

const skillWeight = (skill, role) => {
  if (!role) return 1;
  if (role.core.includes(skill)) return 1;
  if (role.keywords.includes(skill)) return 0.7;
  return 0.4;
};

const computeParseScore = (text) => {
  const chars = text.length;
  const lines = text.split(/\n+/).filter((l) => l.trim()).length;
  const garbled = (text.match(/[\u0000\uFFFD]/g) || []).length;

  if (chars > 200 && lines <= 1) return 25;

  let score = 50;
  score += Math.min(30, Math.round((lines / 20) * 30));
  score += Math.min(20, Math.round((chars / 2000) * 20));
  score -= Math.min(25, garbled * 5);
  return Math.max(0, Math.min(100, score));
};

const scoreContact = (extracted) => {
  let score = 0;
  if (extracted.email) score += 35;
  if (extracted.phone) score += 30;
  const linkCount = extracted.links.length;
  score += Math.min(25, linkCount * 12);
  score += extracted.name ? 10 : 0;
  return Math.min(100, score);
};

const scoreSkills = ({ role, jdKeywords, jdMatched, matchedAll }) => {
  if (jdKeywords.length > 0) {
    const weights = jdKeywords.map((k) => (role && role.core.includes(k) ? 1 : 0.7));
    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
    const matchedWeight = jdKeywords.reduce(
      (acc, k, i) => (jdMatched.includes(k) ? acc + weights[i] : acc),
      0
    );
    const volume = Math.min(1, matchedAll.length / 15);
    return Math.min(100, Math.round(100 * (0.75 * (matchedWeight / totalWeight) + 0.25 * volume)));
  }

  if (!role) return Math.min(100, matchedAll.length * 6);
  const coreMatched = role.core.filter((k) => matchedAll.includes(k));
  const coverage = coreMatched.length / role.core.length;
  const volume = Math.min(1, matchedAll.length / 15);
  return Math.min(100, Math.round(100 * (0.8 * coverage + 0.2 * volume)));
};

const scoreKeyword = ({ role, jdKeywords, jdMatched, matchedAll }) => {
  if (jdKeywords.length > 0) {
    return Math.round(100 * (jdMatched.length / jdKeywords.length));
  }
  const weighted = matchedAll.reduce((acc, s) => acc + skillWeight(s, role), 0);
  return Math.min(100, Math.round(100 * (1 - Math.exp(-weighted / 6.5))));
};

const scoreExperience = (experience, hasSection) => {
  if (!hasSection) return 0;
  let score = 25;
  score += Math.min(20, experience.length * 10);
  const hasDates = experience.some((e) => e.hasDates);
  if (hasDates) score += 25;
  const hasQuant = experience.some((e) => e.quantified);
  if (hasQuant) score += 20;
  const hasBullets = experience.some((e) => e.bullets.length >= 2);
  if (hasBullets) score += 10;
  return Math.min(100, score);
};

const scoreEducation = (education, hasSection) => {
  if (!hasSection) return 0;
  let score = 30;
  const degreeOrder = { phd: 85, master: 65, bachelor: 45, associate: 25, other: 15 };
  const text = education.map((e) => (e.line || '') + ' ' + (e.degree || '')).join(' ').toLowerCase();
  let level = 'other';
  if (/ph\.?d|doctorate/i.test(text)) level = 'phd';
  else if (/master|m\.?s\.?|mba|m\.?tech/i.test(text)) level = 'master';
  else if (/bachelor|b\.?s\.?|b\.?tech/i.test(text)) level = 'bachelor';
  else if (/associate|diploma/i.test(text)) level = 'associate';
  score += degreeOrder[level];
  const hasInstitution = education.some((e) => e.institution);
  if (hasInstitution) score += 15;
  return Math.min(100, score);
};

const scoreProjects = (projects, hasSection, sectionText) => {
  if (!hasSection) return 0;
  let score = 30;
  score += Math.min(25, projects.length * 12);
  if (projects.some((p) => p.hasLink)) score += 20;
  const techUsed = ALL_KEYWORDS.filter((k) => matchesKeyword(sectionText, k)).length;
  score += Math.min(25, techUsed * 3);
  return Math.min(100, score);
};

const scoreFormatting = (text, sections, sectionRanges) => {
  let score = 50;
  const headings = ['summary', 'skills', 'experience', 'education'].filter((k) => sectionRanges[k]);
  score += Math.min(20, headings.length * 5);
  if ((text.match(/[\u0000\uFFFD]/g) || []).length > 0) score -= 30;

  const longLines = text.split('\n').filter((l) => l.trim().length > 150).length;
  if (longLines > 2) score -= 10;

  const bullets = (text.match(/^[-•*·]/gm) || []).length;
  if (bullets >= 4) score += 10;

  const lines = text.split(/\n+/).filter((l) => l.trim()).length;
  if (lines <= 1) score -= 30;
  if (lines > 60) score += 10;

  return Math.max(0, Math.min(100, score));
};

const buildSectionAnalysis = (sections, sectionRanges, text, extracted) => {
  return sections.map((section) => {
    const range = sectionRanges[section.key];
    const content = range ? range.lines.join(' ').trim() : '';

    let present;
    if (section.key === 'contact') {
      present = Boolean(
        (extracted.email || extracted.phone || (extracted.links || []).length > 0) ||
        (content.length >= 3)
      );
    } else {
      present = Boolean(range && content.length >= 3);
    }

    let score = 0;
    if (present) {
      score = 60;
      if (content.length >= 80) score += 20;
      if (section.key === 'experience' && /\d{4}/.test(content)) score += 10;
      if (section.key === 'projects' && /https?:\/\//i.test(content)) score += 10;
      if (section.key === 'contact' && /@/.test(content)) score += 20;
      score = Math.min(100, score);
    }

    const feedback = present
      ? section.key === 'contact'
        ? 'Contact information detected and findable at the top.'
        : 'Section present and parsed successfully.'
      : section.feedbackMissing || `Add a "${section.label}" section with clear headings so ATS parsers can read it.`;

    return {
      label: section.label,
      key: section.key,
      present,
      score,
      wordCount: content ? content.split(/\s+/).filter(Boolean).length : 0,
      preview: content.slice(0, 120),
      feedback
    };
  });
};

const SECTIONS = [
  { key: 'contact', label: 'Contact Information', feedbackMissing: 'Add your name, email, phone and LinkedIn/GitHub link at the top.' },
  { key: 'summary', label: 'Professional Summary', feedbackMissing: 'Add a 2-3 sentence professional summary at the top.' },
  { key: 'skills', label: 'Skills', feedbackMissing: 'Add a dedicated Skills section listing technologies, tools and frameworks.' },
  { key: 'experience', label: 'Work Experience', feedbackMissing: 'Add a Work Experience section with titles, companies, dates and quantified bullets.' },
  { key: 'education', label: 'Education', feedbackMissing: 'Add an Education section with degrees and institutions.' },
  { key: 'projects', label: 'Projects', feedbackMissing: 'Add a Projects section with links to repositories or deployed apps.' },
  { key: 'certifications', label: 'Certifications', feedbackMissing: 'Add certifications or licenses (e.g., AWS, Google Cloud, Scrum).' }
];

const analyzeDeterministically = (text, jd = '', targetRoleKey = '', extracted = {}) => {
  const combined = (text + ' ' + jd).trim();
  const requestedRole = findRole(targetRoleKey);
  const role = requestedRole || detectRole(combined);
  const matchedAll = [...new Set(ALL_KEYWORDS.filter((k) => matchesKeyword(text, k)))];

  let jdKeywords = jd ? [...new Set(ALL_KEYWORDS.filter((k) => matchesKeyword(jd, k)))] : [];
  let hasTarget = jdKeywords.length > 0;
  let targetSource = 'the job description';

  if (!hasTarget && requestedRole) {
    hasTarget = true;
    const article = /^[aeiou]/i.test(role.label) ? 'an' : 'a';
    targetSource = `${article} ${role.label} role`;
    jdKeywords = [...requestedRole.core];
  }

  const jdMatched = jdKeywords.filter((k) => matchedAll.includes(k));
  const jdMissing = jdKeywords.filter((k) => !matchedAll.includes(k));

  const parseScore = computeParseScore(text);
  const sectionRanges = {};
  extracted.sectionRanges = extracted.sectionRanges || {};
  SECTIONS.forEach((s) => { sectionRanges[s.key] = extracted.sectionRanges[s.key] || null; });

  const experience = extracted.experience || [];
  const education = extracted.education || [];
  const projects = extracted.projects || [];
  const certifications = extracted.certifications || [];

  const hasSection = (key) => Boolean(sectionRanges[key]);

  const categoryScores = {
    parsing: parseScore,
    contact: scoreContact(extracted),
    skillsMatch: scoreSkills({ role, jdKeywords, jdMatched, matchedAll }),
    keywordMatch: scoreKeyword({ role, jdKeywords, jdMatched, matchedAll }),
    experience: scoreExperience(experience, hasSection('experience')),
    education: scoreEducation(education, hasSection('education')),
    projects: scoreProjects(projects, hasSection('projects'), sectionRanges.projects ? sectionRanges.projects.lines.join(' ') : ''),
    formatting: scoreFormatting(text, [], sectionRanges),
    grammar: analyzeGrammar(text).score
  };

  let atsScore = 0;
  Object.entries(categoryScores).forEach(([key, score]) => {
    atsScore += score * WEIGHTS[key];
  });
  atsScore = Math.round(atsScore);

  const sectionAnalysis = buildSectionAnalysis(SECTIONS, sectionRanges, text, extracted);

  const grammar = analyzeGrammar(text);
  const missingSkills = (hasTarget ? jdMissing : FALLBACK_CORE_SKILLS.filter((s) => !matchedAll.includes(s))).slice(0, 10);
  const matchedSkills = jdMatched.length > 0
    ? [...jdMatched, ...matchedAll.filter((s) => !jdMatched.includes(s))].slice(0, MAX_MATCHED_SKILLS)
    : matchedAll.slice(0, MAX_MATCHED_SKILLS);

  const jdAnalysis = {
    hasJd: Boolean(jd && jd.trim()),
    targetRole: requestedRole ? requestedRole.label : null,
    jdKeywordCount: jdKeywords.length,
    keywordMatchPct: hasTarget ? Math.round(100 * (jdMatched.length / jdKeywords.length)) : null,
    skillsMatchPct: hasTarget ? categoryScores.skillsMatch : null,
    matchedJdKeywords: jdMatched,
    missingKeywords: jdMissing.slice(0, 12)
  };

  const strengths = [];
  const weaknesses = [];
  const formattingIssues = [];
  const deterministicSuggestions = [];

  if (hasTarget) {
    if (jdMatched.length > 0) strengths.push(`Matches ${jdMatched.length} of ${jdKeywords.length} requested skills for ${targetSource}.`);
    else weaknesses.push(`No skills requested by ${targetSource} were found on your resume.`);
    if (jdMissing.length > 0) {
      weaknesses.push(`Missing ${jdMissing.length} skills requested by ${targetSource}.`);
      deterministicSuggestions.push(
        `Your resume is missing skills that ${targetSource} asks for: ${jdMissing.slice(0, 8).join(', ')}.`
      );
    }
  }

  const topCategory = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]).filter(([, v]) => v >= 70);
  topCategory.slice(0, 3).forEach(([key, value]) => {
    const label = {
      parsing: 'parses cleanly for ATS software',
      contact: 'has complete, findable contact information',
      skillsMatch: 'shows strong skill coverage',
      keywordMatch: 'uses highly relevant keywords',
      experience: 'shows solid, detailed work experience',
      education: 'documents a strong educational background',
      projects: 'showcases hands-on projects',
      formatting: 'is well-formatted with standard headings',
      grammar: 'is well-written and easy to read'
    }[key];
    if (label) strengths.push(`Resume ${label} (${value}/100).`);
  });

  const lowCategory = Object.entries(categoryScores).sort((a, b) => a[1] - b[1]).filter(([, v]) => v < 60);
  lowCategory.slice(0, 4).forEach(([key, value]) => {
    const label = {
      contact: 'Contact info is incomplete',
      skillsMatch: 'Skills coverage is thin',
      keywordMatch: 'Keyword density is low',
      experience: 'Experience section lacks detail or metrics',
      education: 'Education section is weak or missing',
      projects: 'Projects section is missing or sparse',
      formatting: 'Formatting needs cleanup',
      grammar: 'Grammar and readability need work'
    }[key];
    if (label) weaknesses.push(`${label} (${value}/100).`);
  });

  sectionAnalysis.forEach((s) => {
    if (!s.present) {
      weaknesses.push(s.feedback);
      deterministicSuggestions.push(s.feedback);
    } else if (s.wordCount < 30 && !['contact', 'skills'].includes(s.key)) {
      weaknesses.push(`The "${s.label}" section is thin (${s.wordCount} words) — add more detail.`);
    }
  });

  if (grammar.issues.length > 0) {
    grammar.issues.forEach((issue) => formattingIssues.push(issue));
  }

  if (hasSection('experience') && experience.length > 0 && !experience.some((e) => e.quantified)) {
    formattingIssues.push('No quantified achievements in Work Experience — add metrics (%, $, time saved, users served).');
  }

  const garbledCount = (text.match(/[\u0000\uFFFD]/g) || []).length;
  if (garbledCount > 0) formattingIssues.push(`Detected ${garbledCount} garbled/encoding characters — re-export the PDF to fix text extraction.`);

  const lines = text.split(/\n+/).filter((l) => l.trim()).length;
  if (lines <= 1) formattingIssues.push('Resume appears to be a single text block — ATS systems prefer structured, multi-line resumes.');
  if (lines > 60) formattingIssues.push(`Resume is very long (${lines} lines). Keep it concise — ideally one page.`);

  if (categoryScores.formatting < 60) {
    formattingIssues.push('Use standard section headings (Summary, Skills, Experience, Education) and consistent bullet styles.');
  }

  if (categoryScores.keywordMatch < 40) {
    deterministicSuggestions.push('List your technical stack explicitly (languages, frameworks, databases, tools) so ATS parsers can match keywords.');
  }

  if (categoryScores.grammar < 60) {
    deterministicSuggestions.push('Tighten phrasing, fix grammar and add measurable achievements — recruiters skim in seconds.');
  }

  if (parseScore < 40) {
    deterministicSuggestions.push('Text extraction looks weak — avoid image-only or scanned PDFs and make sure text is selectable.');
  }

  if (extracted.name) strengths.push(`Detected candidate name "${extracted.name}" correctly.`);

  return {
    ats_score: atsScore,
    category_scores: categoryScores,
    weights: WEIGHTS,
    parse_score: parseScore,
    role_label: role ? role.label : null,
    target_role: requestedRole ? requestedRole.label : null,
    jd_keyword_count: jdKeywords.length,
    jd_analysis: jdAnalysis,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    strengths: [...new Set(strengths)].slice(0, 6),
    weaknesses: [...new Set(weaknesses)].slice(0, 8),
    formatting_issues: [...new Set(formattingIssues)].slice(0, 8),
    section_analysis: sectionAnalysis,
    grammar: grammar,
    deterministic_suggestions: [...new Set(deterministicSuggestions)].slice(0, MAX_SUGGESTIONS)
  };
};

const buildFallbackSummary = (text) => {
  const line = text.split(/\n+/).map((l) => l.trim()).find((l) => l.length >= 20);
  const source = line || text.replace(/\s+/g, ' ').trim();
  return source.length > 180 ? source.slice(0, 177).trimEnd() + '...' : source;
};

const mergeSuggestions = (aiSuggestions, deterministicSuggestions) => {
  const seen = new Set();
  const merged = [];
  const push = (s) => {
    const key = String(s).toLowerCase().replace(/\s+/g, ' ').slice(0, 50);
    if (key && !seen.has(key) && merged.length < MAX_SUGGESTIONS) {
      seen.add(key);
      merged.push(String(s));
    }
  };
  (aiSuggestions || []).forEach(push);
  (deterministicSuggestions || []).forEach(push);
  return merged;
};

const safeJsonArray = (value) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

module.exports = {
  analyzeDeterministically,
  buildFallbackSummary,
  mergeSuggestions,
  safeJsonArray,
  WEIGHTS
};
