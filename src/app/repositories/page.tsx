import Link from "next/link";

const repositories = [
  { id: "repo_finance_portal", name: "finance-portal" },
  { id: "repo_subscription_api", name: "subscription-api" },
];

export default function RepositoriesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Repositories</h1>
      <ul className="space-y-2">
        {repositories.map((repository) => (
          <li key={repository.id}>
            <Link
              href={`/repositories/${repository.id}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {repository.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
