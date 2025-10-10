import 'dotenv/config';
import express from "express";
import cors from "cors";
import { registerRoutes } from "../routes";

const app = express();

// CORS configuration - permite requests desde el frontend
const allowedOrigins = [
  process.env.VITE_APP_URL,
  'http://localhost:5173',
  'http://localhost:5000',
  'https://credito-express-phi.vercel.app/', 
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes
(async () => {
  await registerRoutes(app);
})();

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export default app;
