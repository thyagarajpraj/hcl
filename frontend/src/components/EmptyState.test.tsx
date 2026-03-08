import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../components/EmptyState";

describe("EmptyState", () => {
  it("renders the title and description", () => {
    render(
      <EmptyState
        title="Test Title"
        description="Test Description"
      />
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    const onAction = () => {};
    render(
      <EmptyState
        title="Test Title"
        description="Test Description"
        actionText="Click Me"
        onAction={onAction}
      />
    );

    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("does not render button when not provided", () => {
    render(
      <EmptyState
        title="Test Title"
        description="Test Description"
      />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
