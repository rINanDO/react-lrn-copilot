# Copilot instructions for wetten-react

Purpose
- Quick, repo-specific guidance for Copilot sessions: how to build/test/lint, high-level architecture, and conventions Copilot should follow.

Build / Test / Lint
- Install: npm ci (or npm install)
- Dev: npm run dev (Vite)
- Build: npm run build (runs tsc -b && vite build)
- Typecheck: npm run typecheck (tsc -b)
- Lint: npm run lint (oxlint)
- Test (full): npm run test (runs vitest run)
- Run a single test file: npm run test -- src/component/path/your-file.test.tsx
- Run a single test by name: npm run test -- -t "test name substring"
- Watch tests locally: npx vitest --watch  (or npm exec vitest -- --watch)
- CI: npm run ci (typecheck → lint → test → build). GitHub Action: .github/workflows/main_wa-react-wetten.yml uses Node 24.x and copies web.config into dist.

Environment
- Node: engines in package.json require Node ^22.12 || ^24 || >=26
- Package manager: npm@11.4.1 (packageManager field)

High-level architecture (big-picture)
- Framework: React + TypeScript running on Vite. Entry: src/main.tsx → src/App.tsx.
- Routing: src/router/* (router/index.tsx + routes.ts) defines application routes and route objects.
- UI: src/component/ grouped by domain/feature folders: bwb, cvdr, document, elements, page, search. Each folder contains component(s), styles and tests colocated.
- API layer: src/api implements repository patterns (sruRepository, bwbRepository, cvdrRepository). Types are generated and used by a runtime XML mapper.
- Code generation: scripts/generate-xml-schema.mjs derives src/api/xmlSchema.gen.ts from src/api/types.gen.ts; generated files end with .gen.ts and should not be hand-edited.
- Assets: src/assets and src/images contain styles and static images used in the UI.

Key repo conventions and patterns
- Folder-by-domain: keep related components, hooks and tests in the same feature folder (e.g., src/component/bwb).
- Hooks: custom hooks are named useX (use- prefix) and live next to domain components (e.g., use-toestand.ts).
- Tests: Vitest + Testing Library. Test files use .test.ts / .test.tsx and are colocated with implementation.
- Linting: oxlint is the linter; consider enabling type-aware rules if extending lint config (see README.md guidance).
- Generated artifacts: files matching *.gen.ts are generated; regenerate with npm run generate:xml-schema when types change.
- TypeScript project build: the repo uses tsc -b; prefer running the provided scripts rather than invoking tsc manually across files.

Files/dirs to avoid manual edits
- src/api/*.gen.ts (generated)
- dist/ (build output)

Integrations / CI notes
- GitHub Actions build job uses Node 24.x and runs npm install → npm run build → npm run test; deployment uploads dist to Azure Web App (see .github/workflows/main_wa-react-wetten.yml).

Questions
- Would you like an MCP server configured for this web project (example: Playwright for E2E browser tests)? Reply yes to add a suggested copilot-setup-steps and workflow.