import Employee from "../models/Employee.js";
import createHttpError from "../utils/createHttpError.js";
import { generateToken } from "../middleware/authMiddleware.js";

export async function login(request, response, next) {
console.log(`Login request received for email: ${request.body.email}`);

  try {
    const { email } = request.body;
    if (!email) {
      throw createHttpError(400, "Email is required");
    }

    const employee = await Employee.findOne({ email });

    console.log(`Login attempt for emaildd: ${email} - ${employee ? "Found" : "Not found"}`);
    if (!employee) {
      throw createHttpError(404, "Employee not found");
    }

    const token = generateToken({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      role: employee.role
    });

    response.json({
      token,
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        role: employee.role
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
