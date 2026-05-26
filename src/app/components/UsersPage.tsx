import { useState } from 'react';
import { Users as UsersIcon, Plus, Mail, Shield, MoreVertical, CheckCircle, Clock, XCircle, KeyRound } from 'lucide-react';
import { InviteUserModal } from './InviteUserModal';
import { PasswordResetModal } from './PasswordResetModal';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'qa' | 'developer' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  invitedAt: string;
  lastLogin?: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    email: 'tanaka@example.com',
    name: '田中太郎',
    role: 'admin',
    status: 'active',
    invitedAt: '2026-04-10',
    lastLogin: '2026-05-22 10:30',
  },
  {
    id: 2,
    email: 'sato@example.com',
    name: '佐藤花子',
    role: 'qa',
    status: 'active',
    invitedAt: '2026-04-15',
    lastLogin: '2026-05-22 09:15',
  },
  {
    id: 3,
    email: 'suzuki@example.com',
    name: '鈴木一郎',
    role: 'developer',
    status: 'active',
    invitedAt: '2026-04-18',
    lastLogin: '2026-05-21 16:45',
  },
  {
    id: 4,
    email: 'yamada@example.com',
    name: '山田次郎',
    role: 'qa',
    status: 'pending',
    invitedAt: '2026-05-20',
  },
  {
    id: 5,
    email: 'nakamura@example.com',
    name: '中村美咲',
    role: 'viewer',
    status: 'inactive',
    invitedAt: '2026-03-01',
    lastLogin: '2026-04-30 14:20',
  },
];

export function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState<number | null>(null);

  const handleInviteUser = (email: string, role: User['role']) => {
    const newUser: User = {
      id: users.length + 1,
      email,
      name: email.split('@')[0],
      role,
      status: 'pending',
      invitedAt: new Date().toISOString().split('T')[0],
    };
    setUsers([newUser, ...users]);
    setShowInviteModal(false);
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Admin',
      qa: 'QA',
      developer: 'Developer',
      viewer: 'Viewer',
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-destructive/10 text-destructive border-destructive/20',
      qa: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      developer: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
      viewer: 'bg-muted text-muted-foreground border-border',
    };
    return styles[role as keyof typeof styles] || styles.viewer;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: { style: 'bg-chart-2/10 text-chart-2', icon: CheckCircle },
      pending: { style: 'bg-chart-4/10 text-chart-4', icon: Clock },
      inactive: { style: 'bg-muted text-muted-foreground', icon: XCircle },
    };
    return styles[status as keyof typeof styles] || styles.inactive;
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1>User Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              チームメンバーの招待と権限管理
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" />
            Invite User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-2xl font-semibold">{stats.total}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Users</div>
          </div>
          <div className="bg-chart-2/10 rounded-lg p-3">
            <div className="text-2xl font-semibold text-chart-2">{stats.active}</div>
            <div className="text-sm text-chart-2 mt-1">Active</div>
          </div>
          <div className="bg-chart-4/10 rounded-lg p-3">
            <div className="text-2xl font-semibold text-chart-4">{stats.pending}</div>
            <div className="text-sm text-chart-4 mt-1">Pending</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-2xl font-semibold">{stats.admins}</div>
            <div className="text-sm text-muted-foreground mt-1">Admins</div>
          </div>
        </div>
      </header>

      {/* Users List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium border-r border-border w-12">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium border-r border-border">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium border-r border-border w-32">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium border-r border-border w-32">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium border-r border-border w-40">Invited</th>
                <th className="px-4 py-3 text-left text-sm font-medium border-r border-border w-40">Last Login</th>
                <th className="px-4 py-3 text-left text-sm font-medium w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const statusBadge = getStatusBadge(user.status);
                const StatusIcon = statusBadge.icon;

                return (
                  <tr key={user.id} className="border-t border-border hover:bg-accent/50">
                    <td className="px-4 py-3 text-sm border-r border-border text-muted-foreground">
                      {user.id}
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-border">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Mail className="size-3" />
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-border">
                      <div className="flex items-center gap-2">
                        <Shield className="size-4 text-muted-foreground" />
                        <span className={`px-2 py-1 rounded text-xs border ${getRoleBadge(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-border">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="size-4" />
                        <span className={`px-2 py-1 rounded text-xs ${statusBadge.style}`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-border text-muted-foreground">
                      {user.invitedAt}
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-border text-muted-foreground">
                      {user.lastLogin || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm relative">
                      <button
                        onClick={() => setShowUserMenu(showUserMenu === user.id ? null : user.id)}
                        className="p-1 hover:bg-accent rounded transition-colors"
                      >
                        <MoreVertical className="size-4" />
                      </button>

                      {showUserMenu === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-md shadow-lg z-10">
                          <button
                            onClick={() => {
                              setResetPasswordUser(user);
                              setShowUserMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-left"
                          >
                            <KeyRound className="size-4" />
                            パスワードリセット
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Implement deactivate
                              setShowUserMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-left text-destructive"
                          >
                            <XCircle className="size-4" />
                            無効化
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteUser}
        />
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <PasswordResetModal
          userEmail={resetPasswordUser.email}
          userName={resetPasswordUser.name}
          onClose={() => setResetPasswordUser(null)}
        />
      )}
    </div>
  );
}
