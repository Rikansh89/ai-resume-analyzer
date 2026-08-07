const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_EXPIRY = '7d';

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
