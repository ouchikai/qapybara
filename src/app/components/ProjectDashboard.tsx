import { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { Breadcrumb } from './Breadcrumb';
import { AIChat } from './AIChat';
import {
  Bug,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  GitBranch,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  MessageCircle,
  X,
  Download,
  ChevronDown,
  History,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Get the most recent Monday
const getMostRecentMonday = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // if Sunday, go back 6 days, else go back to Monday
  d.setDate(d.getDate() - diff);
  return d;
};

// Generate mock weekly report data (past 12 weeks)
const generateWeeklyReports = () => {
  const reports = [];
  const today = new Date();
  const mostRecentMonday = getMostRecentMonday(today);

  for (let i = 0; i < 12; i++) {
    const monday = new Date(mostRecentMonday);
    monday.setDate(mostRecentMonday.getDate() - (i * 7));

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const weekNumber = Math.ceil((monday.getDate() + 6 - monday.getDay()) / 7);

    reports.push({
      date: monday.toISOString().split('T')[0],
      weekLabel: `Week ${52 - i}`, // Mock week number
      displayDate: `${monday.toLocaleDateString('ja-JP', {
        month: '2-digit',
        day: '2-digit'
      })} - ${sunday.toLocaleDateString('ja-JP', {
        month: '2-digit',
        day: '2-digit'
      })}`,
      fullDate: monday.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      summary: {
        totalBugs: 71 - i * 2 - Math.floor(Math.random() * 3),
        weeklyAverage: 8.9 - (i * 0.2) + (Math.random() * 1 - 0.5),
        resolutionRate: 96 + Math.random() * 4,
        criticalRate: 26.8 - (i * 0.5) + (Math.random() * 2 - 1),
        totalIssues: Math.max(8 - Math.floor(i / 2), 3),
        totalTestCases: 45 + i,
        testPassRate: 88 + Math.random() * 8,
        avgTimeToResolve: 2.3 + (Math.random() * 0.8 - 0.4),
      },
    });
  }

  return reports;
};

export function ProjectDashboard() {
  const { repoId, projectId } = useParams();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const repoName = 'finance-portal'; // Mock
  const projectName = 'v2.5 Release'; // Mock

  const weeklyReports = useMemo(() => generateWeeklyReports(), []);

  // Set initial date to most recent report (first item)
  useState(() => {
    if (weeklyReports.length > 0) {
      setSelectedDate(weeklyReports[0].date);
    }
  });

  // Get current data based on selected date
  const currentReport = weeklyReports.find(d => d.date === selectedDate) || weeklyReports[0];
  const summary = currentReport?.summary || weeklyReports[0].summary;

  // Export to PDF functionality
  const handleExportPDF = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <title>${projectName} 週次レポート - ${currentReport?.displayDate}</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }
          h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 20px 0;
          }
          .summary-card {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
          }
          .summary-card h3 { margin: 0; font-size: 14px; color: #7f8c8d; }
          .summary-card .number { font-size: 28px; font-weight: bold; color: #3498db; margin: 5px 0; }
          .section { margin: 30px 0; }
          .section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; }
          .insight { background: #fff3cd; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #ffc107; }
          .footer { margin-top: 40px; text-align: center; color: #7f8c8d; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${projectName} 週次QAレポート</h1>
        <p>対象期間: ${currentReport?.displayDate} | プロジェクト: ${projectName} | 生成日: ${currentReport?.fullDate}</p>

        <div class="summary-grid">
          <div class="summary-card">
            <h3>総バグ数</h3>
            <div class="number">${summary.totalBugs}</div>
            <p>件</p>
          </div>
          <div class="summary-card">
            <h3>週平均</h3>
            <div class="number">${summary.weeklyAverage.toFixed(1)}</div>
            <p>件/週</p>
          </div>
          <div class="summary-card">
            <h3>解決率</h3>
            <div class="number">${summary.resolutionRate.toFixed(1)}</div>
            <p>%</p>
          </div>
          <div class="summary-card">
            <h3>クリティカル率</h3>
            <div class="number">${summary.criticalRate.toFixed(1)}</div>
            <p>%</p>
          </div>
        </div>

        <div class="section">
          <h2>追加メトリクス</h2>
          <div class="summary-grid">
            <div class="summary-card">
              <h3>Issues</h3>
              <div class="number">${summary.totalIssues}</div>
            </div>
            <div class="summary-card">
              <h3>Test Cases</h3>
              <div class="number">${summary.totalTestCases}</div>
            </div>
            <div class="summary-card">
              <h3>Test Pass Rate</h3>
              <div class="number">${summary.testPassRate.toFixed(1)}%</div>
            </div>
            <div class="summary-card">
              <h3>Avg Resolution</h3>
              <div class="number">${summary.avgTimeToResolve.toFixed(1)}d</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>AI分析インサイト</h2>
          <div class="insight">
            <strong>セキュリティ関連バグが多発</strong><br>
            権限チェックとセッション管理に関するバグが全体の21%を占めています
          </div>
          <div class="insight">
            <strong>パフォーマンス改善が必要</strong><br>
            CSV/PDFエクスポート機能でタイムアウトが複数報告されています
          </div>
          <div class="insight">
            <strong>解決率が高水準</strong><br>
            週次の解決率が${summary.resolutionRate.toFixed(1)}%を維持しており、優れた対応速度を示しています
          </div>
        </div>

        <div class="footer">
          Generated by Qapybara - AI-Powered QA Workbench
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const bugTrendData = [
    { week: 'Week 1', bugs: 12, resolved: 10 },
    { week: 'Week 2', bugs: 15, resolved: 14 },
    { week: 'Week 3', bugs: 8, resolved: 8 },
    { week: 'Week 4', bugs: 10, resolved: 10 },
    { week: 'Week 5', bugs: 9, resolved: 9 },
    { week: 'Week 6', bugs: 11, resolved: 11 },
    { week: 'Week 7', bugs: 6, resolved: 6 },
  ];

  const severityData = [
    { name: 'Critical', value: 19, color: '#ef4444' },
    { name: 'High', value: 25, color: '#f97316' },
    { name: 'Medium', value: 18, color: '#eab308' },
    { name: 'Low', value: 9, color: '#84cc16' },
  ];

  const categoryData = [
    { category: 'Security', count: 15 },
    { category: 'Performance', count: 12 },
    { category: 'Functional', count: 28 },
    { category: 'UI/UX', count: 16 },
  ];

  const issueProgressData = [
    { name: 'Open', value: 2, color: '#3b82f6' },
    { name: 'In Progress', value: 4, color: '#f59e0b' },
    { name: 'Resolved', value: 2, color: '#10b981' },
  ];

  const insights = [
    {
      title: 'セキュリティ関連バグが多発',
      description: '権限チェックとセッション管理に関するバグが全体の21%を占めています',
      severity: 'high',
      icon: AlertTriangle,
    },
    {
      title: 'パフォーマンス改善が必要',
      description: 'CSV/PDFエクスポート機能でタイムアウトが複数報告されています',
      severity: 'medium',
      icon: TrendingUp,
    },
    {
      title: '解決率が高水準',
      description: '週次の解決率が100%を維持しており、優れた対応速度を示しています',
      severity: 'positive',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <Breadcrumb
          items={[
            { label: 'Repositories', path: '/repositories' },
            { label: repoName, path: `/repositories/${repoId}/projects` },
            { label: projectName, path: `/repositories/${repoId}/projects/${projectId}/issues` },
            { label: 'Dashboard' },
          ]}
        />
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1>Project Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              週次QAレポート（毎週月曜日生成）
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Week Picker */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
              >
                <Calendar className="size-4" />
                <span className="text-sm">{currentReport?.displayDate || '週を選択'}</span>
                <ChevronDown className="size-4" />
              </button>

              {showDatePicker && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-10 max-h-96 overflow-auto">
                  <div className="p-2">
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border-b border-border">
                      <History className="size-4" />
                      <span>過去12週間のレポート</span>
                    </div>
                    {weeklyReports.map((report, index) => (
                      <button
                        key={report.date}
                        onClick={() => {
                          setSelectedDate(report.date);
                          setShowDatePicker(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors ${
                          selectedDate === report.date ? 'bg-primary/10 text-primary font-medium' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{report.displayDate}</span>
                          {index === 0 && (
                            <span className="text-xs px-2 py-0.5 bg-chart-2/20 text-chart-2 rounded">
                              最新
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          生成: {report.fullDate}（月曜日）
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Export PDF Button */}
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Download className="size-4" />
              PDF Export
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-muted-foreground">総バグ数</h3>
              <Bug className="size-5 text-destructive" />
            </div>
            <div className="text-3xl font-semibold">{summary.totalBugs}</div>
            <p className="text-xs text-muted-foreground mt-1">件</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-muted-foreground">週平均</h3>
              <TrendingUp className="size-5 text-chart-4" />
            </div>
            <div className="text-3xl font-semibold">{summary.weeklyAverage.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">件/週</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-muted-foreground">解決率</h3>
              <CheckCircle2 className="size-5 text-chart-2" />
            </div>
            <div className="text-3xl font-semibold">{summary.resolutionRate.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">%</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-muted-foreground">クリティカル率</h3>
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div className="text-3xl font-semibold">{summary.criticalRate.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">%</p>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Issues</span>
            </div>
            <div className="text-2xl font-semibold">{summary.totalIssues}</div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Test Cases</span>
            </div>
            <div className="text-2xl font-semibold">{summary.totalTestCases}</div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Test Pass Rate</span>
            </div>
            <div className="text-2xl font-semibold">{summary.testPassRate.toFixed(1)}%</div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Resolution</span>
            </div>
            <div className="text-2xl font-semibold">{summary.avgTimeToResolve.toFixed(1)}d</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bug Trend Chart */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="size-5 text-primary" />
              <h2>バグ発生・解決トレンド</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bugTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bugs"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="発生"
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="解決"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Severity Distribution */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="size-5 text-primary" />
              <h2>重要度別分布</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category Distribution */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="size-5 text-primary" />
              <h2>カテゴリ別バグ数</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="category" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Issue Progress */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="size-5 text-primary" />
              <h2>Issue進捗状況</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={issueProgressData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {issueProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights */}
        <div className="mb-6">
          <h2 className="mb-4">AI分析インサイト</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              const colorClasses = {
                high: 'bg-destructive/10 border-destructive/20 text-destructive',
                medium: 'bg-chart-4/10 border-chart-4/20 text-chart-4',
                positive: 'bg-chart-2/10 border-chart-2/20 text-chart-2',
              };

              return (
                <div
                  key={index}
                  className={`rounded-lg p-4 border-l-4 ${colorClasses[insight.severity as keyof typeof colorClasses]}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="size-5 mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">{insight.title}</h4>
                      <p className="text-sm opacity-90">{insight.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 size-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center group"
        >
          <MessageCircle className="size-6" />
          <span className="absolute -top-1 -right-1 size-5 bg-chart-2 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            AI
          </span>
        </button>
      )}

      {/* Floating Chat Panel */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl rounded-lg overflow-hidden z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="relative h-full">
            <button
              onClick={() => setIsChatOpen(false)}
              className="absolute top-3 right-3 z-10 p-1 hover:bg-accent rounded transition-colors"
            >
              <X className="size-4" />
            </button>
            <AIChat projectName={projectName} />
          </div>
        </div>
      )}
    </div>
  );
}
