import type { Employee } from "../types";

interface EmployeeListProps {
  employees: Employee[];
  searchQuery: string;
  selectedEmployeeId: string;
  onSelectEmployee: (employeeId: string) => void;
}

function formatRating(value: number | null): string {
  return value === null ? "No ratings yet" : `${value} / 5`;
}

export default function EmployeeList({
  employees,
  searchQuery,
  selectedEmployeeId,
  onSelectEmployee
}: EmployeeListProps) {
  if (employees.length === 0) {
    return (
      <div className="empty-state">
        <p className="section-kicker">Employees</p>
        <h3>{searchQuery ? "No matching employees" : "No employees yet"}</h3>
        <p>
          {searchQuery
            ? "Try a different name, email, or department."
            : "Add an employee to start collecting feedback."}
        </p>
      </div>
    );
  }

  return (
    <div className="employee-list">
      {employees.map((employee) => {
        const isActive = employee._id === selectedEmployeeId;

        return (
          <button
            key={employee._id}
            type="button"
            className={`employee-card${isActive ? " employee-card-active" : ""}`}
            onClick={() => onSelectEmployee(employee._id)}
          >
            <div>
              <strong>{employee.name}</strong>
              <span>{employee.department}</span>
              <span>{employee.email}</span>
            </div>
            <div className="employee-stats">
              <span>{employee.feedbackCount} reviews</span>
              <strong>{formatRating(employee.avgRating)}</strong>
            </div>
          </button>
        );
      })}
    </div>
  );
}
