const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { db } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_EXPIRY = '7d';
const RESET_CODE_EXPIRY_MIN = 30;
const RESET_CODE_LENGTH = 6;

const hashCode = (code) => crypto.createHash('sha256').update(String(code)).digest('hex');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

const authResponse = (user) => ({
  message: 'success',
  token: signToken(user),
  user: { id: user.id, name: user.name, email: user.email }
});

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    throw new HttpError(400, 'All fields are required.');
  }

  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
    throw new HttpError(400, 'Please provide a valid email address.');
  }

  if (typeof password !== 'string' || password.length < 6) {
    throw new HttpError(400, 'Password must be at least 6 characters long.');
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    throw new HttpError(409, 'Email already registered.');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  let result;
  try {
    result = db.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    ).run(name.trim(), email.toLowerCase(), hashedPassword);
  } catch (error) {
    if (/UNIQUE/i.test(error.message)) {
      throw new HttpError(409, 'Email already registered.');
    }
    throw error;
  }

  const user = { id: result.lastInsertRowid, name: name.trim(), email: email.toLowerCase() };
  res.status(201).json({ message: 'Registration successful.', ...authResponse(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required.');
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  res.json({ message: 'Login successful.', ...authResponse(user) });
});

exports.getProfile = asyncHandler(async (req, res) => {
  const user = db.prepare(
    'SELECT id, name, email, created_at FROM users WHERE id = ?'
  ).get(req.user.id);

  if (!user) {
    throw new HttpError(404, 'User not found.');
  }

  res.json(user);
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body || {};

  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
    throw new HttpError(400, 'Please provide a valid email address.');
  }

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) {
    throw new HttpError(404, 'No account found for this email.');
  }

  const code = String(crypto.randomInt(0, 1000000)).padStart(RESET_CODE_LENGTH, '0');
  const expiresAt = Date.now() + RESET_CODE_EXPIRY_MIN * 60 * 1000;

  db.prepare('DELETE FROM password_resets WHERE email = ?').run(email.toLowerCase());
  db.prepare(
    'INSERT INTO password_resets (email, code_hash, expires_at, created_at) VALUES (?, ?, ?, ?)'
  ).run(email.toLowerCase(), hashCode(code), expiresAt, new Date().toISOString());

  res.json({
    message: 'Reset code generated. Use it to set a new password.',
    reset_code: code,
    expires_in_min: RESET_CODE_EXPIRY_MIN
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body || {};

  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
    throw new HttpError(400, 'Please provide a valid email address.');
  }

  if (typeof code !== 'string' || !new RegExp(`^\\d{${RESET_CODE_LENGTH}}$`).test(code)) {
    throw new HttpError(400, `Please provide the ${RESET_CODE_LENGTH}-digit reset code.`);
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    throw new HttpError(400, 'Password must be at least 6 characters long.');
  }

  const row = db.prepare(
    'SELECT * FROM password_resets WHERE email = ? ORDER BY created_at DESC LIMIT 1'
  ).get(email.toLowerCase());

  if (!row || row.code_hash !== hashCode(code)) {
    throw new HttpError(400, 'Invalid reset code.');
  }

  if (Date.now() > row.expires_at) {
    db.prepare('DELETE FROM password_resets WHERE email = ?').run(email.toLowerCase());
    throw new HttpError(400, 'Reset code has expired. Please request a new one.');
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, email.toLowerCase());
  db.prepare('DELETE FROM password_resets WHERE email = ?').run(email.toLowerCase());

  res.json({ message: 'Password updated successfully. You can now sign in.' });
});
