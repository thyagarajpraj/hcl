import { z } from "zod";
import createHttpError from "../utils/createHttpError.js";

export const createEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email format"),
  department: z.string().min(1, "Department is required").max(100),
});

export const submitFeedbackSchema = z.object({
  givenBy: z.string().min(1, "givenBy is required"),
  givenTo: z.string().min(1, "givenTo is required"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(5000),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export function validateRequest(schema) {
  console.log("Creating validation middleware for schema:", schema);
  return (request, response, next) => {
    try {
      const validated = schema.parse(request.body);
      request.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("; ");
        throw createHttpError(400, messages);
      }
      next(error);
    }
  };
}
