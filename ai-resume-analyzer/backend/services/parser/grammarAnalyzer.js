const WEAK_WORDS = [
  'very', 'really', 'quite', 'a lot of', 'lots of', 'stuff', 'things', 'worked on', 'good at',
  'responsible for', 'various', 'etc', 'etc.', 'team player', 'hard working', 'hard-working', 'self motivated', 'self-motivated'
];

const COMMON_TYPOS = [
  ['recieve', 'receive'],
  ['seperate', 'separate'],
  ['occured', 'occurred'],
  ['accomodate', 'accommodate'],
  ['untill', 'until'],
  ['adress', 'address'],
  ['writting', 'writing'],
  ['developement', 'development'],
  ['expereince', 'experience'],
  ['technologies', 'technologies'],
  ['comminication', 'communication'],
  ['priviledge', 'privilege'],
  ['sucess', 'success'],
  ['enviroment', 'environment'],
  ['teh', 'the'],
  ['wich', 'which'],
  ['excellent communication skill', 'excellent communication skills']
];

const BULLET_START = /^[-•*·\d.)\]]/;

const analyzeGrammar = (text) => {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);

  const words = text.match(/[A-Za-z]+(?:['-][A-Za-z]+)?/g) || [];
  const wordCount = words.length;
  const avgSentenceWords = sentences.length > 0 ? wordCount / sentences.length : 0;

  const longSentences = sentences.filter((s) => s.split(/\s+/).length > 30);
  const passiveMatches = text.match(/\b(was|were|has been|have been|had been|is being|are being)\s+[a-z]+ed\b/gi) || [];
  const weakCount = WEAK_WORDS.reduce((acc, w) => {
    const re = new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    const matches = text.match(re) || [];
    return acc + matches.length;
  }, 0);

  const bulletLines = text.split('\n').filter((l) => BULLET_START.test(l.trim()));
  const quantifiedBullets = bulletLines.filter((l) => /\d/.test(l));
  const quantifiedPct = bulletLines.length > 0 ? quantifiedBullets.length / bulletLines.length : 0;

  const typoIssues = [];
  COMMON_TYPOS.forEach(([wrong, right]) => {
    if (new RegExp('\\b' + wrong + '\\b', 'i').test(text)) {
      typoIssues.push(`"${wrong}" should be "${right}"`);
    }
  });

  const STOP_WORDS = new Set(['and', 'the', 'to', 'of', 'a', 'in', 'for', 'with', 'on', 'i', 'my', 'as', 'at', 'that', 'this', 'we', 'our', 'or', 'an', 'is', 'are', 'was', 'be']);
  const wordFreq = {};
  words.forEach((w) => {
    const key = w.toLowerCase();
    wordFreq[key] = (wordFreq[key] || 0) + 1;
  });
  const repeated = Object.entries(wordFreq)
    .filter(([w, count]) => count > 8 && !STOP_WORDS.has(w))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  let score = 60;
  if (avgSentenceWords >= 12 && avgSentenceWords <= 24) score += 10;
  else if (avgSentenceWords > 30 || (avgSentenceWords < 8 && wordCount > 100)) score -= 10;
  score += Math.min(15, Math.round(quantifiedPct * 30));
  score -= Math.min(20, longSentences.length * 5);
  score -= Math.min(15, passiveMatches.length * 2);
  score -= Math.min(15, weakCount * 2);
  score -= Math.min(15, typoIssues.length * 5);
  if (wordCount < 60) score -= 20;
  if (wordCount > 1200) score -= 10;

  score = Math.max(0, Math.min(100, score));

  const issues = [];
  if (longSentences.length > 0) issues.push(`Split ${longSentences.length} run-on sentence(s) over 30 words into shorter, scannable lines.`);
  if (passiveMatches.length > 0) issues.push(`Rewrite ${passiveMatches.length} passive phrases (e.g. "was responsible for") into active, impact-driven verbs ("led", "built", "shipped").`);
  if (weakCount > 0) issues.push(`Replace vague filler words like "very", "really", "worked on" with specific actions and metrics.`);
  if (quantifiedPct < 0.5 && bulletLines.length >= 2) issues.push(`Add numbers to more of your bullets — only ${Math.round(quantifiedPct * 100)}% currently contain metrics.`);
  if (repeated.length > 0) issues.push(`Vary repetitive wording — "${repeated[0][0]}" appears ${repeated[0][1]} times.`);
  typoIssues.slice(0, 3).forEach((t) => issues.push(t));
  if (wordCount < 60) issues.push('The resume text is very short — expand each section with concrete details.');

  return {
    score: Math.round(score),
    avgSentenceWords: Math.round(avgSentenceWords * 10) / 10,
    quantifiedBulletPct: Math.round(quantifiedPct * 100),
    issues: issues.slice(0, 8)
  };
};

module.exports = { analyzeGrammar };
