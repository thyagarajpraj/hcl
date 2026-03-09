import axios, { AxiosError } from "axios";
import axiosRetry from "axios-retry";
import type {
  AverageRatingResponse,
  CreateEmployeePayload,
  CreateEmployeeResponse,
  DeleteFeedbackResponse,
  EmployeeFeedbackResponse,
  EmployeesResponse,
  SubmitFeedbackPayload,
  SubmitFeedbackResponse
} from "../types";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Configure retry logic
axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: AxiosError) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status ? error.response.status >= 500 : false)
    );
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("employee-feedback.logged-in-user");
      // Don't redirect - let the app handle the error
    }
    return Promise.reject(error);
  }
);

export async function login(email: string): Promise<{
  token: string;
  employee: {
    _id: string;
    name: string;
    email: string;
    department: string;
  };
}> {
  
  console.log(`Attempting to log in with email: ${email}`);
  const { data } = await api.post<{
    token: string;
    employee: {
      _id: string;
      name: string;
      email: string;
      department: string;
    };
  }>("/auth/login", { email });
  return data;
}

export async function getEmployees(): Promise<EmployeesResponse> {
  const { data } = await api.get<EmployeesResponse>("/employees");
  return data;
}

export async function createEmployee(
  payload: CreateEmployeePayload
): Promise<CreateEmployeeResponse> {
  const { data } = await api.post<CreateEmployeeResponse>("/employees", payload);
  return data;
}

export async function getEmployeeFeedback(
  employeeId: string
): Promise<EmployeeFeedbackResponse> {
  const { data } = await api.get<EmployeeFeedbackResponse>(`/feedback/${employeeId}`);
  return data;
}

export async function getAverageRating(
  employeeId: string
): Promise<AverageRatingResponse> {
  const { data } = await api.get<AverageRatingResponse>(
    `/feedback/average/${employeeId}`
  );
  return data;
}

export async function submitFeedback(
  payload: SubmitFeedbackPayload
): Promise<SubmitFeedbackResponse> {
  const { data } = await api.post<SubmitFeedbackResponse>("/feedback", payload);
  return data;
}

export async function deleteFeedback(
  feedbackId: string,
  userId: string
): Promise<DeleteFeedbackResponse> {
  const { data } = await api.delete<DeleteFeedbackResponse>(`/feedback/${feedbackId}`, {
    data: {
      userId
    }
  });

  return data;
}

