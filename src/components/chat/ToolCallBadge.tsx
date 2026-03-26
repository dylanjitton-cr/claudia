"use client";

import { Loader2, FilePlus, FilePen, FileX, FolderPen, Eye } from "lucide-react";

interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: "call" | "partial-call" | "result";
  result?: unknown;
}

interface ToolLabel {
  icon: React.ReactNode;
  text: string;
}

function basename(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? path;
}

function getToolLabel(toolName: string, args: Record<string, unknown>): ToolLabel {
  if (toolName === "str_replace_editor") {
    const command = args.command as string | undefined;
    const path = args.path as string | undefined;
    const file = path ? basename(path) : null;

    switch (command) {
      case "create":
        return {
          icon: <FilePlus className="w-3 h-3" />,
          text: file ? `Creating ${file}` : "Creating file",
        };
      case "str_replace":
      case "insert":
        return {
          icon: <FilePen className="w-3 h-3" />,
          text: file ? `Editing ${file}` : "Editing file",
        };
      case "delete":
        return {
          icon: <FileX className="w-3 h-3" />,
          text: file ? `Deleting ${file}` : "Deleting file",
        };
      case "view":
        return {
          icon: <Eye className="w-3 h-3" />,
          text: file ? `Reading ${file}` : "Reading file",
        };
      default:
        return {
          icon: <FilePen className="w-3 h-3" />,
          text: file ? `Editing ${file}` : "Editing file",
        };
    }
  }

  if (toolName === "file_manager") {
    const command = args.command as string | undefined;
    const path = args.path as string | undefined;
    const newPath = args.new_path as string | undefined;
    const file = path ? basename(path) : null;

    switch (command) {
      case "rename": {
        const newFile = newPath ? basename(newPath) : null;
        return {
          icon: <FolderPen className="w-3 h-3" />,
          text: file && newFile ? `Renaming ${file} → ${newFile}` : "Renaming file",
        };
      }
      case "delete":
        return {
          icon: <FileX className="w-3 h-3" />,
          text: file ? `Deleting ${file}` : "Deleting file",
        };
      default:
        return {
          icon: <FilePen className="w-3 h-3" />,
          text: toolName,
        };
    }
  }

  return {
    icon: <FilePen className="w-3 h-3" />,
    text: toolName,
  };
}

export function ToolCallBadge({ toolName, args, state, result: _result }: ToolCallBadgeProps) {
  const done = state === "result";
  const { icon, text } = getToolLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      <span className={done ? "text-emerald-600" : "text-blue-500"}>{icon}</span>
      <span className="text-neutral-700">{text}</span>
      {done ? (
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ml-1" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-400 shrink-0 ml-1" />
      )}
    </div>
  );
}
