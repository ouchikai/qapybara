import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RepositoriesOverviewList } from "@/features/repositories/components/repositories-overview-list";

describe("RepositoriesOverviewList", () => {
  it("renders repositories", () => {
    render(
      <RepositoriesOverviewList
        repositories={[
          {
            id: "repo_1",
            slug: "finance-portal",
            name: "finance-portal",
            activeProjects: 3,
            openIssues: 12,
          },
        ]}
      />,
    );

    expect(screen.getByText("finance-portal")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "finance-portal" })).toBeInTheDocument();
  });
});
