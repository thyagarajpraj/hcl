import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import Feedback from "../models/Feedback.js";
import createHttpError from "../utils/createHttpError.js";
import { sanitizeInput } from "../utils/sanitizer.js";
import { sendFeedbackNotification } from "../utils/emailService.js";

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

async function getPopulatedFeedbackById(feedbackId) {
  return Feedback.findById(feedbackId)
    .populate("givenBy", "name email department")
    .populate("givenTo", "name email department")
    .lean();
}

export async function listFeedback(request, response, next) {
  try {
    const page = Math.max(1, parseInt(request.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const [feedback, total] = await Promise.all([
      Feedback.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("givenBy", "name email department")
        .populate("givenTo", "name email department")
        .lean(),
      Feedback.countDocuments(),
    ]);

    response.json({
      feedback,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function submitFeedback(request, response, next) {
  try {
    const { rating, comment, givenBy, givenTo } = request.body;
    const normalizedRating = Number(rating);
    const sanitizedComment = sanitizeInput(comment);

    if (!isValidObjectId(givenBy) || !isValidObjectId(givenTo)) {
      throw createHttpError(400, "Invalid employee id.");
    }

    if (String(givenBy) === String(givenTo)) {
      throw createHttpError(400, "Cannot give feedback to yourself.");
    }

    const employees = await Employee.find({
      _id: {
        $in: [givenBy, givenTo]
      }
    })
      .select("_id")
      .lean();

    if (employees.length !== 2) {
      throw createHttpError(404, "One or more employees were not found.");
    }

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const existingFeedback = await Feedback.findOne({
      givenBy,
      givenTo,
      createdAt: {
        $gte: last24Hours
      }
    }).lean();

    if (existingFeedback) {
      throw createHttpError(400, "Duplicate feedback within 24 hours.");
    }

    const createdFeedback = await Feedback.create({
      rating: normalizedRating,
      comment: sanitizedComment,
      givenBy,
      givenTo
    });

    const feedback = await getPopulatedFeedbackById(createdFeedback._id);

    // Send email notification (non-blocking)
    const recipientEmployee = await Employee.findById(givenTo);
    const senderEmployee = await Employee.findById(givenBy);
    if (recipientEmployee && senderEmployee) {
      sendFeedbackNotification(
        recipientEmployee.email,
        recipientEmployee.name,
        {
          givenBy: senderEmployee.name,
          rating: normalizedRating,
          comment: sanitizedComment
        }
      ).catch(err => {
        // Log but don't fail the request if email fails
        console.error("Email notification failed:", err);
      });
    }

    response.status(201).json({
      message: "Feedback submitted successfully.",
      feedback
    });
  } catch (error) {
    next(error);
  }
}

export async function getFeedbackReceived(request, response, next) {
  try {
    const { employeeId } = request.params;

    if (!isValidObjectId(employeeId)) {
      throw createHttpError(400, "Invalid employee id.");
    }

    const employeeExists = await Employee.exists({
      _id: employeeId
    });

    if (!employeeExists) {
      throw createHttpError(404, "Employee not found.");
    }

    const feedback = await Feedback.find({
      givenTo: employeeId
    })
      .sort({ createdAt: -1 })
      .populate("givenBy", "name email department")
      .populate("givenTo", "name email department")
      .lean();

    response.json({
      feedback
    });
  } catch (error) {
    next(error);
  }
}

export async function getAverageRating(request, response, next) {
  try {
    const { employeeId } = request.params;

    if (!isValidObjectId(employeeId)) {
      throw createHttpError(400, "Invalid employee id.");
    }

    const employeeExists = await Employee.exists({
      _id: employeeId
    });

    if (!employeeExists) {
      throw createHttpError(404, "Employee not found.");
    }

    const [result] = await Feedback.aggregate([
      {
        $match: {
          givenTo: new mongoose.Types.ObjectId(employeeId)
        }
      },
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
    ]);

    response.json({
      employeeId,
      avgRating: result ? Number(result.avgRating.toFixed(1)) : null,
      feedbackCount: result?.feedbackCount || 0
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteFeedback(request, response, next) {
  try {
    const { id } = request.params;
    const { userId } = request.body;

    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      throw createHttpError(400, "Invalid feedback id or user id.");
    }

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      throw createHttpError(404, "Feedback not found.");
    }

    if (String(feedback.givenBy) !== String(userId)) {
      throw createHttpError(403, "Not allowed to delete this feedback.");
    }

    // Soft delete - mark as deleted instead of removing
    await Feedback.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    });

    response.json({
      message: "Feedback deleted successfully."
    });
  } catch (error) {
    next(error);
  }
}
