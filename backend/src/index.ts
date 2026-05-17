import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import generationRoutes from './routes/generation';
import avatarRoutes from './routes/avatar';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/generation', generationRoutes);
app.use('/api/avatar', avatarRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Paquita API running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Error:', err);
});

export default app;