import { useState } from 'react';
import { X, Upload, Link as LinkIcon } from 'lucide-react';
import { Bug } from './BugsPage';
import { RichTextEditor } from './RichTextEditor';
import { UserCombobox } from './UserCombobox';

interface BugReportModalProps {
  onClose: () => void;
  onSubmit: (bug: Omit<Bug, 'id' | 'createdAt'>) => void;
  testCaseId?: number;
  testCaseTitle?: string;
  issueId?: number;
  issueNumber?: number;
  issueTitle?: string;
  initialTitle?: string;
}

export function BugReportModal({
  onClose,
  onSubmit,
  testCaseId,
  testCaseTitle,
  issueId,
  issueNumber,
  issueTitle,
  initialTitle = '',
}: BugReportModalProps) {
  const [formData, setFormData] = useState({
    title: initialTitle,
    description: '',
    severity: 'medium' as Bug['severity'],
    status: 'new',
    assignee: '',
    reporter: '田中太郎', // Mock current user
    testCaseId,
    testCaseTitle,
    issueId,
    issueNumber,
    issueTitle,
    attachments: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2>Report Bug</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Brief description of the bug"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              onImagesChange={(images) => setFormData({ ...formData, attachments: images })}
              placeholder="Detailed description, reproduction steps, etc.&#10;&#10;Paste images directly (Ctrl+V / Cmd+V)"
              rows={8}
            />
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium mb-2">Severity *</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as Bug['severity'] })}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium mb-2">Assignee</label>
            <UserCombobox
              value={formData.assignee}
              onChange={(value) => setFormData({ ...formData, assignee: value })}
              placeholder="Select assignee..."
            />
          </div>

          {/* Related Links */}
          {(testCaseId || issueId) && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Related Links</label>
              {issueId && (
                <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-md p-3">
                  <LinkIcon className="size-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Issue #{issueNumber}</div>
                    <div className="text-xs text-muted-foreground">{issueTitle}</div>
                  </div>
                </div>
              )}
              {testCaseId && (
                <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-md p-3">
                  <LinkIcon className="size-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Test Case TC-{testCaseId}</div>
                    <div className="text-xs text-muted-foreground">{testCaseTitle}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Additional Attachments */}
          {formData.attachments.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Attachments</label>
              <div className="flex flex-wrap gap-2">
                {formData.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-muted border border-border rounded text-sm"
                  >
                    <Upload className="size-3" />
                    <span>{file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Report Bug
          </button>
        </div>
      </div>
    </div>
  );
}
