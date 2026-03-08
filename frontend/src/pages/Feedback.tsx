import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import FeedbackForm from "../components/FeedbackForm";
import { EmptyState } from "../components/EmptyState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import type {
  Employee,
  FeedbackEntry,
  FeedbackFormData,
  Summary
} from "../types";

interface FeedbackProps {
  employees: Employee[];
  loggedInEmployee: Employee | null;
  selectedEmployee: Employee | null;
  summary: Summary;
  feedback: FeedbackEntry[];
  form: FeedbackFormData;
  onFormChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
  deletingFeedbackId: string;
  onDeleteFeedback: (feedbackId: string) => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function Feedback({
  employees,
  loggedInEmployee,
  selectedEmployee,
  summary,
  feedback,
  form,
  onFormChange,
  onSubmit,
  submitting,
  deletingFeedbackId,
  onDeleteFeedback
}: FeedbackProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (feedbackId: string) => {
    setConfirmDeleteId(feedbackId);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      onDeleteFeedback(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <section className="panel stack-panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Feedback</p>
          <h2>Employee feedback</h2>
        </div>
      </div>

      <div className="selected-employee-card" aria-label="Selected employee summary">
        <span className="metric-label">Selected employee</span>
        <strong>{selectedEmployee ? selectedEmployee.name : "No employee selected"}</strong>
        <p>
          {selectedEmployee
            ? `${selectedEmployee.department} • ${selectedEmployee.email}`
            : "Create at least one employee to begin."}
        </p>
        <div className="summary-inline">
          <span>
            Average rating:{" "}
            {summary.avgRating === null ? "No ratings yet" : `${summary.avgRating} / 5`}
          </span>
          <span>Feedback received: {summary.feedbackCount}</span>
        </div>
      </div>

      {employees.length > 0 ? (
        <FeedbackForm
          employees={employees}
          loggedInEmployee={loggedInEmployee}
          form={form}
          onChange={onFormChange}
          onSubmit={onSubmit}
          submitting={submitting}
        />
      ) : (
        <EmptyState
          title="No employees available"
          description="Create employees first before submitting feedback."
        />
      )}

      <div className="feedback-list" role="region" aria-label="Feedback history">
        {feedback.length === 0 ? (
          <EmptyState
            title="No feedback yet"
            description="Submitted feedback for the selected employee will appear here."
          />
        ) : (
          feedback.map((entry) => {
            const canDelete = entry.givenBy?._id === loggedInEmployee?._id;

            return (
              <article key={entry._id} className="feedback-item">
                <div className="feedback-item-header">
                  <div>
                    <strong>{entry.givenBy?.name || "Unknown giver"}</strong>
                    <span>{formatDate(entry.createdAt)}</span>
                  </div>
                  <span className="rating-badge" aria-label={`Rating: ${entry.rating} out of 5`}>
                    {entry.rating} / 5
                  </span>
                </div>
                <p>{entry.comment}</p>
                <div className="feedback-footer">
                  <span>
                    Given to {entry.givenTo?.name || selectedEmployee?.name || "employee"}
                  </span>
                  {canDelete && (
                    <button
                      type="button"
                      className="inline-button"
                      onClick={() => handleDeleteClick(entry._id)}
                      disabled={deletingFeedbackId === entry._id}
                      aria-busy={deletingFeedbackId === entry._id}
                    >
                      {deletingFeedbackId === entry._id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Delete feedback?"
        description="This action cannot be undone. Are you sure you want to delete this feedback?"
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </section>
  );
}
