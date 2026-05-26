import { Bug } from './BugsPage';
import { AlertCircle, User, Calendar, FileText, Paperclip } from 'lucide-react';

interface BugListProps {
  bugs: Bug[];
}

export function BugList({ bugs }: BugListProps) {
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

  return (
    <div className="p-6 overflow-auto h-full">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium w-12 border-r border-border">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-r border-border min-w-[300px]">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-r border-border w-32">Severity</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-r border-border w-32">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-r border-border w-40">Assignee</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-r border-border w-40">Reporter</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-r border-border w-32">Test Case</th>
              <th className="px-4 py-3 text-left text-sm font-medium w-32">Created</th>
            </tr>
          </thead>
          <tbody>
            {bugs.map((bug) => {
              const statusBadge = getStatusBadge(bug.status);

              return (
                <tr key={bug.id} className="border-t border-border hover:bg-accent/50">
                  <td className="px-4 py-3 text-sm border-r border-border text-muted-foreground">
                    {bug.id}
                  </td>
                  <td className="px-4 py-3 text-sm border-r border-border">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium mb-1">{bug.title}</div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {bug.description}
                        </p>
                        {bug.attachments && bug.attachments.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Paperclip className="size-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {bug.attachments.length} attachments
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm border-r border-border">
                    <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(bug.severity)}`}>
                      {bug.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm border-r border-border">
                    <span className={`px-2 py-1 rounded text-xs ${statusBadge.style}`}>
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm border-r border-border">
                    <div className="flex items-center gap-2">
                      <User className="size-3 text-muted-foreground" />
                      <span>{bug.assignee || '-'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm border-r border-border">
                    <div className="flex items-center gap-2">
                      <User className="size-3 text-muted-foreground" />
                      <span>{bug.reporter}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm border-r border-border">
                    {bug.testCaseId ? (
                      <div className="flex items-center gap-1">
                        <FileText className="size-3 text-muted-foreground" />
                        <span className="text-xs">TC-{bug.testCaseId}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3 text-muted-foreground" />
                      <span className="text-xs">{bug.createdAt}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
