import { X, AlertCircle, User, Calendar, FileText, Link as LinkIcon, Paperclip } from 'lucide-react';
import { Bug } from './BugsPage';
import { Link, useParams } from 'react-router';

interface BugDetailModalProps {
  bug: Bug;
  onClose: () => void;
}

export function BugDetailModal({ bug, onClose }: BugDetailModalProps) {
  const { repoId, projectId } = useParams();

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-destructive/10 text-destructive border-destructive/20',
      high: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
      medium: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      low: 'bg-muted text-muted-foreground border-border',
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-chart-4/10 text-chart-4',
      'in-progress': 'bg-chart-1/10 text-chart-1',
      'ready-for-test': 'bg-chart-5/10 text-chart-5',
      closed: 'bg-chart-2/10 text-chart-2',
    };
    const labels = {
      new: 'New',
      'in-progress': 'In Progress',
      'ready-for-test': 'Ready for Test',
      closed: 'Closed',
    };
    return {
      style: styles[status as keyof typeof styles] || 'bg-muted text-muted-foreground',
      label: labels[status as keyof typeof labels] || status,
    };
  };

  const statusBadge = getStatusBadge(bug.status);

  // Parse description to render images
  const renderDescription = () => {
    const parts = bug.description.split(/(!\\[image\\]\\([^)]+\\))/);
    const elements: JSX.Element[] = [];

    parts.forEach((part, index) => {
      const imageMatch = part.match(/!\[image\]\(([^)]+)\)/);

      if (imageMatch) {
        // For demo, show placeholder
        elements.push(
          <div key={index} className="my-3">
            <div className="w-full max-w-md h-48 bg-muted border border-border rounded flex items-center justify-center">
              <span className="text-sm text-muted-foreground">[Embedded Image]</span>
            </div>
          </div>
        );
      } else if (part.trim()) {
        elements.push(
          <p key={index} className="whitespace-pre-wrap">
            {part}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="size-5 text-muted-foreground" />
              <h2>Bug #{bug.id}</h2>
            </div>
            <h3 className="text-lg">{bug.title}</h3>
            <div className="flex items-center gap-2 mt-3">
              <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(bug.severity)}`}>
                {bug.severity}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${statusBadge.style}`}>
                {statusBadge.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Description */}
          <section>
            <h4 className="text-sm font-medium mb-2">Description</h4>
            <div className="prose prose-sm max-w-none text-foreground">
              {renderDescription()}
            </div>
          </section>

          {/* Related Links */}
          {(bug.issueId || bug.testCaseId) && (
            <section>
              <h4 className="text-sm font-medium mb-2">Related Links</h4>
              <div className="space-y-2">
                {bug.issueId && (
                  <Link
                    to={`/repositories/${repoId}/projects/${projectId}/issues/${bug.issueId}`}
                    className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-md hover:bg-muted transition-colors"
                  >
                    <LinkIcon className="size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Issue #{bug.issueNumber}</div>
                      <div className="text-xs text-muted-foreground">{bug.issueTitle}</div>
                    </div>
                  </Link>
                )}
                {bug.testCaseId && (
                  <Link
                    to={`/repositories/${repoId}/projects/${projectId}/issues/${bug.issueId}/test-cases/${bug.testCaseId}`}
                    className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-md hover:bg-muted transition-colors"
                  >
                    <FileText className="size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Test Case TC-{bug.testCaseId}</div>
                      <div className="text-xs text-muted-foreground">{bug.testCaseTitle}</div>
                    </div>
                  </Link>
                )}
              </div>
            </section>
          )}

          {/* Attachments */}
          {bug.attachments && bug.attachments.length > 0 && (
            <section>
              <h4 className="text-sm font-medium mb-2">Attachments</h4>
              <div className="flex flex-wrap gap-2">
                {bug.attachments.map((file) => (
                  <button
                    key={file}
                    className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent/80 rounded border border-border transition-colors text-sm"
                  >
                    <Paperclip className="size-4" />
                    {file}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Metadata */}
          <section className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Reporter</div>
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <span className="text-sm">{bug.reporter}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Assignee</div>
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <span className="text-sm">{bug.assignee || 'Unassigned'}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Created</div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-sm">{bug.createdAt}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
