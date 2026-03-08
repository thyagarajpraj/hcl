import Employee from "../models/Employee.js";
import createHttpError from "../utils/createHttpError.js";
import { generateToken } from "../middleware/authMiddleware.js";

export async function login(request, response, next) {
  try {
    const { email } = request.body;

    if (!email) {
      throw createHttpError(400, "Email is required");
    }

    const employee = await Employee.findOne({ email });

    if (!employee) {
      throw createHttpError(404, "Employee not found");
    }

    const token = generateToken({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
    });

    response.json({
      token,
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(_request, response) {
  response.json({ message: "Logged out successfully" });
}

export async function verifyAuth(request, response) {
  response.json({
    employee: request.user,
  });
}
