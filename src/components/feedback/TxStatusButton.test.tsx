import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TxStatusButton } from "./TxStatusButton";

describe("TxStatusButton", () => {
  it("shows idle label", () => {
    render(<TxStatusButton phase="idle" idleLabel="Place bid" onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Place bid" })).toBeEnabled();
  });

  it("shows signing label and disables button", () => {
    render(<TxStatusButton phase="signing" idleLabel="Place bid" onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Confirm in wallet/ })).toBeDisabled();
  });
});
