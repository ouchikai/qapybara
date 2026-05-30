"use client";

import { Link as LinkIcon, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { reportBug, type ReportBugFieldErrors } from "@/app/actions/report-bug";
import type { BugSeverity } from "@/features/issues/types/issue-detail";

interface BugReportDialogProps {
  open: boolean;
  issueId: string;
  issueNumber: number | null;
  issueTitle: string;
  onClose: () => void;
  onCreated: () => void;
}

const SEVERITY_OPTIONS: { value: BugSeverity; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function BugReportDialog({
  open,
  issueId,
  issueNumber,
  issueTitle,
  onClose,
  onCreated,
}: BugReportDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ReportBugFieldErrors>({});
  const [severity, setSeverity] = useState<BugSeverity>("medium");
  const titleRef = useRef<HTMLInputElement>(null);

  // Escapeで閉じ、開いたら最初のフィールドにフォーカス。
  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    titleRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await reportBug({
        issueId,
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        severity,
      });

      if (!result.ok) {
        setFormError(result.error ?? "バグの登録に失敗しました");
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      form.reset();
      setSeverity("medium");
      onCreated();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bug-dialog-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="bug-dialog-title" className="text-lg font-semibold">
            Report Bug
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="rounded p-1 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <form
          id="bug-report-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-auto p-6"
          noValidate
        >
          {formError ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {formError}
            </p>
          ) : null}

          <div>
            <label htmlFor="bug-title" className="mb-2 block text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="bug-title"
              name="title"
              ref={titleRef}
              type="text"
              required
              maxLength={200}
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={fieldErrors.title ? "bug-title-error" : undefined}
              className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Brief description of the bug"
            />
            {fieldErrors.title ? (
              <p id="bug-title-error" className="mt-1 text-xs text-destructive">
                {fieldErrors.title}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="bug-severity" className="mb-2 block text-sm font-medium">
              Severity <span className="text-destructive">*</span>
            </label>
            <select
              id="bug-severity"
              name="severity"
              value={severity}
              onChange={(event) => setSeverity(event.target.value as BugSeverity)}
              className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SEVERITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bug-description" className="mb-2 block text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="bug-description"
              name="description"
              required
              rows={6}
              aria-invalid={Boolean(fieldErrors.description)}
              aria-describedby={fieldErrors.description ? "bug-description-error" : undefined}
              className="w-full resize-y rounded-md border border-border bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Detailed description, reproduction steps, etc."
            />
            {fieldErrors.description ? (
              <p id="bug-description-error" className="mt-1 text-xs text-destructive">
                {fieldErrors.description}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 p-3">
            <LinkIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <div className="text-sm font-medium">Issue #{issueNumber ?? "—"}</div>
              <div className="truncate text-xs text-muted-foreground">{issueTitle}</div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="bug-report-form"
            disabled={isPending}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Report Bug
          </button>
        </div>
      </div>
    </div>
  );
}
