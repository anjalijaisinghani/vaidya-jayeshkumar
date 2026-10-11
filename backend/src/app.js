import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import healthRoutes from './routes/health.js';
import publicRoutes from './routes/public.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1', publicRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;