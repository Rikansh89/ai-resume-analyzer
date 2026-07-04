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
