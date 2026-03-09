export interface Summary {
  avgRating: number | null;
  feedbackCount: number;
}

export interface Employee {
  _id: string;
  name: string;
  email: string;
  department: string;
  avgRating: number | null;
  feedbackCount: number;
  role?: "employee" | "manager" | "admin";
}

export interface EmployeeReference {
  _id: string;
  name: string;
  email: string;
  department: string;
}

export interface FeedbackEntry {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  givenBy?: EmployeeReference | null;
  givenTo?: EmployeeReference | null;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  department: string;
}

export interface FeedbackFormData {
  givenTo: string;
  rating: string;
  comment: string;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  department: string;
}

export interface SubmitFeedbackPayload {
  givenBy: string;
  givenTo: string;
  rating: number;
  comment: string;
}

export interface EmployeesResponse {
  employees: Employee[];
}

export interface CreateEmployeeResponse {
  message: string;
  employee: Employee;
}

export interface EmployeeFeedbackResponse {
  feedback: FeedbackEntry[];
}

export interface AverageRatingResponse extends Summary {
  employeeId: string;
}

export interface SubmitFeedbackResponse {
  message: string;
  feedback: FeedbackEntry;
}

export interface DeleteFeedbackResponse {
  message: string;
}
