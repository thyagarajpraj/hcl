import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import Feedback from "../models/Feedback.js";
import createHttpError from "../utils/createHttpError.js";

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

// Get dashboard statistics
export async function getDashboardStats(req, res, next) {
  try {
    const [
      totalEmployees,
      totalFeedback,
      avgRating,
      feedbackByDept,
      recentFeedback
    ] = await Promise.all([
      Employee.countDocuments({ isDeleted: false }),
      Feedback.countDocuments({ isDeleted: false }),
      Feedback.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
      ]),
      Employee.aggregate([
        { $match: { isDeleted: false } },
        {
          $lookup: {
            from: "feedbacks",
            let: { empId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$givenTo", "$$empId"] },
                  isDeleted: false
                }
              },
              { $group: { _id: null, avgRating: { $avg: "$rating" } } }
            ],
            as: "ratings"
          }
        },
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
            avgRating: {
              $avg: {
                $ifNull: [{ $arrayElemAt: ["$ratings.avgRating", 0] }, 0]
              }
            }
          }
        }
      ]),
      Feedback.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("givenBy", "name department")
        .populate("givenTo", "name department")
        .lean()
    ]);

    res.json({
      stats: {
        totalEmployees,
        totalFeedback,
        avgRating: avgRating[0]?.avgRating ? Number(avgRating[0].avgRating.toFixed(1)) : 0,
        feedbackByDept,
        recentFeedback
      }
    });
  } catch (error) {
    next(error);
  }
}

// Get all employees with filtering
export async function getAllEmployees(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      department,
      role,
      search
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { isDeleted: false };

    if (department) {
      filter.department = department;
    }

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Employee.countDocuments(filter)
    ]);

    res.json({
      employees,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
}

// Update employee role
export async function updateEmployeeRole(req, res, next) {
  try {
    const { employeeId } = req.params;
    const { role } = req.body;

    if (!isValidObjectId(employeeId)) {
      throw createHttpError(400, "Invalid employee id.");
    }

    if (!["employee", "manager", "admin"].includes(role)) {
      throw createHttpError(400, "Invalid role.");
    }

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      { role },
      { new: true }
    );

    if (!employee) {
      throw createHttpError(404, "Employee not found.");
    }

    res.json({
      message: "Employee role updated successfully.",
      employee
    });
  } catch (error) {
    next(error);
  }
}

// Soft delete an employee
export async function deleteEmployee(req, res, next) {
  try {
    const { employeeId } = req.params;

    if (!isValidObjectId(employeeId)) {
      throw createHttpError(400, "Invalid employee id.");
    }

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      { isDeleted: true },
      { new: true }
    );

    if (!employee) {
      throw createHttpError(404, "Employee not found.");
    }

    res.json({
      message: "Employee deleted successfully.",
      employee
    });
  } catch (error) {
    next(error);
  }
}

// Get feedback statistics by employee
export async function getEmployeeFeedbackStats(req, res, next) {
  try {
    const { employeeId } = req.params;

    if (!isValidObjectId(employeeId)) {
      throw createHttpError(400, "Invalid employee id.");
    }

    const [received, given] = await Promise.all([
      Feedback.find({ givenTo: employeeId, isDeleted: false })
        .sort({ createdAt: -1 })
        .populate("givenBy", "name department")
        .lean(),
      Feedback.find({ givenBy: employeeId, isDeleted: false })
        .sort({ createdAt: -1 })
        .populate("givenTo", "name department")
        .lean()
    ]);

    const ratingDist = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    received.forEach(fb => {
      ratingDist[fb.rating]++;
    });

    res.json({
      feedbackReceived: received,
      feedbackGiven: given,
      ratingDistribution: ratingDist,
      totalReceived: received.length,
      totalGiven: given.length,
      avgRating: received.length > 0
        ? (received.reduce((sum, fb) => sum + fb.rating, 0) / received.length).toFixed(1)
        : 0
    });
  } catch (error) {
    next(error);
  }
}

// Get departmental analytics
export async function getDepartmentAnalytics(req, res, next) {
  try {
    const departments = await Employee.aggregate([
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: "feedbacks",
          let: { empId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$givenTo", "$$empId"] },
                isDeleted: false
              }
            }
          ],
          as: "receivedFeedback"
        }
      },
      {
        $group: {
          _id: "$department",
          employeeCount: { $sum: 1 },
          avgRating: {
            $avg: {
              $cond: [
                { $eq: [{ $size: "$receivedFeedback" }, 0] },
                null,
                { $avg: "$receivedFeedback.rating" }
              ]
            }
          },
          totalFeedback: {
            $sum: { $size: "$receivedFeedback" }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      departments: departments.map(dept => ({
        ...dept,
        avgRating: dept.avgRating ? Number(dept.avgRating.toFixed(1)) : 0
      }))
    });
  } catch (error) {
    next(error);
  }
}
