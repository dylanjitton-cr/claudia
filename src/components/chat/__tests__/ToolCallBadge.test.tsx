import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// ─── str_replace_editor: create ───────────────────────────────────────────────

test("shows 'Creating <filename>' for str_replace_editor create command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/components/Button.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating Button.jsx")).toBeDefined();
});

test("shows 'Creating file' when path is missing for create command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating file")).toBeDefined();
});

// ─── str_replace_editor: str_replace / insert → edit ─────────────────────────

test("shows 'Editing <filename>' for str_replace_editor str_replace command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/components/Card.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing Card.tsx")).toBeDefined();
});

test("shows 'Editing <filename>' for str_replace_editor insert command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "insert", path: "/components/Nav.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing Nav.tsx")).toBeDefined();
});

// ─── str_replace_editor: delete ───────────────────────────────────────────────

test("shows 'Deleting <filename>' for str_replace_editor delete command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "delete", path: "/components/Old.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Deleting Old.tsx")).toBeDefined();
});

// ─── str_replace_editor: view ─────────────────────────────────────────────────

test("shows 'Reading <filename>' for str_replace_editor view command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "view", path: "/components/Button.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Reading Button.jsx")).toBeDefined();
});

test("shows 'Reading file' when path is missing for view command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "view" }}
      state="call"
    />
  );
  expect(screen.getByText("Reading file")).toBeDefined();
});

// ─── file_manager: rename ─────────────────────────────────────────────────────

test("shows 'Renaming a → b' for file_manager rename command", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "rename", path: "/components/Old.tsx", new_path: "/components/New.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Renaming Old.tsx → New.tsx")).toBeDefined();
});

test("shows 'Renaming file' when paths are missing for rename command", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "rename" }}
      state="call"
    />
  );
  expect(screen.getByText("Renaming file")).toBeDefined();
});

// ─── file_manager: delete ─────────────────────────────────────────────────────

test("shows 'Deleting <filename>' for file_manager delete command", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "delete", path: "/components/Gone.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Deleting Gone.tsx")).toBeDefined();
});

// ─── done state ───────────────────────────────────────────────────────────────

test("shows green dot when state is result with a non-empty result", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/components/Button.jsx" }}
      state="result"
      result="Success"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows green dot when state is result with an empty string result", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/components/Button.jsx" }}
      state="result"
      result=""
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows green dot when state is result with no result prop", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/components/Button.jsx" }}
      state="result"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

// ─── in-progress state ────────────────────────────────────────────────────────

test("shows spinner when state is call", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/components/Button.jsx" }}
      state="call"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows spinner when state is partial-call", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/components/Button.jsx" }}
      state="partial-call"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

// ─── icon rendering ───────────────────────────────────────────────────────────

test("renders an svg icon in both call and result states", () => {
  const { container: callContainer } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/components/Button.jsx" }}
      state="call"
    />
  );
  expect(callContainer.querySelector("svg")).toBeDefined();

  cleanup();

  const { container: doneContainer } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/components/Button.jsx" }}
      state="result"
      result="ok"
    />
  );
  expect(doneContainer.querySelector("svg")).toBeDefined();
});

// ─── misc ─────────────────────────────────────────────────────────────────────

test("falls back to toolName text for unknown tool", () => {
  render(
    <ToolCallBadge
      toolName="some_unknown_tool"
      args={{}}
      state="call"
    />
  );
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

test("uses only the filename from a deeply nested path", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/very/deep/nested/path/Component.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating Component.tsx")).toBeDefined();
});

test("does not use font-mono on the badge text", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/components/Button.jsx" }}
      state="call"
    />
  );
  const badge = container.firstChild as HTMLElement;
  expect(badge.className).not.toContain("font-mono");
});
