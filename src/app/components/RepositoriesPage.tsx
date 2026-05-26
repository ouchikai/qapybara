import { Link, useNavigate } from 'react-router';
import { GitBranch, RefreshCw, Plus, Folder, Settings } from 'lucide-react';

const mockRepositories = [
  {
    id: 1,
    name: 'finance-portal',
    owner: 'acme-corp',
    description: '金融ポータルのフロントエンド',
    projectCount: 3,
    issueCount: 15,
    lastSync: '2026-05-22 10:30',
  },
  {
    id: 2,
    name: 'payment-service',
    owner: 'acme-corp',
    description: '決済サービスのバックエンドAPI',
    projectCount: 2,
    issueCount: 8,
    lastSync: '2026-05-22 09:15',
  },
  {
    id: 3,
    name: 'user-management',
    owner: 'acme-corp',
    description: 'ユーザー管理・認証サービス',
    projectCount: 1,
    issueCount: 12,
    lastSync: '2026-05-21 16:45',
  },
];

export function RepositoriesPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1>Repositories</h1>
            <p className="text-sm text-muted-foreground mt-1">
              GitHub同期済みリポジトリ一覧
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
              <RefreshCw className="size-4" />
              Sync All
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              <Plus className="size-4" />
              Add Repository
            </button>
          </div>
        </div>
      </header>

      {/* Repository List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockRepositories.map((repo) => (
            <div
              key={repo.id}
              className="bg-card border border-border rounded-lg p-5 hover:border-ring hover:shadow-sm transition-all relative"
            >
              <Link
                to={`/repositories/${repo.id}/projects`}
                className="block"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <GitBranch className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{repo.name}</h3>
                    <p className="text-sm text-muted-foreground">{repo.owner}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/repositories/${repo.id}/settings`);
                    }}
                    className="p-1.5 hover:bg-accent rounded transition-colors"
                    title="Repository Settings"
                  >
                    <Settings className="size-4 text-muted-foreground" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {repo.description}
                </p>

                <div className="flex items-center gap-4 text-sm mb-3">
                  <div className="flex items-center gap-1">
                    <Folder className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{repo.projectCount} projects</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitBranch className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{repo.issueCount} issues</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground pt-3 border-t border-border">
                  Last sync: {repo.lastSync}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
