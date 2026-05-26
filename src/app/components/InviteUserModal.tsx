import { useState } from 'react';
import { X, Mail, Send, CheckCircle } from 'lucide-react';

interface InviteUserModalProps {
  onClose: () => void;
  onInvite: (email: string, role: 'admin' | 'qa' | 'developer' | 'viewer') => void;
}

export function InviteUserModal({ onClose, onInvite }: InviteUserModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'qa' | 'developer' | 'viewer'>('qa');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);

    // Simulate sending email
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);

      // Wait a bit then call the callback
      setTimeout(() => {
        onInvite(email, role);
      }, 1000);
    }, 1500);
  };

  if (isSent) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md p-8 text-center">
          <div className="size-16 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="size-8 text-chart-2" />
          </div>
          <h2 className="mb-2">招待メール送信完了</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {email} に招待メールを送信しました。
            <br />
            ユーザーはメール内のリンクからログインできます。
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Mail className="size-5 text-primary" />
            <h2>Invite User</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">
              招待メールが送信され、ユーザーはリンクからログインできます
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="admin">Admin - 全ての権限</option>
              <option value="qa">QA - テストケース管理・実行</option>
              <option value="developer">Developer - Issue・バグ対応</option>
              <option value="viewer">Viewer - 閲覧のみ</option>
            </select>
          </div>

          <div className="bg-muted/50 border border-border rounded-md p-3">
            <div className="text-sm font-medium mb-2">招待フロー</div>
            <ol className="text-xs text-muted-foreground space-y-1">
              <li>1. 招待メールが {email || 'ユーザー'} に送信されます</li>
              <li>2. メール内の「ログイン」リンクをクリック</li>
              <li>3. パスワード設定画面でパスワードを作成</li>
              <li>4. Qapybaraにアクセス可能になります</li>
            </ol>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!email || isSending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSending ? (
              <>
                <div className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Send Invite
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
