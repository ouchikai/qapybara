import { randomBytes, scryptSync } from "node:crypto";
import {
  BugSeverity,
  BugStatus,
  CustomFieldType,
  IssueStatus,
  MembershipStatus,
  PrismaClient,
  ProjectStatus,
  TestCaseStatus,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");

  return `s1$${salt}$${derived}`;
}

async function main() {
  const organization = await prisma.organization.upsert({
    where: { slug: "default-org" },
    update: { name: "acme-corp" },
    create: {
      slug: "default-org",
      name: "acme-corp",
    },
  });

  const seedUsers = [
    {
      email: "tanaka@example.com",
      displayName: "田中太郎",
      role: UserRole.ADMIN,
      password: "password123",
    },
    {
      email: "sato@example.com",
      displayName: "佐藤花子",
      role: UserRole.QA,
      password: "password123",
    },
    {
      email: "suzuki@example.com",
      displayName: "鈴木一郎",
      role: UserRole.DEVELOPER,
      password: "password123",
    },
    {
      email: "yamada@example.com",
      displayName: "山田次郎",
      role: UserRole.QA,
      password: "password123",
    },
    {
      email: "nakamura@example.com",
      displayName: "中村美咲",
      role: UserRole.VIEWER,
      password: "password123",
    },
  ];

  const usersByEmail = new Map();

  for (const seedUser of seedUsers) {
    const passwordHash = hashPassword(seedUser.password);

    const user = await prisma.user.upsert({
      where: { email: seedUser.email },
      update: {
        displayName: seedUser.displayName,
        emailVerified: true,
        passwordHash,
      },
      create: {
        email: seedUser.email,
        displayName: seedUser.displayName,
        emailVerified: true,
        passwordHash,
      },
    });

    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: user.id,
        },
      },
      update: {
        password: passwordHash,
      },
      create: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: passwordHash,
      },
    });

    usersByEmail.set(seedUser.email, user);

    await prisma.membership.upsert({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.id,
        },
      },
      update: {
        role: seedUser.role,
        status: MembershipStatus.ACTIVE,
        acceptedAt: new Date("2026-05-01T00:00:00.000Z"),
      },
      create: {
        organizationId: organization.id,
        userId: user.id,
        role: seedUser.role,
        status: MembershipStatus.ACTIVE,
        invitedAt: new Date("2026-04-15T00:00:00.000Z"),
        acceptedAt: new Date("2026-05-01T00:00:00.000Z"),
      },
    });
  }

  const repositories = [
    {
      slug: "finance-portal",
      name: "finance-portal",
      description: "金融ポータルのフロントエンド",
      projects: [
        { slug: "v2-5-release", name: "v2.5 Release", status: ProjectStatus.ACTIVE, issueCount: 8 },
        {
          slug: "security-hardening",
          name: "Security Hardening",
          status: ProjectStatus.ACTIVE,
          issueCount: 4,
        },
        {
          slug: "ux-improvement",
          name: "UX Improvement",
          status: ProjectStatus.PLANNING,
          issueCount: 3,
        },
      ],
      lastSync: "2026-05-22T10:30:00.000Z",
    },
    {
      slug: "payment-service",
      name: "payment-service",
      description: "決済サービスのバックエンドAPI",
      projects: [
        {
          slug: "reconciliation-refactor",
          name: "Reconciliation Refactor",
          status: ProjectStatus.ACTIVE,
          issueCount: 5,
        },
        {
          slug: "fraud-detection-v1",
          name: "Fraud Detection v1",
          status: ProjectStatus.ACTIVE,
          issueCount: 3,
        },
      ],
      lastSync: "2026-05-22T09:15:00.000Z",
    },
    {
      slug: "user-management",
      name: "user-management",
      description: "ユーザー管理・認証サービス",
      projects: [
        {
          slug: "identity-platform-v1",
          name: "Identity Platform v1",
          status: ProjectStatus.ACTIVE,
          issueCount: 12,
        },
      ],
      lastSync: "2026-05-21T16:45:00.000Z",
    },
  ];

  const repositoriesBySlug = new Map();

  for (const repo of repositories) {
    const repository = await prisma.repository.upsert({
      where: {
        organizationId_slug: {
          organizationId: organization.id,
          slug: repo.slug,
        },
      },
      update: {
        name: repo.name,
        description: repo.description,
        updatedAt: new Date(repo.lastSync),
      },
      create: {
        organizationId: organization.id,
        slug: repo.slug,
        name: repo.name,
        description: repo.description,
        updatedAt: new Date(repo.lastSync),
      },
    });

    repositoriesBySlug.set(repo.slug, repository);

    for (const projectSeed of repo.projects) {
      const project = await prisma.project.upsert({
        where: {
          repositoryId_slug: {
            repositoryId: repository.id,
            slug: projectSeed.slug,
          },
        },
        update: {
          name: projectSeed.name,
          status: projectSeed.status,
        },
        create: {
          organizationId: organization.id,
          repositoryId: repository.id,
          slug: projectSeed.slug,
          name: projectSeed.name,
          status: projectSeed.status,
        },
      });

      for (let index = 1; index <= projectSeed.issueCount; index += 1) {
        const assignee =
          index % 2 === 0
            ? usersByEmail.get("sato@example.com")
            : usersByEmail.get("tanaka@example.com");

        await prisma.issue.upsert({
          where: {
            projectId_externalIssueNumber: {
              projectId: project.id,
              externalIssueNumber: 2000 + index,
            },
          },
          update: {
            title: `${projectSeed.name} task #${index}`,
            status: index % 3 === 0 ? IssueStatus.IN_PROGRESS : IssueStatus.OPEN,
            assigneeId: assignee?.id,
          },
          create: {
            organizationId: organization.id,
            projectId: project.id,
            externalIssueNumber: 2000 + index,
            title: `${projectSeed.name} task #${index}`,
            description: "Seed issue for mock dashboard counts",
            status: index % 3 === 0 ? IssueStatus.IN_PROGRESS : IssueStatus.OPEN,
            assigneeId: assignee?.id,
          },
        });
      }
    }
  }

  const financeRepo = repositoriesBySlug.get("finance-portal");

  if (!financeRepo) {
    throw new Error("finance-portal repository not found during seed");
  }

  const customFieldDefinitions = [
    {
      name: "分類",
      description: "オンライン、バッチなどの項目を記載する",
      fieldType: CustomFieldType.DROPDOWN,
      options: ["オンライン", "バッチ", "API"],
    },
    {
      name: "画面系/機能系",
      description: "画面に注目したケースか機能に注目したケースか区分を記載",
      fieldType: CustomFieldType.DROPDOWN,
      options: ["画面系", "機能系"],
    },
    {
      name: "テスト観点",
      description: "テストの観点を記載",
      fieldType: CustomFieldType.DROPDOWN,
      options: ["オートサジェスト", "テキスト", "書式", "マスキング", "運用", "ログ"],
    },
    {
      name: "手順",
      description: "ケースの手順を記載する",
      fieldType: CustomFieldType.TEXTAREA,
      options: null,
    },
  ];

  for (const definition of customFieldDefinitions) {
    await prisma.testCaseCustomFieldDefinition.upsert({
      where: {
        repositoryId_name: {
          repositoryId: financeRepo.id,
          name: definition.name,
        },
      },
      update: {
        description: definition.description,
        fieldType: definition.fieldType,
        options: definition.options,
      },
      create: {
        organizationId: organization.id,
        repositoryId: financeRepo.id,
        name: definition.name,
        description: definition.description,
        fieldType: definition.fieldType,
        options: definition.options,
      },
    });
  }

  const financeReleaseProject = await prisma.project.findUnique({
    where: {
      repositoryId_slug: {
        repositoryId: financeRepo.id,
        slug: "v2-5-release",
      },
    },
  });

  if (!financeReleaseProject) {
    throw new Error("v2-5-release project not found during seed");
  }

  const issue124 = await prisma.issue.upsert({
    where: {
      projectId_externalIssueNumber: {
        projectId: financeReleaseProject.id,
        externalIssueNumber: 124,
      },
    },
    update: {
      title: "取引履歴エクスポート機能の追加",
      description: "CSV/PDFエクスポート機能",
      status: IssueStatus.OPEN,
      assigneeId: usersByEmail.get("sato@example.com")?.id,
    },
    create: {
      organizationId: organization.id,
      projectId: financeReleaseProject.id,
      externalIssueNumber: 124,
      title: "取引履歴エクスポート機能の追加",
      description: "CSV/PDFエクスポート機能",
      status: IssueStatus.OPEN,
      assigneeId: usersByEmail.get("sato@example.com")?.id,
    },
  });

  const testCases = [
    {
      title: "権限チェック: 他ユーザーのデータエクスポート試行",
      status: TestCaseStatus.PASSED,
      assigneeEmail: "tanaka@example.com",
      executionCount: 3,
      lastExecutionAt: "2026-05-22T10:30:00.000Z",
      customFieldValues: {
        分類: "API",
        "画面系/機能系": "機能系",
        テスト観点: "マスキング",
      },
    },
    {
      title: "CSV: 大量データエクスポート（10万件）",
      status: TestCaseStatus.FAILED,
      assigneeEmail: "sato@example.com",
      executionCount: 2,
      lastExecutionAt: "2026-05-22T09:15:00.000Z",
      customFieldValues: {
        分類: "バッチ",
        "画面系/機能系": "機能系",
        テスト観点: "運用",
      },
    },
    {
      title: "PDF: 日本語文字化け確認",
      status: TestCaseStatus.FAILED,
      assigneeEmail: "suzuki@example.com",
      executionCount: 1,
      lastExecutionAt: "2026-05-21T16:20:00.000Z",
      customFieldValues: {
        分類: "オンライン",
        "画面系/機能系": "画面系",
        テスト観点: "書式",
      },
    },
    {
      title: "セッションタイムアウト後の動作確認",
      status: TestCaseStatus.READY,
      assigneeEmail: "yamada@example.com",
      executionCount: 0,
      lastExecutionAt: null,
      customFieldValues: {
        分類: "オンライン",
        "画面系/機能系": "機能系",
        テスト観点: "ログ",
      },
    },
  ];

  for (const testCaseSeed of testCases) {
    const assignee = usersByEmail.get(testCaseSeed.assigneeEmail);

    const existingTestCase = await prisma.testCase.findFirst({
      where: {
        issueId: issue124.id,
        title: testCaseSeed.title,
      },
    });

    if (existingTestCase) {
      await prisma.testCase.update({
        where: { id: existingTestCase.id },
        data: {
          status: testCaseSeed.status,
          assigneeId: assignee?.id,
          executionCount: testCaseSeed.executionCount,
          lastExecutionAt: testCaseSeed.lastExecutionAt
            ? new Date(testCaseSeed.lastExecutionAt)
            : null,
          customFieldValues: testCaseSeed.customFieldValues,
        },
      });
      continue;
    }

    await prisma.testCase.create({
      data: {
        organizationId: organization.id,
        issueId: issue124.id,
        title: testCaseSeed.title,
        status: testCaseSeed.status,
        assigneeId: assignee?.id,
        executionCount: testCaseSeed.executionCount,
        lastExecutionAt: testCaseSeed.lastExecutionAt
          ? new Date(testCaseSeed.lastExecutionAt)
          : null,
        customFieldValues: testCaseSeed.customFieldValues,
      },
    });
  }

  const failedCase = await prisma.testCase.findFirst({
    where: {
      issueId: issue124.id,
      title: "CSV: 大量データエクスポート（10万件）",
    },
  });

  if (failedCase) {
    const existingBug = await prisma.bug.findFirst({
      where: {
        organizationId: organization.id,
        issueId: issue124.id,
        title: "CSV export timeout",
      },
    });

    if (!existingBug) {
      await prisma.bug.create({
        data: {
          organizationId: organization.id,
          issueId: issue124.id,
          testCaseId: failedCase.id,
          title: "CSV export timeout",
          description: "Timeout with large data set",
          severity: BugSeverity.HIGH,
          status: BugStatus.NEW,
          assigneeId: usersByEmail.get("sato@example.com")?.id,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
