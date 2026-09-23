import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './auth/auth.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const host = process.env.HOST ?? 'localhost';
const port = Number(process.env.PORT) || (
  process.env.NODE_ENV === 'production' ? 8000 : 3000
);
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);

app.get('/health', (_, res) => {
  res.json({ ok: true });
});

app.use(errorMiddleware);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
