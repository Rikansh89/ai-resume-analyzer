import React from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import IconWell from '../components/ui/IconWell';

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'ats score',
    desc: 'a real score out of 100 based on how well your resume parses',
    tone: 'text-accent',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'skill gaps',
    desc: 'keywords and tools you are missing compared to what\u2019s hot',
    tone: 'text-teal-600',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'actionable tips',
    desc: 'specific edits that actually move the needle',
    tone: 'text-amber-600',
  },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="relative pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        <div className="rise">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-ink-muted bg-surface shadow-inset-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" aria-hidden="true" />
            powered by gemini ai
          </span>

          <h1 className="font-display font-extrabold text-ink tracking-tight text-4xl sm:text-6xl leading-[1.1] mb-6">
            see how your resume
            <br />
            <span className="text-gradient animate-shimmer bg-[size:200%_auto]">really stacks up</span>
          </h1>

          <p className="font-display text-lg text-ink-muted max-w-xl mx-auto mb-10 leading-relaxed">
            upload your resume and get a no-fluff breakdown of what's working,
            what's missing, and how to fix it — in seconds.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            {user ? (
              <Button to="/dashboard" className="px-8 py-3">
                go to dashboard
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            ) : (
              <>
                <Button to="/register" className="px-8 py-3">try it free</Button>
                <Button to="/login" variant="secondary" className="px-8 py-3">sign in</Button>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-ink-faint">
            <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            free to start · no credit card required
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 text-left">
          {FEATURES.map((f, i) => (
            <Card key={i} hover className={`p-7 rise d-${i + 1}`}>
              <IconWell tone={f.tone} className="mb-5 w-12 h-12">
                {f.icon}
              </IconWell>
              <h3 className="font-display font-bold text-ink tracking-tight mb-1.5">{f.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
