const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../config/db');
const pdfParse = require('pdf-parse');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeResumeWithAI = async (text) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer for Software Engineer roles. Analyze the following resume text and return a JSON object (no markdown, no backticks) with exactly these fields:

1. "ats_score": a number from 0 to 100 evaluating how well the resume would score in an ATS for a Software Engineer position.
2. "missing_skills": an array of strings listing important software engineering skills not found in the resume (e.g., "Docker", "AWS", "React", "Node.js", "System Design", "CI/CD", etc.). List between 5-10 missing skills.
3. "suggestions": an array of strings with actionable improvement suggestions for the resume (between 3-5 suggestions). Focus on content, formatting, keywords, and impact.

Resume text:
${text.substring(0, 15000)}
`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  let raw = response.text().trim();

  if (raw.startsWith('```json')) raw = raw.replace(/```json\n?/g, '').replace(/```/g, '');
  if (raw.startsWith('```')) raw = raw.replace(/```\n?/g, '').replace(/```/g, '');

  return JSON.parse(raw);
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
