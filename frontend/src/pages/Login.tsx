import type { ChangeEvent, FormEvent } from "react";
import type { Employee, EmployeeFormData } from "../types";

interface LoginProps {
  employees: Employee[];
  loginEmployeeId: string;
  onLoginChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void;
  employeeForm: EmployeeFormData;
  onEmployeeFormChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onEmployeeCreate: (event: FormEvent<HTMLFormElement>) => void;
  creatingEmployee: boolean;
  loggingIn?: boolean;
}

export default function Login({
  employees,
  loginEmployeeId,
  onLoginChange,
  onLoginSubmit,
  employeeForm,
  onEmployeeFormChange,
  onEmployeeCreate,
  creatingEmployee,
  loggingIn = false
}: LoginProps) {
  return (
    <section className="login-grid">
      <section className="panel stack-panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Login</p>
            <h2>Continue as an employee</h2>
          </div>
        </div>

        <p className="login-copy">
          Select the employee who is currently logged in. That identity will be
          used automatically when submitting or deleting feedback.
        </p>

        <form className="feedback-form" onSubmit={onLoginSubmit}>
          <label>
            Logged-in employee
            <select
              name="loginEmployeeId"
              value={loginEmployeeId}
              onChange={onLoginChange}
              disabled={employees.length === 0}
              required
            >
              <option value="" disabled>
                Select employee
              </option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} • {employee.department}
                </option>
              ))}
            </select>
          </label>

          <button
            className="submit-button"
            type="submit"
            disabled={!loginEmployeeId || employees.length === 0 || loggingIn}
            aria-busy={loggingIn}
          >
            {loggingIn ? "Logging in..." : "Continue"}
          </button>
        </form>
      </section>

      <section className="panel stack-panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">New employee</p>
            <h2>Create an account to sign in</h2>
          </div>
        </div>

        <form className="feedback-form" onSubmit={onEmployeeCreate}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={employeeForm.name}
              onChange={onEmployeeFormChange}
              placeholder="Employee name"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={employeeForm.email}
              onChange={onEmployeeFormChange}
              placeholder="name@company.com"
              required
            />
          </label>

          <label>
            Department
            <input
              type="text"
              name="department"
              value={employeeForm.department}
              onChange={onEmployeeFormChange}
              placeholder="Engineering"
              required
            />
          </label>

          <button className="submit-button" type="submit" disabled={creatingEmployee}>
            {creatingEmployee ? "Creating..." : "Create employee"}
          </button>
        </form>
      </section>
    </section>
  );
}
