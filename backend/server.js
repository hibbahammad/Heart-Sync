import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import campRoutes from "./routes/campRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (from CWD or adjacent .env file)
dotenv.config();
dotenv.config({ path: path.join(__dirname, ".env") });

// Guard: JWT_SECRET must be explicitly set in environment
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "hiba_secret_key") {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: JWT_SECRET is not set or uses the insecure default. Refusing to start in production.");
    process.exit(1);
  } else {
    console.warn("WARNING: JWT_SECRET is using the insecure default value. Set a strong secret in your .env file.");
  }
}

connectDB();

const app = express();

// Disable X-Powered-By header for fingerprinting reduction
app.disable("x-powered-by");

const isProduction = process.env.NODE_ENV === "production";

// Enable reverse proxy trust in production (e.g. Render, Railway, Vercel, AWS, Nginx)
if (isProduction) {
  app.set("trust proxy", 1);
}

// ─── Security Middleware ───────────────────────────────────────────────────────

// HTTP security headers via Helmet
app.use(helmet());

// CORS configuration — strict production validation with development fallback
const devDefaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const configuredOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
      .map((o) => o.trim().replace(/\/$/, ""))
      .filter(Boolean)
  : [];

const allowedOrigins = isProduction
  ? configuredOrigins
  : Array.from(new Set([...configuredOrigins, ...devDefaultOrigins]));

if (isProduction && allowedOrigins.length === 0) {
  console.warn(
    "⚠️ SECURITY WARNING: FRONTEND_URL is not configured in production. Browser cross-origin requests will be rejected by CORS policy."
  );
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, curl, Postman, health checks) where Origin is undefined
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.trim().replace(/\/$/, "");
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS Error: Origin '${origin}' is not permitted by Access-Control-Allow-Origin policy.`)
    );
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Rate limiter for auth endpoints — max 20 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Please try again in 15 minutes." },
});

// General API rate limiter — max 200 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
});

// Request body size limits to prevent Denial-of-Service (DoS) memory exhaustion
app.use(express.json({ limit: "15kb" }));
app.use(express.urlencoded({ extended: true, limit: "15kb" }));

// Apply general rate limiter to all API routes
app.use("/api", generalLimiter);

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Heart Sync Enterprise Blood Bank & Hospital Coordination Platform",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (req, res) => {
  res.send("Heart Sync Enterprise API Running ✅");
});

// Primary Routes — authLimiter applied to login/register
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/camps", campRoutes);
app.use("/api/admin", adminRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  // Catch CORS policy rejection errors
  if (err.message && err.message.startsWith("CORS Error")) {
    return res.status(403).json({
      success: false,
      message: "Access forbidden: Origin not permitted by CORS policy.",
    });
  }

  // Catch body parser payload size errors
  if (err.type === "entity.too.large" || err.status === 413) {
    return res.status(413).json({
      success: false,
      message: "Payload too large: Request body exceeds maximum allowed size (15kb).",
    });
  }

  console.error("Server Error:", err.stack || err);

  const statusCode = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";

  // Prevent internal database, schema, or system stack details from leaking in production
  const safeMessage =
    statusCode >= 500 && isProd
      ? "Internal Healthcare Platform Server Error"
      : err.message || "Internal Healthcare Platform Server Error";

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Heart Sync Healthcare Server running on port ${PORT}`);
});