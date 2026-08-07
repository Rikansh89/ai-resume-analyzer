import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../services/api';
import Card from '../components/ui/Card';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [issuedCode, setIssuedCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const navigate = useNavigate();

  const requestCode = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setIssuedCode(res.data.reset_code);
      setNotice(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'could not send reset code');
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (newPassword !== confirm) {
      setError('passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email, code, newPassword });
      setResetDone(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
      <div className="w-full max-w-sm rise">
        <div className="text-center mb-8">
          <span className="dial inline-flex w-16 h-16 items-center justify-center mb-5">
            <span className="w-12 h-12 rounded-btn bg-brand-gradient flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </span>
          </span>
          <h1 className="font-display font-bold text-ink text-2xl tracking-tight">reset your password</h1>
          <p className="text-sm text-ink-muted mt-1.5">we&apos;ll send you a one-time code</p>
        </div>

        <Card className="p-8">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-btn text-red-600 text-xs text-center bg-surface shadow-inset-sm" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="mb-5 px-4 py-3 rounded-btn text-teal-700 text-xs text-center bg-surface shadow-inset-sm" role="status">
              {notice}
            </div>
          )}

          {resetDone ? (
            <div className="text-center">
              <p className="text-sm text-ink-muted mb-6">password updated. you&apos;re all set to sign in.</p>
              <Button onClick={() => navigate('/login')} className="w-full">go to sign in</Button>
            </div>
          ) : issuedCode ? (
            <form onSubmit={submitReset} className="space-y-5">
              <div className="px-4 py-4 rounded-btn bg-surface shadow-inset-sm text-center">
                <p className="text-xs text-ink-faint mb-2">your one-time reset code</p>
                <p className="font-mono text-2xl font-bold tracking-[0.3em] text-accent">{issuedCode}</p>
                <p className="text-[10px] text-ink-faint mt-2">valid for 30 minutes</p>
              </div>

              <Field label="reset code" type="text" inputMode="numeric" name="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" required autoComplete="one-time-code" />
              <Field label="new password" type="password" name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="make it a good one" required autoComplete="new-password" />
              <Field label="confirm password" type="password" name="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="repeat it" required autoComplete="new-password" />
              <Button type="submit" loading={loading} className="w-full">
                {loading ? 'resetting...' : 'set new password'}
              </Button>
            </form>
          ) : (
            <form onSubmit={requestCode} className="space-y-5">
              <Field label="email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required autoComplete="email" />
              <Button type="submit" loading={loading} className="w-full">
                {loading ? 'sending...' : 'send reset code'}
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-ink-faint mt-6">
            remember it now?{' '}
            <Link to="/login" className="text-accent font-medium hover:text-accent-dark transition-colors">sign in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
