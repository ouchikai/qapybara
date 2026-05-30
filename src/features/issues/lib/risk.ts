import type { IssuePriority } from "@/features/issues/types/issue-detail";

/**
 * リスクレベル(S/A/B/C)のバッジクラス。仕様書のカラーマッピングに準拠。
 *   S → destructive（赤）
 *   A → chart-1（オレンジ）
 *   B → chart-4（黄）
 *   C → muted（グレー）
 */
export function getRiskBadgeClassName(risk: string): string {
  switch (risk) {
    case "S":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "A":
      return "bg-chart-1/10 text-chart-1 border-chart-1/20";
    case "B":
      return "bg-chart-4/10 text-chart-4 border-chart-4/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

/**
 * 優先度バッジのクラス名。仕様書準拠:
 *   critical → destructive、high → chart-1、medium → chart-4、low → muted
 */
export function getPriorityBadgeClassName(priority: IssuePriority): string {
  switch (priority) {
    case "critical":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "high":
      return "bg-chart-1/10 text-chart-1 border-chart-1/20";
    case "medium":
      return "bg-chart-4/10 text-chart-4 border-chart-4/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

/**
 * バグ重要度バッジのクラス名（優先度と同じカラースケール）。
 */
export function getSeverityBadgeClassName(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "high":
      return "bg-chart-1/10 text-chart-1 border-chart-1/20";
    case "medium":
      return "bg-chart-4/10 text-chart-4 border-chart-4/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}
