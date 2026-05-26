import { useState } from 'react';
import { useParams } from 'react-router';
import { LayoutGrid, List, Plus, Settings, Filter, Search } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { BugKanban } from './BugKanban';
import { BugList } from './BugList';
import { BugReportModal } from './BugReportModal';
import { LaneSettingsModal } from './LaneSettingsModal';

export interface Bug {
  id: number;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: string;
  assignee: string;
  reporter: string;
  createdAt: string;
  testCaseId?: number;
  testCaseTitle?: string;
  issueId?: number;
  issueNumber?: number;
  issueTitle?: string;
  attachments?: string[];
}

export interface Lane {
  id: string;
  title: string;
  color: string;
}

const defaultLanes: Lane[] = [
  { id: 'new', title: 'New', color: '#3b82f6' },
  { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
  { id: 'ready-for-test', title: 'Ready for Test', color: '#8b5cf6' },
  { id: 'closed', title: 'Closed', color: '#10b981' },
];

const mockBugs: Bug[] = [
  {
    id: 1,
    title: '権限チェックでタイムアウトが発生',
    description: 'CSV大量データエクスポート時にタイムアウトが発生する。10万件以上のデータで再現',
    severity: 'high',
    status: 'in-progress',
    assignee: '佐藤花子',
    reporter: '鈴木一郎',
    createdAt: '2026-05-22 09:30',
    testCaseId: 2,
    testCaseTitle: 'CSV: 大量データエクスポート（10万件）',
    attachments: ['error-log.txt', 'screenshot.png'],
  },
  {
    id: 2,
    title: 'PDFエクスポートで日本語が文字化け',
    description: '特定の環境でPDF生成時に日本語フォントが正しく埋め込まれない',
    severity: 'medium',
    status: 'new',
    assignee: '',
    reporter: '田中太郎',
    createdAt: '2026-05-21 15:20',
    testCaseId: 3,
    testCaseTitle: 'PDF: 日本語文字化け確認',
  },
  {
    id: 3,
    title: 'セッションタイムアウト後のリダイレクト不正',
    description: 'セッションタイムアウト後に元のページではなくトップページにリダイレクトされる',
    severity: 'low',
    status: 'ready-for-test',
    assignee: '山田次郎',
    reporter: '田中太郎',
    createdAt: '2026-05-20 11:45',
  },
  {
    id: 4,
    title: 'API レート制限エラーのハンドリング不足',
    description: 'GitHub API のレート制限に達した際のエラーメッセージが不明瞭',
    severity: 'critical',
    status: 'new',
    assignee: '',
    reporter: '鈴木一郎',
    createdAt: '2026-05-22 14:10',
  },
];

export function BugsPage() {
  const { repoId, projectId } = useParams();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLaneSettings, setShowLaneSettings] = useState(false);
  const [bugs, setBugs] = useState<Bug[]>(mockBugs);
  const [lanes, setLanes] = useState<Lane[]>(defaultLanes);
  const [searchQuery, setSearchQuery] = useState('');

  const repoName = 'finance-portal'; // Mock
  const projectName = 'v2.5 Release'; // Mock

  const handleCreateBug = (bug: Omit<Bug, 'id' | 'createdAt'>) => {
    const newBug: Bug = {
      ...bug,
      id: bugs.length + 1,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setBugs([newBug, ...bugs]);
    setShowReportModal(false);
  };

  const handleUpdateBugStatus = (bugId: number, newStatus: string) => {
    setBugs(bugs.map(bug =>
      bug.id === bugId ? { ...bug, status: newStatus } : bug
    ));
  };

  const handleSaveLanes = (newLanes: Lane[]) => {
    setLanes(newLanes);
    setShowLaneSettings(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <Breadcrumb
          items={[
            { label: 'Repositories', path: '/repositories' },
            { label: repoName, path: `/repositories/${repoId}/projects` },
            { label: projectName, path: `/repositories/${repoId}/projects/${projectId}/issues` },
            { label: 'Bugs' },
          ]}
        />
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1>Bugs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              テスト失敗時のバグ報告・トラッキング
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-md">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <List className="size-4" />
              </button>
            </div>
            {viewMode === 'kanban' && (
              <button
                onClick={() => setShowLaneSettings(true)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
              >
                <Settings className="size-4" />
                Lanes
              </button>
            )}
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-4" />
              Report Bug
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search bugs..."
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

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <BugKanban
            bugs={bugs}
            lanes={lanes}
            onUpdateStatus={handleUpdateBugStatus}
          />
        ) : (
          <BugList bugs={bugs} />
        )}
      </div>

      {/* Modals */}
      {showReportModal && (
        <BugReportModal
          onClose={() => setShowReportModal(false)}
          onSubmit={handleCreateBug}
        />
      )}

      {showLaneSettings && (
        <LaneSettingsModal
          lanes={lanes}
          onClose={() => setShowLaneSettings(false)}
          onSave={handleSaveLanes}
        />
      )}
    </div>
  );
}
