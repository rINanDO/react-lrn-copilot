# wetten-react

Web application for browsing Dutch legislation (BWB) publications from officiele-overheidspublicaties.nl.

Quick start
- Install dependencies (recommended): npm ci  # use `npm install` if needed
- Run dev server (Vite): npm run dev
- Build (typecheck + vite build): npm run build
- Preview production build (after build): npm run preview
- Typecheck only: npm run typecheck
- Lint: npm run lint
- Run tests (full): npm run test
- Run a single test file: npm run test -- src/path/to/file.test.tsx
- Run a single test by name: npm run test -- -t "test name substring"
- Watch tests: npm exec vitest -- --watch
- Regenerate XML schema (generated artifact): npm run generate:xml-schema

Environment
- Node: engines in package.json require Node ^22.12 || ^24 || >=26
- Package manager hint: npm@11.4.1 (packageManager field)

High-level architecture
- Framework: React + TypeScript + Vite. Entry point: src/main.tsx → src/App.tsx
- Routing: src/router defines route objects and the browser router
- UI structure: src/component grouped by domain (bwb, cvdr, search, document, elements, page). Components, hooks (use*), styles and tests are colocated
- API layer: src/api implements repository patterns (sruRepository, bwbRepository, cvdrRepository). Types are generated; a runtime XML mapper uses generated schema files (*.gen.ts)
- Generated artifacts: scripts/generate-xml-schema.mjs creates src/api/xmlSchema.gen.ts from src/api/types.gen.ts. Do not edit *.gen.ts files manually

Conventions and notes
- Tests use Vitest + Testing Library. Test files are named *.test.ts / *.test.tsx and are colocated with implementation
- Linting is done with oxlint; see lint config if you enable type-aware rules
- TypeScript project build uses project references (tsc -b). Use npm run typecheck to verify types across the repo
- Keep feature folders self-contained: component, hooks, styles, and tests together under src/component/<feature>

CI / Deployment
- CI script: npm run ci runs typecheck → lint → test → build
- GitHub Actions: .github/workflows/main_wa-react-wetten.yml runs install, build, test on Node 24.x and deploys the dist artifact to an Azure Web App

License & repository
- See package.json for repository and license information

For contributor guidelines or deeper design notes, check the repo docs and the .github directory.
