import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
      setError(err.response?.data?.error || 'something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 pt-14">
      <div className="w-full max-w-sm rise">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold text-gray-800">join the club</h1>
          <p className="text-sm text-gray-400 mt-1">start optimizing your resumes</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">full name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" className="input" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@email.com" className="input" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="make it a good one" className="input" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'creating...' : 'create account'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
