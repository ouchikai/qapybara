import { AlertTriangle } from "lucide-react";

import { getRiskBadgeClassName } from "@/features/issues/lib/risk";
import type { ImpactArea } from "@/features/issues/types/issue-detail";

interface ImpactAreasSectionProps {
  impactAreas: ImpactArea[];
}

export function ImpactAreasSection({ impactAreas }: ImpactAreasSectionProps) {
  return (
    <section
      aria-labelledby="impact-areas-heading"
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="size-5 text-chart-1" aria-hidden="true" />
        <h2 id="impact-areas-heading" className="text-base font-semibold">
          Impact Areas
        </h2>
        <span className="text-xs text-muted-foreground">({impactAreas.length})</span>
      </div>

      <ul className="space-y-3">
        {impactAreas.map((area) => (
          <li key={area.id} className="rounded-md border border-border p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium">{area.area}</h3>
              <span
                className={`shrink-0 rounded border px-2 py-1 text-xs font-semibold ${getRiskBadgeClassName(area.risk)}`}
                aria-label={`リスクレベル ${area.risk}`}
              >
                Risk: {area.risk}
              </span>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">{area.description}</p>
            {area.affectedFeatures.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {area.affectedFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="rounded bg-accent px-2 py-1 text-xs text-accent-foreground"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
