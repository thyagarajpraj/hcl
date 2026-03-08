import jwt from "jsonwebtoken";
import createHttpError from "../utils/createHttpError.js";

export function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET || "default-secret";
    return jwt.verify(token, secret);
  } catch {
    throw createHttpError(401, "Invalid or expired token");
  }
}

export function generateToken(payload) {
  const secret = process.env.JWT_SECRET || "default-secret";
  const expiry = process.env.JWT_EXPIRY || "7d";
  return jwt.sign(payload, secret, { expiresIn: expiry });
}

export function authMiddleware(request, response, next) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createHttpError(401, "Missing or invalid authorization header");
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    request.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
}
