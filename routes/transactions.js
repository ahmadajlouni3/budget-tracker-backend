import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jsonwebtoken.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Show all transactions
router.get('/', authenticateToken, async (req, res) => {
  const transactions = await db('transactions')
    .where({ user_id: req.user.id })
    .orderBy('date', 'desc');
  res.json(transactions);
});

// Create new transaction
router.post('/', authenticateToken, async (req, res) => {
  const { type, amount, category, date, note } = req.body;
  const [transaction] = await db('transactions')
    .insert({
      user_id: req.user.id,
      type,
      amount,
      category,
      date: date || new Date(),
      note,
    })
    .returning('*');
  res.json(transaction);
});

// Update transaction
router.put('/:id', authenticateToken, async (req, res) => {
  const { type, amount, category, date, note } = req.body;
  const [transaction] = await db('transactions')
    .where({ transaction_id: req.params.id, user_id: req.user.id })
    .update({ type, amount, category, date, note })
    .returning('*');
  if (!transaction) return res.status(404).json({ message: 'Not found' });
  res.json(transaction);
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req, res) => {
  const deleted = await db('transactions')
    .where({ transaction_id: req.params.id, user_id: req.user.id })
    .del();
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Transaction deleted.' });
});

export default router;
