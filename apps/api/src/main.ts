import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./auth/auth.routes.js";

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get('/health', (_, res) => {
  res.json({ ok: true });
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
