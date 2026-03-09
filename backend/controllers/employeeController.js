import Employee from "../models/Employee.js";
import Feedback from "../models/Feedback.js";
import createHttpError from "../utils/createHttpError.js";
import { sanitizeInput } from "../utils/sanitizer.js";

function normalizeEmployee(employee, statsByEmployeeId) {
  const stats = statsByEmployeeId.get(String(employee._id));

  return {
    ...employee,
    avgRating: stats ? Number(stats.avgRating.toFixed(1)) : null,
    feedbackCount: stats?.feedbackCount || 0
  };
}

export async function listEmployees(_request, response, next) {
  try {
    const [employees, feedbackStats] = await Promise.all([
      Employee.find().sort({ name: 1 }).lean(),
      Feedback.aggregate([
        {
          $group: {
            _id: "$givenTo",
            avgRating: {
              $avg: "$rating"
            },
            feedbackCount: {
              $sum: 1
            }
          }
        }
      ])
    ]);

    const statsByEmployeeId = new Map(
      feedbackStats.map((entry) => [String(entry._id), entry])
    );

    response.json({
      employees: employees.map((employee) =>
        normalizeEmployee(employee, statsByEmployeeId)
      )
    });
  } catch (error) {
    next(error);
  }
}


export async function createEmployee(request, response, next) {
  try {
    const { name, email, department } = request.body;
    
    // Sanitize string inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedDepartment = sanitizeInput(department);

    const employee = await Employee.create({
      name: sanitizedName,
      email,
      department: sanitizedDepartment
    });

    response.status(201).json({
      message: "Employee created successfully.",
      employee: {
        ...employee.toObject(),
        avgRating: null,
        feedbackCount: 0
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      next(createHttpError(409, "An employee with this email already exists."));
      return;
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((err) => err.message)
        .join("; ");
      next(createHttpError(400, messages));
      return;
    }

    next(error);
  }
}
