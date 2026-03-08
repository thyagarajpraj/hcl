import { Router } from "express";
import {
  createEmployee,
  listEmployees
} from "../controllers/employeeController.js";
import { validateRequest, createEmployeeSchema } from "../middleware/validateRequest.js";

const router = Router();

router.get("/", listEmployees);
router.post("/", validateRequest(createEmployeeSchema), createEmployee);

export default router;
