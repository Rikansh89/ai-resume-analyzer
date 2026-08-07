import React, { useState, useEffect, useCallback } from 'react';
import { uploadResume, getResumes, deleteResume } from '../services/api';
import ResumeReport from '../components/ResumeReport';
import Card from '../components/ui/Card';
import Field from '../components/ui/Field';
import IconWell from '../components/ui/IconWell';
import SectionHeader from '../components/ui/SectionHeader';

const ROLE_OPTIONS = [
  { value: '', label: 'auto-detect role' },
  { value: 'software', label: 'Software Engineer' },
  { value: 'fullstack', label: 'Full-Stack Engineer' },
  { value: 'frontend', label: 'Frontend Engineer' },
  { value: 'backend', label: 'Backend Engineer' },
  { value: 'aiml', label: 'AI / ML Engineer' },
  { value: 'data', label: 'Data Scientist / Analyst' },
  { value: 'devops', label: 'DevOps / Cloud' },
  { value: 'product', label: 'Product Manager' },
  { value: 'design', label: 'Product / UX Designer' },
  { value: 'qa', label: 'QA / Testing Engineer' },
  { value: 'marketing', label: 'Marketing' }
];

const scoreMeta = (score) => {
  if (score >= 80) return { text: 'text-teal-700', dial: 'shadow-inset' };
  if (score >= 60) return { text: 'text-amber-600', dial: 'shadow-inset' };
  return { text: 'text-red-600', dial: 'shadow-inset' };
};

const UploadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');

  const fetchResumes = useCallback(async () => {
    try {
      const res = await getResumes();
      setResumes(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'could not load resumes');
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('resume', file);
    if (jobDescription.trim()) formData.append('job_description', jobDescription.trim());
    if (targetRole) formData.append('target_role', targetRole);
    try {
      const res = await uploadResume(formData);
      await fetchResumes();
      setSelectedId(res.data.resume?.id ?? null);
      setJobDescription('');
      setTargetRole('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    handleUpload(e.target.files[0]);
    e.target.value = '';
  };

  const handleDelete = async (id) => {
    try {
      await deleteResume(id);
      if (selectedId === id) setSelectedId(null);
      await fetchResumes();
    } catch {
      setError('delete failed');
    }
  };

  const latest = resumes.find((r) => r.id === selectedId) || resumes[0] || null;

  const avg = resumes.length > 0
    ? Math.round(resumes.reduce((s, r) => s + (r.atsScore || 0), 0) / resumes.length)
    : 0;
  const best = resumes.length > 0 ? Math.max(...resumes.map((r) => r.atsScore || 0)) : 0;

  const stats = [
    { label: 'total resumes', value: resumes.length, icon: <UploadIcon /> },
    { label: 'average score', value: avg, icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9 9 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
    ) },
    { label: 'best score', value: best, icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    ) }
  ];

  return (
    <div className="relative min-h-screen pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-6 pb-6">
          <h1 className="font-display font-bold text-ink text-2xl tracking-tight">dashboard</h1>
          <p className="text-xs text-ink-faint mt-1">upload a resume for a full ats audit</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="mb-5">
            <SectionHeader
              icon={<UploadIcon />}
              title="new analysis"
            />
            <span className="inline-flex mt-3 px-3 py-1 rounded-full text-[11px] font-semibold text-ink-muted bg-surface shadow-inset-sm">pdf required</span>
          </div>

          <Field
            as="textarea"
            label="job description"
            hint="optional — enables keyword & skills match %"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={uploading}
            placeholder="Paste the job posting here for a relevance-matched audit..."
            rows={3}
            className="resize-none mb-5"
          />

          <Field
            as="select"
            label="target role"
            hint="optional — score fit for a specific role, e.g. AI/ML Engineer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            disabled={uploading}
            className="mb-6"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </Field>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-ink-faint">score comes from a weighted algorithm — ai provides the review, not the number</p>
            <label className="btn btn-primary focus-ring cursor-pointer">
              <FileIcon />
              {uploading ? 'analyzing...' : 'upload resume'}
              <input type="file" accept="application/pdf" onChange={handleFileChange} disabled={uploading} className="hidden" />
            </label>
          </div>
        </Card>

        {resumes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {stats.map((s, i) => (
              <Card key={i} className={`p-5 flex items-center gap-4 rise d-${i + 1}`}>
                <IconWell size="md">{s.icon}</IconWell>
                <div>
                  <p className="text-xs text-ink-faint">{s.label}</p>
                  <p className="font-display font-bold text-ink text-xl leading-tight">{s.value}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-6 px-4 py-3 rounded-btn text-red-600 text-xs bg-surface shadow-inset-sm" role="alert">
            {error}
          </div>
        )}

        {uploading && (
          <Card className="p-5 mb-6 flex items-center gap-4">
            <span className="w-6 h-6 rounded-full border-2 border-accent/40 border-t-accent animate-spin flex-shrink-0" />
            <div className="flex-1">
              <div className="h-2.5 track">
                <div className="h-full w-3/4 bg-brand-gradient rounded-full animate-pulse" />
              </div>
            </div>
            <span className="text-xs text-ink-faint">parsing, scoring & ai review...</span>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <h2 className="font-display font-semibold text-ink text-sm tracking-tight">history</h2>
                {resumes.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-ink-muted bg-surface shadow-inset-sm">{resumes.length}</span>
                )}
              </div>
              {resumes.length === 0 ? (
                <div className="p-8 text-center">
                  <IconWell size="lg" className="mx-auto mb-4">
                    <UploadIcon />
                  </IconWell>
                  <p className="text-sm text-ink font-medium">no resumes yet</p>
                  <p className="text-xs text-ink-faint mt-1">upload one to get a full audit</p>
                </div>
              ) : (
                <div className="px-3 pb-3 space-y-2 max-h-[540px] overflow-y-auto">
                  {resumes.map((r) => {
                    const meta = scoreMeta(r.atsScore);
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedId(r.id)}
                        className={`px-3 py-3 rounded-btn cursor-pointer flex items-center gap-3 transition-all duration-300 ${
                          latest?.id === r.id
                            ? 'bg-surface shadow-inset-sm'
                            : 'shadow-extruded-sm hover:shadow-extruded hover:-translate-y-px'
                        }`}
                      >
                        <span className={`w-11 h-11 rounded-full bg-surface ${meta.dial} flex items-center justify-center flex-shrink-0`}>
                          <span className={`text-sm font-bold ${meta.text}`}>{r.atsScore}</span>
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{r.filename}</p>
                          <p className="text-xs text-ink-faint">
                            {new Date(r.uploadDate).toLocaleDateString()}
                            {r.targetRole && <span className="ml-1.5 text-accent">· {r.targetRole}</span>}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                          className="w-10 h-10 inline-flex items-center justify-center rounded-btn text-ink-faint hover:text-red-600 focus-ring transition-colors"
                          aria-label={`delete ${r.filename}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-2">
            {latest ? (
              <ResumeReport resume={latest} />
            ) : (
              <Card className="p-12 flex flex-col items-center justify-center text-center">
                <span className="dial inline-flex w-20 h-20 items-center justify-center mb-5">
                  <span className="w-16 h-16 rounded-btn bg-surface shadow-inset-deep flex items-center justify-center">
                    <UploadIcon />
                  </span>
                </span>
                <h3 className="font-display font-semibold text-ink mb-1.5">no resume selected</h3>
                <p className="text-xs text-ink-faint max-w-xs">upload a pdf and get a full ats audit with ai review</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
