# Copilot Workspace Instructions

## Scope
These instructions apply to all tasks in this repository, especially UI/screen implementation tasks.

## Default Workflow For Screen Implementation
1. Do not ask the user to re-confirm basic access every time.
2. If a Figma URL is provided, proactively verify reachability first.
3. If a GitHub repository or PR context is needed, use `gh` CLI first.
4. Report verification results briefly, then proceed with implementation.

## Figma Verification Rules
- For a provided Figma URL, first check HTTP reachability.
- If response indicates auth/login/404 behavior, explicitly report that access is limited by permissions or URL state.
- If Figma MCP tools are available and needed, use them after basic reachability check.
- Do not block implementation when Figma is temporarily inaccessible; proceed with best available context and state assumptions.

## GitHub Verification Rules (gh CLI)
- Prefer `gh repo view <owner>/<repo>` to verify repository visibility and access.
- Prefer `gh pr view` / `gh issue view` for task context when relevant.
- Summarize key facts (private/public, default branch, URL) before coding.

## Communication Rules
- Keep verification updates concise (what was checked, what succeeded/failed, what assumption is used).
- Continue end-to-end without repeatedly asking for the same confirmation unless credentials or permissions changed.
