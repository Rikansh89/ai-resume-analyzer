const { ALL_KEYWORDS } = require('./skills');

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE_PATTERN = /(\+?\d{1,3}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/;
const YEAR_PATTERN = /\b(19|20)\d{2}\b/;
const DATE_RANGE_PATTERN = /(19|20)\d{2}\s*(?:-|–|—|to)\s*(?:present|current|now|(?:19|20)\d{2})/i;

const LINK_PATTERNS = [
  { label: 'LinkedIn', pattern: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[^\s,;]+/i },
  { label: 'GitHub', pattern: /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s,;]+/i },
  { label: 'Portfolio', pattern: /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.(?:dev|io|me|com|net|org)\/[^\s,;]*/i },
  { label: 'Link', pattern: /https?:\/\/[^\s,;]+/i }
];

const SECTION_PATTERNS = [
  {
    key: 'summary',
    label: 'Professional Summary',
    patterns: [/^(professional )?summary$/i, /^profile$/i, /^objective$/i, /^about (me|myself)$/i, /^career (summary|objective)$/i]
  },
  {
    key: 'skills',
    label: 'Skills',
    patterns: [/^skills?$/i, /^technical skills$/i, /^core (competencies|skills)$/i, /^technologies$/i, /^tech stack$/i, /^tools?$/i]
  },
  {
    key: 'experience',
    label: 'Work Experience',
    patterns: [/^(work |professional |relevant )?experience$/i, /^employment (history)?$/i, /^work history$/i, /^professional (history|background)$/i]
  },
  {
    key: 'education',
    label: 'Education',
    patterns: [/^education$/i, /^academic (background|qualifications)$/i, /^academics$/i]
  },
  {
    key: 'projects',
    label: 'Projects',
    patterns: [/^projects?$/i, /^(personal|selected|side|technical|professional) projects?$/i, /^portfolio$/i]
  },
  {
    key: 'certifications',
    label: 'Certifications',
    patterns: [/^certifications?$/i, /^licenses?$/i, /^licenses? & certifications?$/i, /^credentials?$/i, /^courses?$/i, /^trainings?$/i]
  }
];

const DEGREE_PATTERN = /(b\.?s\.?|b\.?a\.?|b\.?tech|bachelor(?:'s)?|m\.?s\.?|m\.?a\.?|m\.?tech|m\.?sc|master(?:'s)?|m\.?b\.?a|ph\.?d|doctorate|doctor of|associate(?:'s)?|diploma|m\.?phil|b\.?e\.?|m\.?e\.?)/i;
const INSTITUTION_PATTERN = /\b(university|college|institute|school|academy|polytechnic|iit|nit|iiit|vit|bits)\b/i;

const splitSections = (lines) => {
  const boundaries = [];

  lines.forEach((line, index) => {
    const text = line.trim();
    if (!text || text.length > 70) return;

    const section = SECTION_PATTERNS.find((s) => s.patterns.some((p) => p.test(text)));
    if (section && !boundaries.some((b) => b.key === section.key)) {
      boundaries.push({ key: section.key, label: section.label, index });
    }
  });

  boundaries.sort((a, b) => a.index - b.index);

  const ranges = {};
  boundaries.forEach((b, i) => {
    const start = b.index + 1;
    const end = i < boundaries.length - 1 ? boundaries[i + 1].index : lines.length;
    ranges[b.key] = { lines: lines.slice(start, end), startLine: b.index };
  });

  return ranges;
};

const extractLinks = (text) => {
  const links = [];
  LINK_PATTERNS.forEach(({ label, pattern }) => {
    const match = text.match(pattern);
    if (match && !links.some((l) => l.url === match[0])) {
      links.push({ label, url: match[0].replace(/[,;]+$/, '') });
    }
  });
  return links;
};

const extractSkills = (text, sections) => {
  const found = new Set();
  const source = sections.skills ? sections.skills.lines.join(' ') : text;
  ALL_KEYWORDS.forEach((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp('(?<!\\w)' + escaped + '(?!\\w)', 'i').test(source)) {
      found.add(skill);
    }
  });

  const sectionTerms = (sections.skills ? sections.skills.lines.join(' ') : '')
    .split(/[\n,;|•]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && t.length <= 40);
  sectionTerms.forEach((term) => {
    if (/^[A-Za-z][A-Za-z0-9+#.() ]+$/.test(term) && !/[A-Z]\.$/.test(term)) found.add(term);
  });

  return [...found].sort();
};

const extractName = (lines, links) => {
  const labeled = lines.find((l) => /^name\s*[:|]/i.test(l.trim()));
  if (labeled) {
    const value = labeled.trim().replace(/^name\s*[:|]/i, '').trim();
    if (value) return value;
  }

  const contactLike = (l) =>
    EMAIL_PATTERN.test(l) || PHONE_PATTERN.test(l) || /^(linkedin|github|portfolio)\b/i.test(l) || /^https?:\/\//i.test(l);

  const candidates = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.length > 45 || contactLike(line)) continue;
    if (SECTION_PATTERNS.some((s) => s.patterns.some((p) => p.test(line)))) continue;
    if (/\d{4}/.test(line)) continue;

    const words = line.split(/\s+/);
    if (words.length < 2 || words.length > 4) continue;
    if (!words.every((w) => /^[A-Z][a-zA-Z'.-]{1,}$/.test(w))) continue;
    candidates.push(line);
  }

  return candidates[0] || null;
};

const extractEducation = (sectionLines) => {
  const entries = [];
  let current = null;

  sectionLines.forEach((line) => {
    const text = line.trim();
    if (!text) return;

    const isNewEntry = DEGREE_PATTERN.test(text) || YEAR_PATTERN.test(text) || INSTITUTION_PATTERN.test(text);

    if (isNewEntry && (DEGREE_PATTERN.test(text) || /^\d{4}/.test(text) || INSTITUTION_PATTERN.test(text))) {
      if (current) entries.push(current);
      current = { degree: '', institution: '', year: '' };
    }

    if (!current) return;

    if (!current.degree && DEGREE_PATTERN.test(text)) current.degree = text;
    else if (INSTITUTION_PATTERN.test(text)) current.institution = text;
    else if (!current.year) {
      const years = text.match(YEAR_PATTERN);
      if (years) current.year = text.match(DATE_RANGE_PATTERN)?.[0] || years[0];
    } else if (!current.institution && text.length < 60) {
      current.institution = text;
    }
  });

  if (current) entries.push(current);

  return entries
    .map((e) => ({ ...e, line: [e.degree, e.institution, e.year].filter(Boolean).join(' — ') }))
    .filter((e) => e.line);
};

const extractExperience = (sectionLines) => {
  const entries = [];
  let current = null;

  const startEntry = (line) => {
    if (current) entries.push(current);
    const parts = line.split(/\s*[|–—·]\s*/).map((p) => p.trim());
    const title = parts[0] || '';
    const company = parts.length >= 2 ? parts[1] : '';
    const dates = parts.length >= 3 ? parts[2] : '';
    current = { title, company, dates, bullets: [] };
  };

  sectionLines.forEach((line) => {
    const text = line.trim();
    if (!text) return;

    const isBullet = /^[-•*·\d.)\]]/.test(text);
    const hasDateRange = DATE_RANGE_PATTERN.test(text);
    const singleYear = /^\d{4}$/.test(text);

    if (isBullet) {
      if (current) current.bullets.push(text.replace(/^[-•*·\d.)\]]+\s*/, ''));
      return;
    }

    if (hasDateRange) {
      startEntry(text);
      return;
    }

    if (!current) {
      startEntry(text);
      return;
    }

    if (current.title && current.company && current.dates && !current.bullets.length) {
      startEntry(text);
      return;
    }

    if (!current.title) {
      current.title = text;
    } else if (!current.company) {
      const looksLikeRole = /^([A-Z][a-zA-Z.]+\s*){1,4}$/.test(text) && !/^[a-z]/.test(text);
      if (looksLikeRole && text.length < 45 && !/at\b/i.test(text)) {
        current.company = text;
      } else {
        current.title = [current.title, text].join(' ');
      }
    } else if (!current.dates && (singleYear || /\d{4}/.test(text))) {
      current.dates = text;
    } else if (!current.bullets.length) {
      current.bullets.push(text);
    }
  });

  if (current) entries.push(current);

  return entries
    .map((e) => ({
      ...e,
      hasDates: Boolean(e.dates),
      quantified: e.bullets.some((b) => /\d/.test(b)),
      line: [e.title, e.company, e.dates].filter(Boolean).join(' — ')
    }))
    .filter((e) => e.title);
};

const extractProjects = (sectionLines) => {
  const entries = [];
  let current = null;

  const pushEntry = () => {
    if (current && current.name) {
      const tech = ALL_KEYWORDS.filter((k) => new RegExp('(?<!\\w)' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?!\\w)', 'i').test(`${current.description} ${current.name}`));
      entries.push({ ...current, tech, hasLink: Boolean(current.link), line: [current.name, current.link].filter(Boolean).join(' — ') });
    }
  };

  sectionLines.forEach((line) => {
    const text = line.trim();
    if (!text) return;

    const isBullet = /^[-•*·\d.)\]]/.test(text);
  const urlMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s,;]*)?/i);

    if (!isBullet && !current) {
      current = { name: text, description: '', link: urlMatch ? urlMatch[0] : '' };
      return;
    }

    if (isBullet && current) {
      current.description = [current.description, text.replace(/^[-•*·\d.)\]]+\s*/, '')].filter(Boolean).join(' ').trim();
      return;
    }

    if (!isBullet && current) {
      pushEntry();
      current = { name: text, description: '', link: urlMatch ? urlMatch[0] : '' };
    }
  });

  pushEntry();

  return entries.map((e) => {
    const separator = /[|:—]/.test(e.name) ? e.name.split(/\s*[|:—]\s*/).map((p) => p.trim()) : [e.name];
    return {
      ...e,
      name: separator[0] || e.name,
      description: separator.length > 1 ? [separator[1], e.description].filter(Boolean).join(' ').trim() : e.description,
      link: e.link || (separator.find((p) => /^https?:\/\//i.test(p)) || '')
    };
  });
};

const extractCertifications = (sectionLines) => {
  const certs = sectionLines
    .map((l) => l.trim())
    .filter((l) => /^[-•*·\d.)\]]+\s*/.test(l) || (l.length >= 4 && l.length <= 90 && !/^https?:/i.test(l)))
    .map((l) => l.replace(/^[-•*·\d.)\]]+\s*/, '').trim())
    .filter(Boolean);

  const certKeywords = /(certified|certification|aws|azure|google cloud|scrum|pmp|ccna|comptia|python|aws certified|professional|foundation|associate|developer|architect|admin|exam|bootcamp|udemy|coursera)/i;
  const labeled = certs.filter((c) => certKeywords.test(c));

  const result = (labeled.length >= 2 ? labeled : certs.slice(0, 6)).filter((c) => c.length <= 90);
  return [...new Set(result)];
};

const parseResume = (text) => {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l);
  const sections = splitSections(lines);
  const head = text.split('\n').slice(0, 12);

  const emailMatch = text.match(EMAIL_PATTERN);
  const phoneMatch = text.match(PHONE_PATTERN);

  return {
    name: extractName(head, []),
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
    links: extractLinks(text),
    skills: extractSkills(text, sections),
    education: extractEducation(sections.education ? sections.education.lines : []),
    experience: extractExperience(sections.experience ? sections.experience.lines : []),
    projects: extractProjects(sections.projects ? sections.projects.lines : []),
    certifications: extractCertifications(sections.certifications ? sections.certifications.lines : []),
    sections: Object.keys(sections),
    sectionRanges: sections
  };
};

module.exports = { parseResume, splitSections, SECTION_PATTERNS };
