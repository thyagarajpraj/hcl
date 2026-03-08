import { Router } from "express";
import {
  deleteFeedback,
  getAverageRating,
  getFeedbackReceived,
  listFeedback,
  submitFeedback
} from "../controllers/feedbackController.js";
import { validateRequest, submitFeedbackSchema } from "../middleware/validateRequest.js";

const router = Router();

router.get("/", listFeedback);
router.get("/average/:employeeId", getAverageRating);
router.get("/:employeeId", getFeedbackReceived);
router.post("/", validateRequest(submitFeedbackSchema), submitFeedback);
router.delete("/:id", deleteFeedback);

export default router;
