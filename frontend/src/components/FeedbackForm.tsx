import type { ChangeEvent, FormEvent } from "react";
import { RATING_OPTIONS } from "../constants/app";
import type { Employee, FeedbackFormData } from "../types";

interface FeedbackFormProps {
  employees: Employee[];
  loggedInEmployee: Employee | null;
  form: FeedbackFormData;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
}

export default function FeedbackForm({
  employees,
  loggedInEmployee,
  form,
  onChange,
  onSubmit,
  submitting
}: FeedbackFormProps) {
  const hasEmployees = employees.length > 1 && Boolean(loggedInEmployee);
  const commentLength = form.comment.trim().length;
  const minCommentLength = 10;
  const maxCommentLength = 5000;
  
  const canSubmit =
    hasEmployees &&
    form.givenTo &&
    form.givenTo !== loggedInEmployee?._id &&
    commentLength >= minCommentLength &&
    commentLength <= maxCommentLength;

  const getCommentError = (): string => {
    if (commentLength === 0) return "";
    if (commentLength < minCommentLength) {
      return `Comment must be at least ${minCommentLength} characters (${commentLength}/${minCommentLength})`;
    }
    if (commentLength > maxCommentLength) {
      return `Comment exceeds maximum length (${commentLength}/${maxCommentLength})`;
    }
    return "";
  };

  return (
    <form className="feedback-form" onSubmit={onSubmit}>
      <label>
        Feedback from
        <input
          type="text"
          value={
            loggedInEmployee
              ? `${loggedInEmployee.name} • ${loggedInEmployee.department}`
              : "Log in to submit feedback"
          }
          readOnly
          disabled
          aria-label="Logged in employee"
        />
      </label>

      <label>
        Feedback to
        <select
          name="givenTo"
          value={form.givenTo}
          onChange={onChange}
          disabled={employees.length === 0}
          required
          aria-label="Select feedback recipient"
          aria-required="true"
        >
          <option value="" disabled>
            Select receiver
          </option>
          {employees
            .filter((employee) => employee._id !== loggedInEmployee?._id)
            .map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.name}
              </option>
            ))}
        </select>
      </label>

      <label>
        Rating
        <select 
          name="rating" 
          value={form.rating} 
          onChange={onChange} 
          required
          aria-label="Select rating from 1 to 5"
          aria-required="true"
        >
          {RATING_OPTIONS.map((rating) => (
            <option key={rating} value={rating}>
              {rating} / 5
            </option>
          ))}
        </select>
      </label>

      <label>
        Comment ({commentLength}/{maxCommentLength})
        <textarea
          name="comment"
          rows={5}
          value={form.comment}
          onChange={onChange}
          placeholder="Write specific, actionable feedback."
          disabled={!hasEmployees}
          required
          aria-label="Enter feedback comment"
          aria-required="true"
          aria-describedby={getCommentError() ? "comment-error" : undefined}
          maxLength={maxCommentLength}
        />
        {getCommentError() && (
          <span id="comment-error" className="error-message" style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {getCommentError()}
          </span>
        )}
      </label>

      <button
        className="submit-button"
        type="submit"
        disabled={submitting || !canSubmit}
        aria-busy={submitting}
      >
        {submitting ? "Submitting..." : "Submit feedback"}
      </button>
    </form>
  );
}
