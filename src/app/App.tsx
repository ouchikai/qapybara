import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { RepositoriesPage } from './components/RepositoriesPage';
import { ProjectsPage } from './components/ProjectsPage';
import { ProjectDashboard } from './components/ProjectDashboard';
import { IssuesPage } from './components/IssuesPage';
import { IssueDetailPage } from './components/IssueDetailPage';
import { TestCasesPage } from './components/TestCasesPage';
import { BugsPage } from './components/BugsPage';
import { RepositorySettingsPage } from './components/RepositorySettingsPage';
import { UsersPage } from './components/UsersPage';

function ProtectedRoutes() {
  const { user, login } = useAuth();

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/repositories" replace />} />
        <Route path="repositories" element={<RepositoriesPage />} />
        <Route path="repositories/:repoId/settings" element={<RepositorySettingsPage />} />
        <Route path="repositories/:repoId/projects" element={<ProjectsPage />} />
        <Route path="repositories/:repoId/projects/:projectId/dashboard" element={<ProjectDashboard />} />
        <Route path="repositories/:repoId/projects/:projectId/issues" element={<IssuesPage />} />
        <Route path="repositories/:repoId/projects/:projectId/issues/:issueId" element={<IssueDetailPage />} />
        <Route path="repositories/:repoId/projects/:projectId/issues/:issueId/test-cases" element={<TestCasesPage />} />
        <Route path="repositories/:repoId/projects/:projectId/bugs" element={<BugsPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ProtectedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
