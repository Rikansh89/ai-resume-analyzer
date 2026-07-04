const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../config/db');
const pdfParse = require('pdf-parse');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeResumeWithAI = async (text) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
  });

  const resumeText = text.substring(0, 4000);

  const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer for Software Engineer roles.

Analyze the resume and return ONLY valid JSON with this exact structure:

{
  "ats_score": 0,
  "missing_skills": [],
  "suggestions": []
}

Rules:
- ats_score must be a number between 0 and 100.
- missing_skills must contain 5-10 relevant technical skills.
- suggestions must contain 3-5 actionable improvements.
- Do not return markdown.
- Do not return explanations.
- Return JSON only.

Resume:
${resumeText}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;

    let raw = response.text().trim();

    raw = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(raw);

    return {
      ats_score: Number(parsed.ats_score) || 60,
      missing_skills: Array.isArray(parsed.missing_skills)
        ? parsed.missing_skills
        : [],
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions
        : []
    };
  } catch (error) {
    if (
      error.message.includes('429') ||
      error.message.includes('quota') ||
      error.message.includes('Quota')
    ) {
      throw new Error(
        'AI quota exceeded. Please try again later or use a new Gemini API key.'
      );
    }

    throw error;
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract enough text from the PDF. Please upload a proper resume.' });
    }

    const analysis = await analyzeResumeWithAI(extractedText);

    const result = db.prepare(
      'INSERT INTO resumes (user_id, filename, ats_score, missing_skills, suggestions, extracted_text) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      req.user.id,
      req.file.originalname,
      analysis.ats_score,
      JSON.stringify(analysis.missing_skills),
      JSON.stringify(analysis.suggestions),
      extractedText.substring(0, 5000)
    );

    res.status(201).json({
      message: 'Resume analyzed successfully.',
      resumeId: result.lastInsertRowid,
      filename: req.file.originalname,
      atsScore: analysis.ats_score,
      missingSkills: analysis.missing_skills,
      suggestions: analysis.suggestions
    });
  } catch (error) {
    res.status(500).json({ error: 'Resume analysis failed: ' + error.message });
  }
};

exports.getResumes = (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT id, filename, ats_score, missing_skills, suggestions, upload_date FROM resumes WHERE user_id = ? ORDER BY upload_date DESC'
    ).all(req.user.id);

    res.json(rows.map(r => ({
      ...r,
      missing_skills: r.missing_skills ? JSON.parse(r.missing_skills) : [],
      suggestions: r.suggestions ? JSON.parse(r.suggestions) : []
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resumes.' });
  }
};

exports.getResumeById = (req, res) => {
  try {
    const r = db.prepare(
      'SELECT id, filename, ats_score, missing_skills, suggestions, upload_date FROM resumes WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);

    if (!r) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    res.json({
      ...r,
      missing_skills: r.missing_skills ? JSON.parse(r.missing_skills) : [],
      suggestions: r.suggestions ? JSON.parse(r.suggestions) : []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resume.' });
  }
};

exports.deleteResume = (req, res) => {
  try {
    const result = db.prepare(
      'DELETE FROM resumes WHERE id = ? AND user_id = ?'
    ).run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    res.json({ message: 'Resume deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resume.' });
  }
};
