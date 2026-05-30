/**
 * Qapybara Dev Seed
 *
 * Run: npm run prisma:seed
 *
 * Creates / updates:
 *  - Organization  (slug: "default-org")
 *  - Users + Better Auth credential accounts
 *  - Active memberships
 *  - Repository: finance-portal, payment-service, user-management
 *  - Projects with hardcoded IDs matching InMemoryProjectRepository
 *    (so navigation from either InMemory or Prisma data resolves correctly)
 *  - Issues #123, #124, #125 under v2.5 Release, with test cases
 *  - Custom field definitions for finance-portal
 *
 * Design: fully idempotent — safe to run multiple times.
 */

import {
  BugSeverity,
  BugStatus,
  CustomFieldType,
  IssuePriority,
  IssueStatus,
  MembershipStatus,
  PrismaClient,
  ProjectStatus,
  TestCaseStatus,
  UserRole,
} from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

// ─── Password hashing (matches src/lib/auth/password.ts) ─────────────────────

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `s1$${salt}$${derived}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Upsert a user; if the user already exists keep their existing passwordHash
 * so running seed again doesn't invalidate active sessions.
 */
async function upsertUser(email, displayName, passwordHash) {
  return prisma.user.upsert({
    where: { email },
    update: { displayName, emailVerified: true },
    create: { email, displayName, emailVerified: true, passwordHash },
  });
}

/**
 * Upsert a Better Auth credential account.
 *
 * IMPORTANT: Better Auth's emailAndPassword plugin identifies credential
 * accounts by (providerId="credential", accountId=email). Using user.id as
 * accountId (as the original seed did) breaks the lookup path.
 */
async function upsertAccount(userId, email, passwordHash) {
  return prisma.account.upsert({
    where: { providerId_accountId: { providerId: "credential", accountId: email } },
    update: { password: passwordHash },
    create: {
      userId,
      accountId: email,          // ← must be the email address
      providerId: "credential",
      password: passwordHash,
    },
  });
}

async function upsertMembership(organizationId, userId, role) {
  return prisma.membership.upsert({
    where: { organizationId_userId: { organizationId, userId } },
    update: { role, status: MembershipStatus.ACTIVE, acceptedAt: new Date() },
    create: {
      organizationId,
      userId,
      role,
      status: MembershipStatus.ACTIVE,
      invitedAt: new Date("2026-04-15T00:00:00.000Z"),
      acceptedAt: new Date("2026-05-01T00:00:00.000Z"),
    },
  });
}

/**
 * Create or locate a project with a SPECIFIC id.
 *
 * Why hardcoded IDs?
 * InMemoryProjectRepository returns ids like "project_v2_5_release".
 * When users navigate via InMemory data (e.g. during first load before DB is
 * seeded) the URL carries those ids. The DB project must have the same id so
 * the issue-list API can resolve it.
 *
 * Algorithm:
 *   1. If a project with this exact id already exists → return it (noop).
 *   2. Otherwise delete any project with the same (repositoryId, slug)
 *      (cascade removes its issues / test-cases / bugs) then create fresh.
 */
async function findOrCreateProject(id, organizationId, repositoryId, slug, name, status, dueDate) {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (existing) {
    return prisma.project.update({ where: { id }, data: { name, status, dueDate } });
  }

  // Remove any conflicting project (same repo + slug but different id)
  await prisma.project.deleteMany({ where: { repositoryId, slug } });

  return prisma.project.create({
    data: { id, organizationId, repositoryId, slug, name, status, dueDate },
  });
}

/**
 * Create or locate an issue with a SPECIFIC id.
 * Similarly, InMemoryIssueRepository returns ids like "issue_123".
 */
async function findOrCreateIssue(
  id,
  organizationId,
  projectId,
  externalIssueNumber,
  title,
  status,
  assigneeId,
  createdAt,
  priority = null,
  description = null,
  labels = [],
  changedFiles = [],
) {
  const existing = await prisma.issue.findUnique({ where: { id } });
  if (existing) {
    return prisma.issue.update({
      where: { id },
      data: {
        title,
        status,
        assigneeId,
        priority,
        description,
        labels,
        changedFiles,
      },
    });
  }

  // Remove any conflicting issue (same project + external number)
  await prisma.issue.deleteMany({ where: { projectId, externalIssueNumber } });

  return prisma.issue.create({
    data: {
      id,
      organizationId,
      projectId,
      externalIssueNumber,
      title,
      status,
      assigneeId,
      createdAt,
      priority,
      description,
      labels,
      changedFiles,
    },
  });
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding Qapybara database…\n");

  // ── 1. Organization ────────────────────────────────────────────────────────

  const org = await prisma.organization.upsert({
    where: { slug: "default-org" },
    update: { name: "acme-corp" },
    create: { slug: "default-org", name: "acme-corp" },
  });
  console.log(`✓ Organization: ${org.slug} (id: ${org.id})`);

  // ── 2. Users + credentials ─────────────────────────────────────────────────

  const usersConfig = [
    { email: "admin@qapybara.dev",   displayName: "Admin User", role: UserRole.OWNER,     password: "password" },
    { email: "tanaka@example.com",   displayName: "田中太郎",   role: UserRole.ADMIN,     password: "password123" },
    { email: "sato@example.com",     displayName: "佐藤花子",   role: UserRole.QA,        password: "password123" },
    { email: "suzuki@example.com",   displayName: "鈴木一郎",   role: UserRole.DEVELOPER, password: "password123" },
    { email: "yamada@example.com",   displayName: "山田次郎",   role: UserRole.QA,        password: "password123" },
    { email: "nakamura@example.com", displayName: "中村美咲",   role: UserRole.VIEWER,    password: "password123" },
  ];

  const usersByEmail = new Map();

  for (const cfg of usersConfig) {
    const hash = hashPassword(cfg.password);
    const user = await upsertUser(cfg.email, cfg.displayName, hash);
    await upsertAccount(user.id, user.email, hash);
    await upsertMembership(org.id, user.id, cfg.role);
    usersByEmail.set(cfg.email, user);
  }

  const tanaka  = usersByEmail.get("tanaka@example.com");
  const sato    = usersByEmail.get("sato@example.com");
  const suzuki  = usersByEmail.get("suzuki@example.com");
  const yamada  = usersByEmail.get("yamada@example.com");
  const nakamura = usersByEmail.get("nakamura@example.com");

  console.log(`✓ Users (${usersConfig.length}) + credentials + memberships`);

  // ── 3. Repositories ────────────────────────────────────────────────────────

  const repositoriesConfig = [
    { slug: "finance-portal",  name: "finance-portal",  description: "金融ポータルのフロントエンド",     lastSync: "2026-05-22T10:30:00.000Z" },
    { slug: "payment-service", name: "payment-service", description: "決済サービスのバックエンドAPI",    lastSync: "2026-05-22T09:15:00.000Z" },
    { slug: "user-management", name: "user-management", description: "ユーザー管理・認証サービス",       lastSync: "2026-05-21T16:45:00.000Z" },
  ];

  const reposBySlug = new Map();

  for (const r of repositoriesConfig) {
    const repo = await prisma.repository.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: r.slug } },
      update: { name: r.name, description: r.description, updatedAt: new Date(r.lastSync) },
      create: { organizationId: org.id, slug: r.slug, name: r.name, description: r.description, updatedAt: new Date(r.lastSync) },
    });
    reposBySlug.set(r.slug, repo);
  }

  const financeRepo     = reposBySlug.get("finance-portal");
  const paymentRepo     = reposBySlug.get("payment-service");
  const userMgmtRepo    = reposBySlug.get("user-management");

  console.log(`✓ Repositories (${repositoriesConfig.length})`);

  // ── 4. Projects (Figma Make JSONに合わせる) ──────────────────────────────

  const targetProjectSlugs = [
    "v2-5-release",
    "security-enhancement",
    "performance-improvement",
    "api-v3-migration",
    "oauth-2-0-implementation",
  ];

  const staleProjects = await prisma.project.findMany({
    where: {
      organizationId: org.id,
      slug: { notIn: targetProjectSlugs },
    },
    select: { id: true },
  });

  if (staleProjects.length > 0) {
    await prisma.project.deleteMany({ where: { id: { in: staleProjects.map((p) => p.id) } } });
  }

  const v25 = await findOrCreateProject(
    "project_v2_5_release",
    org.id,
    financeRepo.id,
    "v2-5-release",
    "v2.5 Release",
    ProjectStatus.ACTIVE,
    new Date("2026-06-15T00:00:00.000Z"),
  );

  const secEnhancement = await findOrCreateProject(
    "project_security_enhancement",
    org.id,
    financeRepo.id,
    "security-enhancement",
    "Security Enhancement",
    ProjectStatus.ACTIVE,
    new Date("2026-06-30T00:00:00.000Z"),
  );

  const perfImprovement = await findOrCreateProject(
    "project_performance_improvement",
    org.id,
    financeRepo.id,
    "performance-improvement",
    "Performance Improvement",
    ProjectStatus.PLANNING,
    new Date("2026-07-15T00:00:00.000Z"),
  );

  const apiV3Migration = await findOrCreateProject(
    "project_api_v3_migration",
    org.id,
    paymentRepo.id,
    "api-v3-migration",
    "API v3 Migration",
    ProjectStatus.ACTIVE,
    new Date("2026-07-01T00:00:00.000Z"),
  );

  const oauthImplementation = await findOrCreateProject(
    "project_oauth_2_0_implementation",
    org.id,
    userMgmtRepo.id,
    "oauth-2-0-implementation",
    "OAuth 2.0 Implementation",
    ProjectStatus.PLANNING,
    new Date("2026-08-01T00:00:00.000Z"),
  );

  console.log("✓ Projects (5) created from Figma Make JSON");

  // ── 5. Issues (Figma Make JSONに合わせる) ─────────────────────────────────

  // Legacy issue trees from old seeds are removed to keep fixture counts stable.
  await prisma.issue.deleteMany({ where: { organizationId: org.id } });

  const issue123 = await findOrCreateIssue(
    "issue_123",
    org.id,
    v25.id,
    123,
    "ユーザー権限管理の不具合修正",
    IssueStatus.OPEN,
    tanaka.id,
    new Date("2026-05-20T00:00:00.000Z"),
    IssuePriority.HIGH,
    "管理者権限のないユーザーが特定の操作を実行できてしまう問題を修正する",
    ["bug", "security"],
    ["src/middleware/auth.ts", "src/services/UserService.ts"],
  );

  const issue124 = await findOrCreateIssue(
    "issue_124",
    org.id,
    v25.id,
    124,
    "取引履歴エクスポート機能の追加",
    IssueStatus.IN_PROGRESS,
    sato.id,
    new Date("2026-05-19T00:00:00.000Z"),
    IssuePriority.MEDIUM,
    `## 概要
ユーザーが取引履歴をCSV/PDFでエクスポートできる機能を追加する

## 要件
- 期間指定でのエクスポート
- CSV/PDF形式対応
- 権限チェック（自分の取引のみ）
- 大量データ対応（非同期処理）

## 影響範囲
- /api/transactions/export エンドポイント追加
- TransactionService の拡張
- UI: 取引履歴画面にエクスポートボタン追加`,
    ["enhancement", "feature"],
    [
      "src/api/routes/transactions.ts",
      "src/services/TransactionService.ts",
      "src/components/TransactionHistory.tsx",
      "src/utils/exporters/CsvExporter.ts",
      "src/utils/exporters/PdfExporter.ts",
    ],
  );

  const issue125 = await findOrCreateIssue(
    "issue_125",
    org.id,
    v25.id,
    125,
    "決済フロー最適化",
    IssueStatus.OPEN,
    suzuki.id,
    new Date("2026-05-22T00:00:00.000Z"),
    IssuePriority.CRITICAL,
    "決済処理のパフォーマンスを改善する",
    ["performance", "hotfix"],
    ["src/services/PaymentService.ts", "src/api/routes/payments.ts"],
  );

  const issue126 = await findOrCreateIssue(
    "issue_126",
    org.id,
    v25.id,
    126,
    "APIレート制限の実装",
    IssueStatus.OPEN,
    yamada.id,
    new Date("2026-05-18T00:00:00.000Z"),
    IssuePriority.MEDIUM,
    "API呼び出しに対するレート制限機能を追加",
    ["enhancement", "api"],
    ["src/middleware/rateLimit.ts", "src/api/index.ts"],
  );

  const issue127 = await findOrCreateIssue(
    "issue_127",
    org.id,
    secEnhancement.id,
    127,
    "ユーザー認証の強化",
    IssueStatus.IN_PROGRESS,
    tanaka.id,
    new Date("2026-05-17T00:00:00.000Z"),
    IssuePriority.HIGH,
    "2要素認証の実装",
    ["security", "feature"],
    ["src/services/AuthService.ts", "src/components/Login.tsx"],
  );

  console.log("✓ Issues (5) created from Figma Make JSON");

  // ── 6. TestCases (Figma Make JSONに合わせる) ─────────────────────────────

  const testCases = [
    {
      id: "tc_1",
      issueId: issue124.id,
      title: "権限チェック: 他ユーザーのデータエクスポート試行",
      status: TestCaseStatus.PASSED,
      assigneeId: tanaka.id,
      executionCount: 3,
      lastExecutionAt: new Date("2026-05-22T10:30:00.000Z"),
      customFieldValues: {
        "1": "API",
        "2": "機能系",
        "3": "マスキング",
        "4": "1. ユーザーAでログイン\n2. ユーザーBの取引IDを指定してエクスポート実行\n3. 403 Forbiddenが返却されることを確認",
      },
    },
    {
      id: "tc_2",
      issueId: issue124.id,
      title: "CSV: 大量データエクスポート（10万件）",
      status: TestCaseStatus.FAILED,
      assigneeId: sato.id,
      executionCount: 2,
      lastExecutionAt: new Date("2026-05-22T09:15:00.000Z"),
      customFieldValues: {
        "1": "バッチ",
        "2": "機能系",
        "3": "運用",
        "4": "1. 10万件のデータを準備\n2. CSV形式でエクスポート実行\n3. ファイルサイズとパフォーマンスを確認",
      },
    },
    {
      id: "tc_3",
      issueId: issue124.id,
      title: "PDF: 日本語文字化け確認",
      status: TestCaseStatus.FAILED,
      assigneeId: suzuki.id,
      executionCount: 1,
      lastExecutionAt: new Date("2026-05-21T16:20:00.000Z"),
      customFieldValues: {
        "1": "オンライン",
        "2": "画面系",
        "3": "書式",
        "4": "1. 日本語データを含む取引を準備\n2. PDFエクスポート実行\n3. 日本語が正しく表示されることを確認",
      },
    },
    {
      id: "tc_4",
      issueId: issue124.id,
      title: "セッションタイムアウト後の動作確認",
      status: TestCaseStatus.READY,
      assigneeId: yamada.id,
      executionCount: 0,
      lastExecutionAt: null,
      customFieldValues: {
        "1": "オンライン",
        "2": "機能系",
        "3": "ログ",
        "4": "1. セッションタイムアウトを設定\n2. タイムアウト後にエクスポート試行\n3. 適切なエラーメッセージが表示されることを確認",
      },
    },
    {
      id: "tc_5",
      issueId: issue127.id,
      title: "2要素認証の有効化テスト",
      status: TestCaseStatus.PASSED,
      assigneeId: tanaka.id,
      executionCount: 1,
      lastExecutionAt: new Date("2026-05-20T14:00:00.000Z"),
      customFieldValues: {
        "1": "オンライン",
        "2": "画面系",
        "3": "オートサジェスト",
        "4": "1. 2要素認証を有効化\n2. ログインして認証コード入力\n3. 正常にログインできることを確認",
      },
    },
    {
      id: "tc_6",
      issueId: issue127.id,
      title: "パスワードリセット機能",
      status: TestCaseStatus.DRAFT,
      assigneeId: null,
      executionCount: 0,
      lastExecutionAt: null,
      customFieldValues: { "1": "オンライン", "2": "画面系", "3": "テキスト", "4": "" },
    },
    {
      id: "tc_7",
      issueId: issue126.id,
      title: "レート制限超過時のエラーハンドリング",
      status: TestCaseStatus.PASSED,
      assigneeId: sato.id,
      executionCount: 1,
      lastExecutionAt: new Date("2026-05-19T11:30:00.000Z"),
      customFieldValues: {
        "1": "API",
        "2": "機能系",
        "3": "ログ",
        "4": "1. レート制限を超えるリクエストを送信\n2. 429エラーが返却されることを確認",
      },
    },
    {
      id: "tc_8",
      issueId: issue126.id,
      title: "429エラーのリトライロジック",
      status: TestCaseStatus.READY,
      assigneeId: nakamura.id,
      executionCount: 0,
      lastExecutionAt: null,
      customFieldValues: {
        "1": "API",
        "2": "機能系",
        "3": "運用",
        "4": "1. レート制限に達する\n2. 自動リトライが動作することを確認",
      },
    },
  ];

  for (const tc of testCases) {
    await prisma.testCase.upsert({
      where: { id: tc.id },
      update: {
        issueId: tc.issueId,
        title: tc.title,
        status: tc.status,
        assigneeId: tc.assigneeId,
        executionCount: tc.executionCount,
        lastExecutionAt: tc.lastExecutionAt,
        customFieldValues: tc.customFieldValues,
      },
      create: {
        id: tc.id,
        organizationId: org.id,
        issueId: tc.issueId,
        title: tc.title,
        status: tc.status,
        assigneeId: tc.assigneeId,
        executionCount: tc.executionCount,
        lastExecutionAt: tc.lastExecutionAt,
        customFieldValues: tc.customFieldValues,
      },
    });
  }

  console.log("✓ TestCases (8) created from Figma Make JSON");

  // ── 8. AI Analysis for issue_124 ──────────────────────────────────────────
  //
  // Create comprehensive impact analysis with 3 impact areas and 3 test case suggestions
  // (matching the UI specification).

  const existingAnalysis = await prisma.issueAiAnalysis.findFirst({
    where: { issueId: issue124.id },
  });

  if (!existingAnalysis) {
    await prisma.issueAiAnalysis.create({
      data: {
        issueId: issue124.id,
        impactAreas: {
          create: [
            {
              area: "Authentication & Authorization",
              risk: "S",
              description: "権限チェックの実装が必要。他ユーザーのデータアクセス防止",
              affectedFeatures: ["取引履歴閲覧", "データエクスポート"],
            },
            {
              area: "Data Export",
              risk: "A",
              description: "大量データ処理の性能影響。メモリリーク可能性",
              affectedFeatures: ["CSV生成", "PDF生成", "非同期ジョブ処理"],
            },
            {
              area: "UI/UX",
              risk: "B",
              description: "エクスポートボタンの配置、進捗表示",
              affectedFeatures: ["取引履歴画面"],
            },
          ],
        },
        testCaseSuggestions: {
          create: [
            {
              title: "権限チェック: 他ユーザーのデータエクスポート試行",
              risk: "S",
              category: "Security",
              steps: [
                "ユーザーAでログイン",
                "ユーザーBの取引IDを指定してエクスポート実行",
                "403 Forbiddenが返却されることを確認",
              ],
            },
            {
              title: "CSV: 大量データエクスポート（10万件）",
              risk: "A",
              category: "Performance",
              steps: [
                "10万件のデータを持つアカウントでログイン",
                "全期間指定でCSVエクスポート実行",
                "タイムアウトせず完了することを確認",
                "メモリ使用量が閾値以下であることを確認",
              ],
            },
            {
              title: "PDF: 日本語文字化け確認",
              risk: "B",
              category: "Functional",
              steps: [
                "日本語データを含む取引を準備",
                "PDFエクスポート実行",
                "日本語が正しく表示されることを確認",
              ],
            },
          ],
        },
      },
    });
  }

  console.log("✓ AI Analysis for issue_124 (3 impact areas, 3 test case suggestions)");

  // ── 9. Bugs (Figma Make JSONに合わせる) ──────────────────────────────────

  const bugDefinitions = [
    {
      id: "bug_1",
      issueId: issue124.id,
      testCaseId: "tc_2",
      title: "権限チェックでタイムアウトが発生",
      description:
        "大量データの権限チェック時にタイムアウトが発生する\n\n## 再現手順\n1. 10万件以上のデータを持つユーザーでログイン\n2. エクスポート機能を実行\n3. 権限チェック処理でタイムアウト\n\n## 期待動作\nタイムアウトせずに権限チェックが完了すること",
      severity: BugSeverity.HIGH,
      status: BugStatus.IN_PROGRESS,
      assigneeId: suzuki.id,
      createdAt: new Date("2026-05-21T15:30:00.000Z"),
    },
    {
      id: "bug_2",
      issueId: issue124.id,
      testCaseId: "tc_3",
      title: "PDFエクスポートで日本語が文字化け",
      description: "PDF出力時に日本語が正しく表示されない問題",
      severity: BugSeverity.MEDIUM,
      status: BugStatus.NEW,
      assigneeId: null,
      createdAt: new Date("2026-05-20T09:00:00.000Z"),
    },
    {
      id: "bug_3",
      issueId: issue125.id,
      testCaseId: null,
      title: "決済処理で2重課金が発生",
      description: "ネットワークエラー時に決済が2重に実行される",
      severity: BugSeverity.CRITICAL,
      status: BugStatus.NEW,
      assigneeId: suzuki.id,
      createdAt: new Date("2026-05-22T11:00:00.000Z"),
    },
    {
      id: "bug_4",
      issueId: issue126.id,
      testCaseId: null,
      title: "ログイン画面でEnterキーが効かない",
      description: "パスワード入力後にEnterキーでログインできない",
      severity: BugSeverity.LOW,
      status: BugStatus.NEW,
      assigneeId: null,
      createdAt: new Date("2026-05-19T14:20:00.000Z"),
    },
  ];

  for (const bug of bugDefinitions) {
    await prisma.bug.upsert({
      where: { id: bug.id },
      update: {
        issueId: bug.issueId,
        testCaseId: bug.testCaseId,
        title: bug.title,
        description: bug.description,
        severity: bug.severity,
        status: bug.status,
        assigneeId: bug.assigneeId,
      },
      create: {
        id: bug.id,
        organizationId: org.id,
        issueId: bug.issueId,
        testCaseId: bug.testCaseId,
        title: bug.title,
        description: bug.description,
        severity: bug.severity,
        status: bug.status,
        assigneeId: bug.assigneeId,
        createdAt: bug.createdAt,
      },
    });
  }

  console.log("✓ Bugs (4) created from Figma Make JSON");

  // ── 10. Custom field definitions for finance-portal ───────────────────────

  const customFields = [
    { name: "分類",       description: "オンライン、バッチなどの項目を記載する",            fieldType: CustomFieldType.DROPDOWN, options: ["オンライン", "バッチ", "API"] },
    { name: "画面系/機能系", description: "画面に注目したケースか機能に注目したケースか区分を記載", fieldType: CustomFieldType.DROPDOWN, options: ["画面系", "機能系"] },
    { name: "テスト観点",  description: "テストの観点を記載",                               fieldType: CustomFieldType.DROPDOWN, options: ["オートサジェスト", "テキスト", "書式", "マスキング", "運用", "ログ"] },
    { name: "手順",        description: "ケースの手順を記載する",                           fieldType: CustomFieldType.TEXTAREA,  options: null },
  ];

  for (const cf of customFields) {
    await prisma.testCaseCustomFieldDefinition.upsert({
      where: { repositoryId_name: { repositoryId: financeRepo.id, name: cf.name } },
      update: { description: cf.description, fieldType: cf.fieldType, options: cf.options },
      create: { organizationId: org.id, repositoryId: financeRepo.id, ...cf },
    });
  }

  console.log("✓ Custom field definitions (4)");

  // Variables referenced to avoid accidental pruning during future refactors.
  void perfImprovement;
  void apiV3Migration;
  void oauthImplementation;

  // ── Done ───────────────────────────────────────────────────────────────────

  console.log(`
✅ Seed complete!

Login credentials:
  admin@qapybara.dev    password: password     role: OWNER
  tanaka@example.com    password: password123  role: ADMIN
  sato@example.com      password: password123  role: QA
  suzuki@example.com    password: password123  role: DEVELOPER
  yamada@example.com    password: password123  role: QA
  nakamura@example.com  password: password123  role: VIEWER
`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
