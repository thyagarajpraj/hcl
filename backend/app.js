import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import express from "express";
import swaggerUi from "swagger-ui-express";
import employeeRoutes from "./routes/employeeRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { swaggerSpec } from "./config/swagger.js";
import logger from "./utils/logger.js";

const app = express();

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Logging middleware
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));

// Winston logging for errors
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${req.path} - Status: ${res.statusCode}`);
    }
    return originalJson.call(this, data);
  };
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ message: "Too many requests, please try again later." });
  },
});
app.use("/api/", limiter);

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/feedback", authMiddleware, feedbackRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
