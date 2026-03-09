import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Toaster } from "react-hot-toast";
import {
  createEmployee,
  deleteFeedback,
  getAverageRating,
  getEmployeeFeedback,
  getEmployees,
  login,
  submitFeedback
} from "./services/api";
import {
  APP_NAME,
  INITIAL_EMPLOYEE_FORM,
  INITIAL_FEEDBACK_FORM,
  INITIAL_SUMMARY,
  LOGIN_STORAGE_KEY
} from "./constants/app";
import type {
  Employee,
  EmployeeFormData,
  FeedbackEntry,
  FeedbackFormData,
  Summary
} from "./types";
import { showSuccess, showError } from "./utils/toast";
import { ErrorBoundary } from "./components/ErrorBoundary";

const Employees = lazy(() => import("./pages/Employees"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (typeof error !== "object" || error === null) {
    return fallbackMessage;
  }

  const typedError = error as {
    message?: string;
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  return typedError.response?.data?.message || typedError.message || fallbackMessage;
}

export default function App() {
  const errorBannerRef = useRef<HTMLElement | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loggedInEmployeeId, setLoggedInEmployeeId] = useState("");
  const [loginEmployeeId, setLoginEmployeeId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [summary, setSummary] = useState<Summary>(INITIAL_SUMMARY);
  const [employeeForm, setEmployeeForm] =
    useState<EmployeeFormData>(INITIAL_EMPLOYEE_FORM);
  const [feedbackForm, setFeedbackForm] =
    useState<FeedbackFormData>(INITIAL_FEEDBACK_FORM);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [creatingEmployee, setCreatingEmployee] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [deletingFeedbackId, setDeletingFeedbackId] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadEmployees(): Promise<Employee[]> {
    const data = await getEmployees();
    setEmployees(data.employees);
    return data.employees;
  }

  async function loadFeedback(employeeId: string): Promise<void> {
    if (!employeeId) {
      setFeedback([]);
      setSummary(INITIAL_SUMMARY);
      return;
    }

    setLoadingFeedback(true);

    try {
      const [feedbackData, summaryData] = await Promise.all([
        getEmployeeFeedback(employeeId),
        getAverageRating(employeeId)
      ]);

      setFeedback(feedbackData.feedback);
      setSummary({
        avgRating: summaryData.avgRating,
        feedbackCount: summaryData.feedbackCount
      });
    } finally {
      setLoadingFeedback(false);
    }
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true);
        setError("");
        const loadedEmployees = await loadEmployees();
        const storedLoginEmployeeId = window.localStorage.getItem(LOGIN_STORAGE_KEY) || "";
        const hasStoredLogin = loadedEmployees.some(
          (employee) => employee._id === storedLoginEmployeeId
        );

        setLoggedInEmployeeId(hasStoredLogin ? storedLoginEmployeeId : "");
        setLoginEmployeeId(
          hasStoredLogin ? storedLoginEmployeeId : loadedEmployees[0]?._id || ""
        );
        setSelectedEmployeeId(loadedEmployees[0]?._id || "");
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Unable to load employees."));
      } finally {
        setLoading(false);
      }
    }

    void bootstrap();
  }, []);

  useEffect(() => {
    if (employees.length === 0) {
      window.localStorage.removeItem(LOGIN_STORAGE_KEY);
      setLoggedInEmployeeId("");
      setLoginEmployeeId("");
      setSelectedEmployeeId("");
      setFeedbackForm(INITIAL_FEEDBACK_FORM);
      setFeedback([]);
      setSummary(INITIAL_SUMMARY);
      return;
    }

    if (!employees.some((employee) => employee._id === selectedEmployeeId)) {
      setSelectedEmployeeId(employees[0]._id);
    }

    if (
      loggedInEmployeeId &&
      !employees.some((employee) => employee._id === loggedInEmployeeId)
    ) {
      window.localStorage.removeItem(LOGIN_STORAGE_KEY);
      setLoggedInEmployeeId("");
    }

    if (!employees.some((employee) => employee._id === loginEmployeeId)) {
      setLoginEmployeeId(employees[0]._id);
    }

    setFeedbackForm((currentForm) => {
      if (
        currentForm.givenTo &&
        (!employees.some((employee) => employee._id === currentForm.givenTo) ||
          currentForm.givenTo === loggedInEmployeeId)
      ) {
        return {
          ...currentForm,
          givenTo: ""
        };
      }

      return currentForm;
    });
  }, [employees, loggedInEmployeeId, loginEmployeeId, selectedEmployeeId]);

  useEffect(() => {
    async function syncFeedback() {
      try {
        setError("");
        await loadFeedback(selectedEmployeeId);
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Unable to load feedback."));
      }
    }

    void syncFeedback();
  }, [selectedEmployeeId]);

  useEffect(() => {
    if (!error || !errorBannerRef.current) {
      return;
    }

    errorBannerRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, [error]);

  useEffect(() => {
    if (loggedInEmployeeId) {
      window.localStorage.setItem(LOGIN_STORAGE_KEY, loggedInEmployeeId);
      return;
    }

    window.localStorage.removeItem(LOGIN_STORAGE_KEY);
  }, [loggedInEmployeeId]);

  const selectedEmployee =
    employees.find((employee) => employee._id === selectedEmployeeId) || null;
  const loggedInEmployee =
    employees.find((employee) => employee._id === loggedInEmployeeId) || null;

  const ratedEmployees = employees.filter((employee) => employee.avgRating !== null);

  const overallAverage =
    ratedEmployees.length === 0
      ? "No ratings yet"
      : `${(
          ratedEmployees.reduce(
            (sum, employee) => sum + (employee.avgRating ?? 0),
            0
          ) / ratedEmployees.length
        ).toFixed(1)} / 5`;

  const topEmployee =
    ratedEmployees.length === 0
      ? "Awaiting feedback"
      : [...ratedEmployees].sort((left, right) => {
          if (right.avgRating !== left.avgRating) {
            return (right.avgRating ?? 0) - (left.avgRating ?? 0);
          }

          return right.feedbackCount - left.feedbackCount;
        })[0].name;

  async function handleEmployeeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatingEmployee(true);
    setError("");
    setSuccessMessage("");

    try {
      const data = await createEmployee(employeeForm);
      const nextEmployees = [...employees, data.employee].sort((left, right) =>
        left.name.localeCompare(right.name)
      );

      setEmployees(nextEmployees);
      setLoginEmployeeId(data.employee._id);
      setSelectedEmployeeId(data.employee._id);
      setEmployeeForm(INITIAL_EMPLOYEE_FORM);
      setSuccessMessage(data.message);
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to create employee."));
    } finally {
      setCreatingEmployee(false);
    }
  }

  async function handleFeedbackSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingFeedback(true);
    setError("");
    setSuccessMessage("");

    try {
      if (!loggedInEmployeeId) {
        throw new Error("Log in before submitting feedback.");
      }

      const currentGivenTo = feedbackForm.givenTo;
      const data = await submitFeedback({
        givenBy: loggedInEmployeeId,
        ...feedbackForm,
        rating: Number(feedbackForm.rating)
      });

      await loadEmployees();
      await loadFeedback(currentGivenTo);
      setSelectedEmployeeId(currentGivenTo);
      setFeedbackForm(INITIAL_FEEDBACK_FORM);
      setSuccessMessage(data.message);
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to submit feedback."));
    } finally {
      setSubmittingFeedback(false);
    }
  }

  async function handleDeleteFeedback(feedbackId: string) {
    setDeletingFeedbackId(feedbackId);
    setError("");
    setSuccessMessage("");

    try {
      if (!loggedInEmployeeId) {
        throw new Error("Log in before deleting feedback.");
      }

      const data = await deleteFeedback(feedbackId, loggedInEmployeeId);
      await loadEmployees();
      await loadFeedback(selectedEmployeeId);
      setSuccessMessage(data.message);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Unable to delete feedback."));
    } finally {
      setDeletingFeedbackId("");
    }
  }

  function handleEmployeeFormChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    const { name, value } = event.target;
    setEmployeeForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  }
  
  function handleFeedbackFormChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void {
    const { name, value } = event.target;

    setFeedbackForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));

    if (name === "givenTo") {
      setSelectedEmployeeId(value);
    }
  }

  function handleLoginChange(event: ChangeEvent<HTMLSelectElement>): void {
    setLoginEmployeeId(event.target.value);
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!loginEmployeeId) {
      showError("Select an employee to continue.");
      return;
    }

    const selectedEmployee = employees.find((emp) => emp._id === loginEmployeeId);
    if (!selectedEmployee) {
      showError("Employee not found.");
      return;
    }

    setLoggingIn(true);
    setError("");
    setSuccessMessage("");

    try {
      const { token } = await login(selectedEmployee.email);
      localStorage.setItem("auth_token", token);
      localStorage.setItem(LOGIN_STORAGE_KEY, loginEmployeeId);
      
      setLoggedInEmployeeId(loginEmployeeId);
      setSelectedEmployeeId(loginEmployeeId);
      setFeedbackForm(INITIAL_FEEDBACK_FORM);
      showSuccess(`Welcome, ${selectedEmployee.name}!`);
    } catch (loginError) {
      const message = getErrorMessage(loginError, "Login failed. Please try again.");
      showError(message);
      setError(message);
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout(): Promise<void> {
    setLoggingIn(true);
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem(LOGIN_STORAGE_KEY);
      
      setLoggedInEmployeeId("");
      setLoginEmployeeId("");
      setFeedbackForm(INITIAL_FEEDBACK_FORM);
      setError("");
      setSuccessMessage("");
      showSuccess("Logged out successfully.");
    } catch {
      showError("Logout failed.");
    } finally {
      setLoggingIn(false);
    }
  }

  if (loading) {
    return (
      <ErrorBoundary>
        <main className="page-shell">
          <section className="loading-card">
            <p className="eyebrow">{APP_NAME}</p>
            <h1>Loading dashboard...</h1>
          </section>
        </main>
      </ErrorBoundary>
    );
  }

  const isAdmin = loggedInEmployee?.role === "admin";

  return (
    <ErrorBoundary>
      <main className="page-shell">
        <section className="hero-panel">
          <div>
            <p className="eyebrow">{APP_NAME}</p>
            <h1>Mongo-backed feedback with clear ownership rules.</h1>
            <p className="hero-copy">
              Create employees, submit peer feedback, enforce the 24-hour duplicate
              rule, and review rating trends from a single dashboard.
            </p>
          </div>

          <div className="hero-metrics">
            <article className="metric-card">
              <span className="metric-label">Signed in</span>
              <strong>{loggedInEmployee ? loggedInEmployee.name : "Not signed in"}</strong>
            </article>
            <article className="metric-card">
              <span className="metric-label">Employees</span>
              <strong>{employees.length}</strong>
            </article>
            <article className="metric-card">
              <span className="metric-label">Average rating</span>
              <strong>{overallAverage}</strong>
            </article>
            <article className="metric-card">
              <span className="metric-label">Top rated</span>
              <strong>{topEmployee}</strong>
            </article>
          </div>
        </section>

        {(error || successMessage) && (
          <section
            ref={error ? errorBannerRef : null}
            className={error ? "banner banner-error" : "banner banner-success"}
          >
            {error || successMessage}
          </section>
        )}

        {!loggedInEmployee ? (
          <Suspense
            fallback={
              <section className="panel">
                <p className="section-kicker">Login</p>
                <h2>Loading section...</h2>
              </section>
            }
          >
            <Login
              employees={employees}
              loginEmployeeId={loginEmployeeId}
              onLoginChange={handleLoginChange}
              onLoginSubmit={handleLoginSubmit}
              employeeForm={employeeForm}
              onEmployeeFormChange={handleEmployeeFormChange}
              onEmployeeCreate={handleEmployeeSubmit}
              creatingEmployee={creatingEmployee}
              loggingIn={loggingIn}
            />
          </Suspense>
        ) : isAdmin ? (
          <>
            <div className="auth-toolbar">
              <span className="auth-chip">
                🔑 Admin: {loggedInEmployee.name} • {loggedInEmployee.department}
              </span>
              <button type="button" className="inline-button" onClick={handleLogout}>
                Log out
              </button>
            </div>

            <Suspense
              fallback={
                <section className="panel">
                  <p className="section-kicker">Admin</p>
                  <h2>Loading admin dashboard...</h2>
                </section>
              }
            >
              <Admin />
            </Suspense>
          </>
        ) : (
          <>
            <div className="auth-toolbar">
              <span className="auth-chip">
                Logged in as {loggedInEmployee.name} • {loggedInEmployee.department}
              </span>
              <button type="button" className="inline-button" onClick={handleLogout}>
                Log out
              </button>
            </div>

            <section className="dashboard-grid">
              <Suspense
                fallback={
                  <section className="panel">
                    <p className="section-kicker">Employees</p>
                    <h2>Loading section...</h2>
                  </section>
                }
              >
                <Employees
                  employees={employees}
                  form={employeeForm}
                  onFormChange={handleEmployeeFormChange}
                  onSubmit={handleEmployeeSubmit}
                  submitting={creatingEmployee}
                  selectedEmployeeId={selectedEmployeeId}
                  onSelectEmployee={setSelectedEmployeeId}
                />
              </Suspense>

              <Suspense
                fallback={
                  <section className="panel">
                    <p className="section-kicker">Feedback</p>
                    <h2>Loading section...</h2>
                  </section>
                }
              >
                <Feedback
                  employees={employees}
                  loggedInEmployee={loggedInEmployee}
                  selectedEmployee={selectedEmployee}
                  summary={summary}
                  feedback={feedback}
                  form={feedbackForm}
                  onFormChange={handleFeedbackFormChange}
                  onSubmit={handleFeedbackSubmit}
                  submitting={submittingFeedback}
                  deletingFeedbackId={deletingFeedbackId}
                  onDeleteFeedback={handleDeleteFeedback}
                />
              </Suspense>
            </section>
          </>
        )}

        {loadingFeedback && (
          <section className="banner banner-success">Refreshing feedback view...</section>
        )}
        <Toaster 
          position="bottom-center"
          reverseOrder={false}
          gutter={12}
          containerStyle={{
            position: "fixed",
            bottom: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999
          }}
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              padding: "16px 24px",
              minWidth: "320px",
              maxWidth: "520px",
              fontSize: "15px",
              fontWeight: "500"
            },
            success: {
              style: {
                background: "#10b981",
                color: "#fff"
              }
            },
            error: {
              style: {
                background: "#ef4444",
                color: "#fff"
              }
            },
            loading: {
              style: {
                background: "#3b82f6",
                color: "#fff"
              }
            }
          }}
        />
      </main>
    </ErrorBoundary>
  );
}
