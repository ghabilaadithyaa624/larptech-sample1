import "dotenv/config";
import express from "express";
import cors from "cors";
import healthRouter from "./routes/health";
import leadsRouter from "./routes/leads";

const app = express();
const PORT = parseInt(process.env.PORT ?? "4000", 10);

// ---------------------------------------------------------------------------
// CORS — allow the frontend origin (defaults to localhost:3000 in development)
// ---------------------------------------------------------------------------
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// ---------------------------------------------------------------------------
// Body parsing
// ---------------------------------------------------------------------------
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use("/api/health", healthRouter);
app.use("/api/leads", leadsRouter);

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});

export default app;
