const pdfParse = require('pdf-parse');

const normalizeText = (raw) => {
  let text = String(raw || '')
    .replace(/\u0000/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text;
};

const decodePdfString = (str) =>
  str
    .replace(/\\([nrtbf()\\])/g, (_, c) => ({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' }[c] || c))
    .replace(/\\(\d{1,3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)));

const extractRawPdfText = (buffer) => {
  const content = buffer.toString('latin1');
  const chunks = [];
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;

  while ((match = streamRegex.exec(content)) !== null) {
    const stream = match[1];
    if (!/BT/.test(stream) || !/ET/.test(stream)) continue;

    let text = '';
    const opsRegex = /\(((?:\\.|[^\\()])*)\)\s*(TJ|Tj|'|")|\[([\s\S]*?)\]\s*TJ|(Td|TD|T\*|Tm|Tf)/g;
    let op;

    while ((op = opsRegex.exec(stream)) !== null) {
      if (op[1]) {
        text += decodePdfString(op[1]);
        if (op[2] === 'Tj' || op[2] === "'" || op[2] === '"') text += ' ';
      } else if (op[3]) {
        const parts = op[3].match(/\(((?:\\.|[^\\()])*)\)/g) || [];
        parts.forEach((p) => {
          text += decodePdfString(p.slice(1, -1));
        });
        text += ' ';
      } else if (op[4]) {
        text += '\n';
      }
    }

    if (text.trim()) chunks.push(text.trim());
  }

  return chunks.join('\n');
};

const EXTRACTION_LIMIT = 15000;

const extractText = async (buffer) => {
  const primaryText = await pdfParse(buffer).then(
    (pdf) => normalizeText(pdf.text || ''),
    () => ''
  );

  if (primaryText.length >= 80) {
    return primaryText.substring(0, EXTRACTION_LIMIT);
  }

  const fallbackText = normalizeText(extractRawPdfText(buffer));
  if (fallbackText.length >= 80) {
    return fallbackText.substring(0, EXTRACTION_LIMIT);
  }

  const best = primaryText.length >= fallbackText.length ? primaryText : fallbackText;
  if (best.length >= 40) {
    return best.substring(0, EXTRACTION_LIMIT);
  }

  return '';
};

module.exports = { extractText, normalizeText };
