import { Plus, RefreshCcw } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { RepositoriesOverview } from "@/features/repositories/components/repositories-overview";
import { RepositoriesShell } from "@/features/repositories/components/repositories-shell";

export default function RepositoriesPage() {
  return (
    <RepositoriesShell
      title="Repositories"
      description="GitHub同期済みリポジトリー一覧"
      activeItem="repositories"
      actions={
        <>
          <Button type="button" variant="outline" size="sm">
            <RefreshCcw className="size-4" />
            Sync All
          </Button>
          <Button type="button" size="sm">
            <Plus className="size-4" />
            Add Repository
          </Button>
        </>
      }
    >
      <RepositoriesOverview />
    </RepositoriesShell>
  );
}
