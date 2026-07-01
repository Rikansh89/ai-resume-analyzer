import React, { useState, useEffect, useCallback } from 'react';
import { uploadResume, getResumes, deleteResume } from '../services/api';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedResume, setSelectedResume] = useState(null);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await getResumes();
      setResumes(res.data);
    } catch {
      setError('could not load resumes');
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
    try {
      await uploadResume(formData);
      await fetchResumes();
    } catch (err) {
      setError(err.response?.data?.error || 'upload failed');
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
      if (selectedResume?.id === id) setSelectedResume(null);
      await fetchResumes();
    } catch {
      setError('delete failed');
    }
  };

  const scoreMeta = (score) => {
    if (score >= 80) return { label: 'strong', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' };
    if (score >= 60) return { label: 'decent', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', bar: 'bg-amber-400' };
    return { label: 'needs work', color: 'text-red-700', bg: 'bg-red-50 border-red-200', bar: 'bg-red-400' };
  };

  const latest = selectedResume || resumes[0] || null;

  const avg = resumes.length > 0
    ? Math.round(resumes.reduce((s, r) => s + (r.ats_score || 0), 0) / resumes.length)
    : 0;

  return (
    <div className="min-h-screen bg-stone-50 pt-14 pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* top bar */}
        <div className="flex items-center justify-between pt-6 pb-4">
          <div>
            <h1 className="text-xl font-display font-bold text-gray-800">dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">your resume analysis history</p>
          </div>
          <label className="btn-primary text-sm cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            upload
            <input type="file" accept="application/pdf" onChange={handleFileChange} disabled={uploading} className="hidden" />
          </label>
        </div>

        {/* mini stats */}
        {resumes.length > 0 && (
          <div className="flex gap-4 mb-6 text-sm">
            <div className="card px-4 py-2.5">
              <span className="text-gray-400 text-xs">total</span>
              <p className="font-semibold text-gray-800">{resumes.length}</p>
            </div>
            <div className="card px-4 py-2.5">
              <span className="text-gray-400 text-xs">average</span>
              <p className="font-semibold text-gray-800">{avg}</p>
            </div>
            <div className="card px-4 py-2.5">
              <span className="text-gray-400 text-xs">best</span>
              <p className="font-semibold text-gray-800">{resumes.length > 0 ? Math.max(...resumes.map(r => r.ats_score || 0)) : 0}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs">{error}</div>
        )}

        {uploading && (
          <div className="card p-4 mb-6 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-brand-300 border-t-brand-600 animate-spin" />
            <div className="flex-1">
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-brand-500 rounded-full animate-pulse" />
              </div>
            </div>
            <span className="text-xs text-gray-400">analyzing...</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* sidebar */}
          <div className="lg:col-span-1">
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100">
                <h2 className="text-sm font-semibold text-gray-700">history</h2>
              </div>
              {resumes.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-gray-400">no resumes yet</p>
                  <p className="text-xs text-gray-300 mt-1">upload one to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-50 max-h-[420px] overflow-y-auto">
                  {resumes.map((r, i) => {
                    const meta = scoreMeta(r.ats_score);
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedResume(r)}
                        className={`px-4 py-3 cursor-pointer transition-colors ${
                          selectedResume?.id === r.id ? 'bg-brand-50 border-l-2 border-brand-500' : 'hover:bg-stone-50 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                            <span className={`text-xs font-bold ${meta.color}`}>{r.ats_score}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{r.filename}</p>
                            <p className="text-xs text-gray-400">{new Date(r.upload_date).toLocaleDateString()}</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                            className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* main */}
          <div className="lg:col-span-2 space-y-4">
            {latest ? (
              <>
                {/* score */}
                <div className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700">ats score</h3>
                      <p className="text-xs text-gray-400">{latest.filename}</p>
                    </div>
                    <span className={`tag ${scoreMeta(latest.ats_score).bg} ${scoreMeta(latest.ats_score).color}`}>
                      {scoreMeta(latest.ats_score).label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-display font-bold text-gray-800">{latest.ats_score}</span>
                    <span className="text-sm text-gray-300">/ 100</span>
                  </div>
                  <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${scoreMeta(latest.ats_score).bar}`}
                      style={{ width: `${latest.ats_score}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {latest.ats_score >= 80
                      ? 'looking good — your resume is ATS-friendly'
                      : latest.ats_score >= 60
                      ? 'not bad — a few tweaks could help'
                      : 'could use some work — check the suggestions below'}
                  </p>
                </div>

                {/* missing skills */}
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">&#128200;</span>
                    <h3 className="text-sm font-semibold text-gray-700">missing skills</h3>
                  </div>
                  {latest.missing_skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {latest.missing_skills.map((skill, i) => (
                        <span key={i} className="tag bg-red-50 text-red-700 border border-red-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">none — you've covered the bases</p>
                  )}
                </div>

                {/* suggestions */}
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">&#128161;</span>
                    <h3 className="text-sm font-semibold text-gray-700">suggestions</h3>
                  </div>
                  {latest.suggestions?.length > 0 ? (
                    <ul className="space-y-2">
                      {latest.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-brand-500 mt-0.5 flex-shrink-0">&#8594;</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400">no suggestions — you're all set</p>
                  )}
                </div>
              </>
            ) : (
              <div className="card p-10 flex flex-col items-center justify-center text-center">
                <span className="text-3xl mb-3">&#128196;</span>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">no resume selected</h3>
                <p className="text-xs text-gray-400 max-w-xs">upload a pdf and see what the ai thinks about it</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
