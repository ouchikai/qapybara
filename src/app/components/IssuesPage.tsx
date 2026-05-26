import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { Search, Filter, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';

// Mock data
const mockIssues = [
  {
    id: 1,
    number: 123,
    title: 'ユーザー権限管理の不具合修正',
    status: 'open',
    priority: 'high',
    labels: ['bug', 'security'],
    assignee: '田中太郎',
    createdAt: '2026-05-20',
    testCaseCount: 0,
  },
  {
    id: 2,
    number: 124,
    title: '取引履歴エクスポート機能の追加',
    status: 'in-progress',
    priority: 'medium',
    labels: ['enhancement', 'feature'],
    assignee: '佐藤花子',
    createdAt: '2026-05-19',
    testCaseCount: 12,
  },
  {
    id: 3,
    number: 125,
    title: '決済フロー最適化',
    status: 'open',
    priority: 'critical',
    labels: ['performance', 'hotfix'],
    assignee: '鈴木一郎',
    createdAt: '2026-05-22',
    testCaseCount: 5,
  },
];

export function IssuesPage() {
  const { repoId, projectId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const repoName = 'finance-portal'; // Mock
  const projectName = 'v2.5 Release'; // Mock

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="size-4 text-destructive" />;
      case 'in-progress':
        return <Clock className="size-4 text-chart-4" />;
      case 'closed':
        return <CheckCircle2 className="size-4 text-chart-2" />;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      critical: 'bg-destructive/10 text-destructive border-destructive/20',
      high: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
      medium: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      low: 'bg-muted text-muted-foreground border-border',
    };
    return styles[priority as keyof typeof styles] || styles.low;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <Breadcrumb
          items={[
            { label: 'Repositories', path: '/repositories' },
            { label: repoName, path: `/repositories/${repoId}/projects` },
            { label: projectName },
          ]}
        />
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1>Issues</h1>
            <p className="text-sm text-muted-foreground mt-1">
              GitHub Issue → AI影響分析 → テストケース生成
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <RefreshCw className="size-4" />
            Sync from GitHub
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
            <Filter className="size-4" />
            Filters
          </button>
        </div>
      </header>

      {/* Issues List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-3">
          {mockIssues.map((issue) => {
            return (
              <div
                key={issue.id}
                onClick={() => navigate(`/repositories/${repoId}/projects/${projectId}/issues/${issue.id}`)}
                className="block bg-card border border-border rounded-lg p-4 hover:border-ring transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStatusIcon(issue.status)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">#{issue.number}</span>
                      <h3 className="font-medium truncate">{issue.title}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs border ${getPriorityBadge(issue.priority)}`}>
                        {issue.priority}
                      </span>
                      {issue.labels.map((label) => (
                        <span key={label} className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right space-y-2 shrink-0">
                    {issue.testCaseCount > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/repositories/${repoId}/projects/${projectId}/issues/${issue.id}/test-cases`);
                        }}
                        className="px-3 py-1 rounded text-xs bg-chart-2/10 text-chart-2 hover:bg-chart-2/20 transition-colors"
                      >
                        {issue.testCaseCount} test cases →
                      </button>
                    ) : (
                      <div className="px-3 py-1 rounded text-xs bg-muted text-muted-foreground">
                        No test cases
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>Assignee: {issue.assignee}</span>
                  <span>Created: {issue.createdAt}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
