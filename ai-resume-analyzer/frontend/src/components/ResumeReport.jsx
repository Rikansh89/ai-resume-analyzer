import React from 'react';
import Card from './ui/Card';
import Chip from './ui/Chip';
import IconWell from './ui/IconWell';
import SectionHeader from './ui/SectionHeader';

const CATEGORIES = [
  { key: 'parsing', label: 'Resume parsing', weight: '10%' },
  { key: 'contact', label: 'Contact information', weight: '5%' },
  { key: 'skillsMatch', label: 'Skills match', weight: '20%' },
  { key: 'keywordMatch', label: 'Keyword match', weight: '20%' },
  { key: 'experience', label: 'Experience', weight: '15%' },
  { key: 'education', label: 'Education', weight: '10%' },
  { key: 'projects', label: 'Projects', weight: '10%' },
  { key: 'formatting', label: 'Formatting', weight: '5%' },
  { key: 'grammar', label: 'Grammar & readability', weight: '5%' }
];

const scoreColor = (score) => {
  if (score >= 80) return { text: 'text-teal-700', bar: 'bg-gradient-to-r from-teal-500 to-teal-400' };
  if (score >= 60) return { text: 'text-amber-600', bar: 'bg-gradient-to-r from-amber-500 to-amber-400' };
  return { text: 'text-red-600', bar: 'bg-gradient-to-r from-red-500 to-red-400' };
};

const Dots = ({ items, tone, colorClass }) =>
  items.length > 0 ? (
    <ul className="space-y-2.5">
      {items.map((s, i) => (
        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
          <span className={`mt-2 w-1.5 h-1.5 rounded-full ${colorClass} flex-shrink-0`} aria-hidden="true" />
          <span className="text-ink-muted">{s}</span>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-xs text-ink-faint">none</p>
  );

const Bar = ({ value, color }) => (
  <div className="h-2.5 track">
    <div className={`h-full rounded-full ${color.bar} transition-all duration-700`} style={{ width: `${value ?? 0}%` }} />
  </div>
);

const field = (label, value) =>
  value ? (
    <div className="p-4 rounded-btn bg-surface shadow-inset-sm">
      <p className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="text-sm text-ink font-medium break-all mt-0.5">{value}</p>
    </div>
  ) : null;

const ResumeReport = ({ resume }) => {
  if (!resume) return null;

  const meta = scoreColor(resume.atsScore);
  const breakdown = resume.scoreBreakdown || {};
  const extracted = resume.extracted || {};
  const jd = resume.jdAnalysis || {};
  const sections = resume.sectionAnalysis || [];

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-7">
        <div className="flex items-start justify-between mb-5">
          <div className="min-w-0">
            <SectionHeader
              icon={(
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              title="ats score"
            />
            <p className="text-xs text-ink-faint truncate mt-1">{resume.filename}</p>
          </div>
          <Chip tone={resume.atsScore >= 80 ? 'ok' : resume.atsScore >= 60 ? 'warn' : 'err'}>
            {resume.atsScore >= 80 ? 'strong' : resume.atsScore >= 60 ? 'decent' : 'needs work'}
          </Chip>
        </div>

        <div className="flex items-center gap-6">
          <span className="dial w-32 h-32 flex-shrink-0">
            <span className="w-32 h-32 rounded-full flex items-center justify-center">
              <span className="w-28 h-28 rounded-full bg-surface shadow-inset-deep flex items-center justify-center">
                <span className="text-center">
                  <span className="font-display font-extrabold text-ink text-5xl leading-none block">{resume.atsScore}</span>
                  <span className="text-[11px] text-ink-faint font-medium">/ 100</span>
                </span>
              </span>
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <Bar value={resume.atsScore} color={meta} />
            <div className="flex flex-wrap gap-2 mt-4">
              <Chip tone="accent">role: {resume.targetRole || resume.roleLabel || 'general'}</Chip>
              {jd.hasJd ? (
                <Chip>matched vs {jd.jdKeywordCount} job-description keywords</Chip>
              ) : resume.targetRole ? (
                <Chip>scored against {resume.targetRole} core skills</Chip>
              ) : (
                <Chip>no job description / target role</Chip>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'keyword match', value: jd.keywordMatchPct != null ? `${jd.keywordMatchPct}%` : '—', sub: jd.hasJd ? 'of JD keywords present' : 'no JD provided' },
          { label: 'skills match', value: jd.skillsMatchPct != null ? `${jd.skillsMatchPct}%` : '—', sub: 'relevance-weighted' },
          { label: 'text parsing', value: resume.parseScore != null ? `${resume.parseScore}%` : '—', sub: 'extraction quality' }
        ].map((s, i) => (
          <Card key={i} className="p-5">
            <p className="text-xs text-ink-faint">{s.label}</p>
            <p className="font-display font-bold text-ink text-2xl mt-1 tracking-tight">{s.value}</p>
            <p className="text-[11px] text-ink-faint mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 sm:p-7">
        <SectionHeader
          icon={(
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
          title="score breakdown"
          hint="weighted algorithm — ai never sets the score"
        />
        <div className="space-y-4 mt-5">
          {CATEGORIES.map((c) => {
            const value = breakdown[c.key];
            const col = scoreColor(value);
            return (
              <div key={c.key}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-ink font-medium">{c.label}</span>
                  <span className="text-ink-faint">
                    <span className={`font-bold ${col.text}`}>{value ?? '-'}</span> · {c.weight}
                  </span>
                </div>
                <div className="h-1.5 track">
                  <div className={`h-full rounded-full ${col.bar} transition-all duration-500`} style={{ width: `${value ?? 0}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {(extracted.name || extracted.email || extracted.phone || (extracted.links || []).length > 0) && (
        <Card className="p-6 sm:p-7">
          <SectionHeader
            icon={(
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            title="extracted profile"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 mb-4">
            {field('name', extracted.name)}
            {field('email', extracted.email)}
            {field('phone', extracted.phone)}
            {(extracted.links || []).length > 0 && (
              <div className="p-4 rounded-btn bg-surface shadow-inset-sm">
                <p className="text-[11px] uppercase tracking-wide text-ink-faint mb-2">links</p>
                <div className="flex flex-wrap gap-2">
                  {(extracted.links || []).map((l, i) => (
                    <a key={i} href={l.url} target="_blank" rel="noreferrer" className="tag text-accent focus-ring">{l.label}</a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(extracted.skills || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {extracted.skills.slice(0, 30).map((s, i) => <Chip key={i}>{s}</Chip>)}
            </div>
          )}
        </Card>
      )}

      {jd.hasJd && (
        <Card className="p-6 sm:p-7">
          <SectionHeader
            icon={(
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )}
            title="job description match"
          />
          <p className="text-xs text-ink-faint mt-3 mb-4">
            keyword match <span className="text-ink font-bold">{jd.keywordMatchPct}%</span> · skills match{' '}
            <span className="text-ink font-bold">{jd.skillsMatchPct}%</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 rounded-btn bg-surface shadow-inset-sm">
              <p className="text-xs font-semibold text-teal-700 mb-3">matched ({jd.matchedJdKeywords?.length ?? 0})</p>
              {(jd.matchedJdKeywords || []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {jd.matchedJdKeywords.map((s, i) => <Chip key={i} tone="ok">{s}</Chip>)}
                </div>
              ) : <p className="text-xs text-ink-faint">no JD keywords found on your resume</p>}
            </div>
            <div className="p-4 rounded-btn bg-surface shadow-inset-sm">
              <p className="text-xs font-semibold text-red-600 mb-3">missing keywords — add these</p>
              {(jd.missingKeywords || []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {jd.missingKeywords.map((s, i) => <Chip key={i} tone="err">{s}</Chip>)}
                </div>
              ) : <p className="text-xs text-ink-faint">none — full coverage</p>}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 sm:p-7">
          <SectionHeader
            icon={(
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            title="strengths"
            hint={resume.strengths?.length || ''}
          />
          <div className="mt-5">
            <Dots items={resume.strengths || []} colorClass="bg-teal-500" />
          </div>
        </Card>

        <Card className="p-6 sm:p-7">
          <SectionHeader
            icon={(
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            title="weaknesses"
            hint={resume.weaknesses?.length || ''}
          />
          <div className="mt-5">
            <Dots items={resume.weaknesses || []} colorClass="bg-red-500" />
          </div>
        </Card>
      </div>

      {(resume.formattingIssues || []).length > 0 && (
        <Card className="p-6 sm:p-7">
          <SectionHeader
            icon={(
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            title="formatting issues"
          />
          <div className="mt-5">
            <Dots items={resume.formattingIssues} colorClass="bg-amber-500" />
          </div>
        </Card>
      )}

      <Card className="p-6 sm:p-7">
        <SectionHeader
          icon={(
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
          title="section-wise analysis"
        />
        <div className="space-y-3 mt-5">
          {sections.map((s) => {
            const col = scoreColor(s.score);
            return (
              <div key={s.key} className="p-4 rounded-btn bg-surface shadow-inset-sm">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <IconWell size="sm" className={`w-7 h-7 rounded-full ${s.present ? 'text-teal-600' : 'text-red-500'}`}>
                      {s.present ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                    </IconWell>
                    <p className="font-medium text-ink text-sm">{s.label}</p>
                    {s.wordCount > 0 && <span className="text-[11px] text-ink-faint">{s.wordCount} words</span>}
                  </div>
                  <span className={`text-xs font-bold ${col.text}`}>{s.score ?? 0}</span>
                </div>
                {s.feedback && <p className="text-xs text-ink-faint ml-10">{s.feedback}</p>}
              </div>
            );
          })}
        </div>
      </Card>

      {resume.summary && (
        <Card className="p-6 sm:p-7">
          <SectionHeader
            icon={(
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            )}
            title="ai summary"
            hint="ai ensemble"
          />
          <p className="text-sm text-ink-muted leading-relaxed mt-5">{resume.summary}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(resume.grammarSuggestions || []).length > 0 && (
          <Card className="p-6 sm:p-7">
            <SectionHeader title="grammar & clarity" />
            <div className="mt-5">
              <Dots items={resume.grammarSuggestions} colorClass="bg-accent" />
            </div>
          </Card>
        )}
        {(resume.achievementSuggestions || []).length > 0 && (
          <Card className="p-6 sm:p-7">
            <SectionHeader title="achievements to add" />
            <div className="mt-5">
              <Dots items={resume.achievementSuggestions} colorClass="bg-accent" />
            </div>
          </Card>
        )}
        {(resume.projectSuggestions || []).length > 0 && (
          <Card className="p-6 sm:p-7">
            <SectionHeader title="project suggestions" />
            <div className="mt-5">
              <Dots items={resume.projectSuggestions} colorClass="bg-accent" />
            </div>
          </Card>
        )}
      </div>

      {(resume.suggestions || []).length > 0 && (
        <Card className="p-6 sm:p-7">
          <SectionHeader title="improvement suggestions" hint="prioritized" />
          <ul className="space-y-3 mt-5">
            {resume.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                <span className="w-7 h-7 rounded-full bg-surface shadow-inset-deep text-accent flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="text-ink-muted">{s}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {resume.finalReview && (
        <Card className="p-6 sm:p-7 shadow-extruded-hover">
          <SectionHeader
            icon={(
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            )}
            title="final ai review"
          />
          <p className="text-sm text-ink leading-relaxed mt-5">{resume.finalReview}</p>
        </Card>
      )}
    </div>
  );
};

export default ResumeReport;
