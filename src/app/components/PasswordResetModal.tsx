import { useState } from 'react';
import { X, Mail, Send, CheckCircle, AlertTriangle } from 'lucide-react';

interface PasswordResetModalProps {
  userEmail: string;
  userName: string;
  onClose: () => void;
}

export function PasswordResetModal({ userEmail, userName, onClose }: PasswordResetModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSendReset = () => {
    setIsSending(true);

    // Simulate sending email
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
    }, 1500);
  };

  if (isSent) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md p-8 text-center">
          <div className="size-16 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="size-8 text-chart-2" />
          </div>
          <h2 className="mb-2">パスワードリセットメール送信完了</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {userEmail} にパスワードリセットメールを送信しました。
            <br />
            ユーザーはメール内のリンクから新しいパスワードを設定できます。
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
            <h2>パスワードリセット</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-chart-4/10 border border-chart-4/20 rounded-md p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-chart-4 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-chart-4">
                <p className="font-medium mb-1">パスワードを初期化します</p>
                <p>この操作により、ユーザーの現在のパスワードが無効になります。</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div>
              <div className="text-sm text-muted-foreground">対象ユーザー</div>
              <div className="font-medium">{userName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">メールアドレス</div>
              <div className="font-medium">{userEmail}</div>
            </div>
          </div>

          <div className="bg-muted/50 border border-border rounded-md p-3 mb-6">
            <div className="text-sm font-medium mb-2">リセットフロー</div>
            <ol className="text-xs text-muted-foreground space-y-1">
              <li>1. パスワードリセットメールが送信されます</li>
              <li>2. メール内の「パスワード再設定」リンクをクリック</li>
              <li>3. 新しいパスワードを入力して設定</li>
              <li>4. 新しいパスワードでログイン可能になります</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSendReset}
            disabled={isSending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSending ? (
              <>
                <div className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                送信中...
              </>
            ) : (
              <>
                <Send className="size-4" />
                リセットメール送信
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
