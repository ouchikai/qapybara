import { Link, useParams, useNavigate } from 'react-router';
import { Folder, GitBranch, Plus, Calendar, Bug, BarChart3 } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';

const mockProjects = [
  {
    id: 1,
    name: 'v2.5 Release',
    description: 'バージョン2.5のリリース準備',
    status: 'active',
    issueCount: 8,
    testCaseCount: 45,
    bugCount: 4,
    passRate: 92,
    dueDate: '2026-06-15',
  },
  {
    id: 2,
    name: 'Security Enhancement',
    description: 'セキュリティ強化対応',
    status: 'active',
    issueCount: 5,
    testCaseCount: 32,
    bugCount: 1,
    passRate: 100,
    dueDate: '2026-06-30',
  },
  {
    id: 3,
    name: 'Performance Improvement',
    description: 'パフォーマンス改善',
    status: 'planning',
    issueCount: 2,
    testCaseCount: 15,
    bugCount: 0,
    passRate: 0,
    dueDate: '2026-07-15',
  },
];

export function ProjectsPage() {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const repoName = 'finance-portal'; // Mock

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
      planning: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      completed: 'bg-muted text-muted-foreground border-border',
    };
    const labels = {
      active: 'Active',
      planning: 'Planning',
      completed: 'Completed',
    };
    return {
      style: styles[status as keyof typeof styles],
      label: labels[status as keyof typeof labels],
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <Breadcrumb
          items={[
            { label: 'Repositories', path: '/repositories' },
            { label: repoName },
          ]}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1>Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">
              プロジェクト（リリース・施策）単位でIssueを管理
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <Plus className="size-4" />
            New Project
          </button>
        </div>
      </header>

      {/* Project List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockProjects.map((project) => {
            const statusBadge = getStatusBadge(project.status);

            return (
              <div
                key={project.id}
                className="bg-card border border-border rounded-lg p-5 hover:border-ring hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <Link
                    to={`/repositories/${repoId}/projects/${project.id}/issues`}
                    className="flex items-start gap-3 flex-1 hover:opacity-80 transition-opacity"
                  >
                    <div className="p-2 bg-chart-4/10 rounded-md">
                      <Folder className="size-5 text-chart-4" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    </div>
                  </Link>
                  <span className={`px-2 py-1 rounded text-xs border ${statusBadge.style}`}>
                    {statusBadge.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-muted/30 rounded-md p-3">
                    <div className="text-xl font-semibold">{project.issueCount}</div>
                    <div className="text-xs text-muted-foreground mt-1">Issues</div>
                  </div>
                  <div className="bg-muted/30 rounded-md p-3">
                    <div className="text-xl font-semibold">{project.testCaseCount}</div>
                    <div className="text-xs text-muted-foreground mt-1">Test Cases</div>
                  </div>
                  <div className="bg-muted/30 rounded-md p-3">
                    <div className="text-xl font-semibold">{project.passRate}%</div>
                    <div className="text-xs text-muted-foreground mt-1">Pass Rate</div>
                  </div>
                  <button
                    onClick={() => navigate(`/repositories/${repoId}/projects/${project.id}/bugs`)}
                    className="bg-destructive/10 rounded-md p-3 hover:bg-destructive/20 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-xl font-semibold text-destructive">{project.bugCount}</div>
                      <Bug className="size-4 text-destructive" />
                    </div>
                    <div className="text-xs text-destructive mt-1">Bugs →</div>
                  </button>
                </div>

                <button
                  onClick={() => navigate(`/repositories/${repoId}/projects/${project.id}/dashboard`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-md hover:bg-primary/20 transition-colors"
                >
                  <BarChart3 className="size-4" />
                  View Dashboard
                </button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-border mt-3">
                  <Calendar className="size-3" />
                  Due: {project.dueDate}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
