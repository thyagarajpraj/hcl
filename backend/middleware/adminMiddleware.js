import createHttpError from "../utils/createHttpError.js";

export function adminMiddleware(req, res, next) {
  if (!req.user) {
    throw createHttpError(401, "Unauthorized");
  }

  if (req.user.role !== "admin") {
    throw createHttpError(403, "Admin access required");
  }

  next();
}
