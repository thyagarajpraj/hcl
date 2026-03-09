import express from "express";
import {
  getDashboardStats,
  getAllEmployees,
  updateEmployeeRole,
  deleteEmployee,
  getEmployeeFeedbackStats,
  getDepartmentAnalytics
} from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get("/stats", getDashboardStats);

/**
 * @swagger
 * /api/admin/employees:
 *   get:
 *     summary: Get all employees with filtering
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of employees
 */
router.get("/employees", getAllEmployees);

/**
 * @swagger
 * /api/admin/employees/{employeeId}/role:
 *   patch:
 *     summary: Update employee role
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [employee, manager, admin]
 *     responses:
 *       200:
 *         description: Employee role updated
 */
router.patch("/employees/:employeeId/role", updateEmployeeRole);

/**
 * @swagger
 * /api/admin/employees/{employeeId}:
 *   delete:
 *     summary: Delete an employee (soft delete)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee deleted
 */
router.delete("/employees/:employeeId", deleteEmployee);

/**
 * @swagger
 * /api/admin/employees/{employeeId}/feedback-stats:
 *   get:
 *     summary: Get feedback statistics for an employee
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feedback statistics
 */
router.get("/employees/:employeeId/feedback-stats", getEmployeeFeedbackStats);

/**
 * @swagger
 * /api/admin/departments:
 *   get:
 *     summary: Get departmental analytics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Department analytics
 */
router.get("/departments", getDepartmentAnalytics);

export default router;
