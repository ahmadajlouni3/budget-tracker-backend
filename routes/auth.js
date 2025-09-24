import express from 'express';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

// Register (PostgreSQL)
router.post('/register', async (request, response) => {
  const { name, email, password } = request.body;

  try {
    // Check if email already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return response.status(400).json({ error: 'Email already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    // PostgreSQL supports returning()
    const [user] = await db("users")
      .insert({ name, email, password_hash: hashed })
      .returning(['id', 'email', 'name']); // instantly returns the inserted row

    response.json(user);
  } catch (error) {
    response.status(400).json({ error: "Registration failed." });
  }
});

// Login 
router.post('/login', async (request, response) => {
  const { email, password } = request.body;

  try {
    const user = await db("users").where({ email }).first();

    let match = false;
    if (user) {
      match = await bcrypt.compare(password, user.password_hash);
    }

    if (!user || !match) {
      return response.status(400).json({ error: "Wrong username or password." });
    }

    const token = jsonwebtoken.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    response.json({ token });
  } catch (error) {
    response.status(400).json({ error: "Login failed." });
  }
});

export default router;
