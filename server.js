import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import authRoutes from './routes/auth.js'
import transactionsRoutes from './routes/transactions.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes);
app.use('/transactions', transactionsRoutes);

const PORT = process.env.PORT | 5000;
app.listen(PORT, () => console.log(`the server running on port ${PORT}`))