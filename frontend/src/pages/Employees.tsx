import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import EmployeeList from "../components/EmployeeList";
import { EmptyState } from "../components/EmptyState";
import { EMPLOYEE_SEARCH_DEBOUNCE_MS } from "../constants/app";
import type { Employee, EmployeeFormData } from "../types";

interface EmployeesProps {
  employees: Employee[];
  form: EmployeeFormData;
  onFormChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
  selectedEmployeeId: string;
  onSelectEmployee: (employeeId: string) => void;
}

export default function Employees({
  employees,
  form,
  onFormChange,
  onSubmit,
  submitting,
  selectedEmployeeId,
  onSelectEmployee
}: EmployeesProps) {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim().toLowerCase());
    }, EMPLOYEE_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchValue]);

  const filteredEmployees = employees.filter((employee) => {
    if (!debouncedSearchValue) {
      return true;
    }

    const searchableText = [employee.name, employee.email, employee.department]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(debouncedSearchValue);
  });

  return (
    <section className="panel stack-panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Employees</p>
          <h2>Team directory</h2>
        </div>
      </div>

      <form className="feedback-form" onSubmit={onSubmit} aria-label="Add new employee">
        <label htmlFor="name-input">
          Name
          <input
            id="name-input"
            type="text"
            name="name"
            value={form.name}
            onChange={onFormChange}
            placeholder="Employee name"
            required
            aria-required="true"
          />
        </label>

        <label htmlFor="email-input">
          Email
          <input
            id="email-input"
            type="email"
            name="email"
            value={form.email}
            onChange={onFormChange}
            placeholder="name@company.com"
            required
            aria-required="true"
          />
        </label>

        <label htmlFor="department-input">
          Department
          <input
            id="department-input"
            type="text"
            name="department"
            value={form.department}
            onChange={onFormChange}
            placeholder="Engineering"
            required
            aria-required="true"
          />
        </label>

        <button 
          className="submit-button" 
          type="submit" 
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? "Creating..." : "Create employee"}
        </button>
      </form>

      <label htmlFor="search-input" className="search-field">
        Search employees
        <input
          id="search-input"
          type="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search by name, email, or department"
          aria-label="Search employees by name, email, or department"
        />
      </label>

      {filteredEmployees.length === 0 && employees.length > 0 ? (
        <EmptyState
          title="No employees found"
          description={`No employees match "${debouncedSearchValue}". Try a different search term.`}
        />
      ) : filteredEmployees.length === 0 ? (
        <EmptyState
          title="No employees yet"
          description="Create your first employee to get started with feedback collection."
        />
      ) : (
        <EmployeeList
          employees={filteredEmployees}
          searchQuery={debouncedSearchValue}
          selectedEmployeeId={selectedEmployeeId}
          onSelectEmployee={onSelectEmployee}
        />
      )}
    </section>
  );
}
