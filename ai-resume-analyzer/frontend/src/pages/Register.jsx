import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'something went wrong');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </span>
          </span>
          <h1 className="font-display font-bold text-ink text-2xl tracking-tight">join the club</h1>
          <p className="text-sm text-ink-muted mt-1.5">start optimizing your resumes</p>
        </div>

        <Card className="p-8">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-btn text-red-600 text-xs text-center bg-surface shadow-inset-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="full name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" required autoComplete="name" />
            <Field label="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@email.com" required autoComplete="email" />
            <Field label="password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="make it a good one" required autoComplete="new-password" />
            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'creating...' : 'create account'}
            </Button>
          </form>

          <p className="text-center text-xs text-ink-faint mt-6">
            already have an account?{' '}
            <Link to="/login" className="text-accent font-medium hover:text-accent-dark transition-colors">sign in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Register;
