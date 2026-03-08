import type { EmployeeFormData, FeedbackFormData, Summary } from "../types";

export const APP_NAME = "Employee Feedback Platform";

export const INITIAL_EMPLOYEE_FORM: EmployeeFormData = {
  name: "",
  email: "",
  department: ""
};

export const INITIAL_FEEDBACK_FORM: FeedbackFormData = {
  givenTo: "",
  rating: "5",
  comment: ""
};

export const INITIAL_SUMMARY: Summary = {
  avgRating: null,
  feedbackCount: 0
};

export const RATING_OPTIONS: number[] = [5, 4, 3, 2, 1];

export const EMPLOYEE_SEARCH_DEBOUNCE_MS = 300;

export const LOGIN_STORAGE_KEY = "employee-feedback.logged-in-user";
