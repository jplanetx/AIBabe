# AI Babe – Multi-Agent DevOps Workflow

Welcome to the AI Babe project – a production-ready AI-powered web app integrated with a multi-agent orchestration system (Pheromind).

## 🔧 Project Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/<your-username>/AIBabe.git
cd AIBabe
yarn install
```

### 2. Environment Variables
Copy `.env.template` to `.env` and populate the secrets:
```bash
cp .env.template .env
```
Then edit `.env` to include:

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL`

#### Additional Required Environment Variables

The application relies on several environment variables for sensitive API credentials and configuration overrides. Ensure these are set in your root-level `.env` file (for CLI usage) or in the `env` section of `.roo/mcp.json` (for MCP/Roo Code integration):

- `ANTHROPIC_API_KEY`: API key for Anthropic services (required)
- `PERPLEXITY_API_KEY`: API key for Perplexity services (required)
- `OPENAI_API_KEY`: API key for OpenAI services (required)
- `GOOGLE_API_KEY`: API key for Google services (required)
- `MISTRAL_API_KEY`: API key for Mistral services (required)
- `AZURE_OPENAI_API_KEY`: API key for Azure OpenAI services (required; also set `AZURE_OPENAI_ENDPOINT`)
- `AZURE_OPENAI_ENDPOINT`: Endpoint for Azure OpenAI services (required with `AZURE_OPENAI_API_KEY`)
- `OPENROUTER_API_KEY`: API key for OpenRouter services (required)
- `XAI_API_KEY`: API key for XAI services (required)
- `OLLAMA_API_KEY`: API key for Ollama services (required; also set `OLLAMA_BASE_URL`)
- `OLLAMA_BASE_URL`: Base URL for Ollama services (optional, default: `http://localhost:11434/api`)

> **Do not commit `.env`** – it is excluded in `.gitignore`.

### 3. Local Development
```bash
yarn dev
```
Runs the app on `http://localhost:3000`

---

## 🚀 Agent Workflow: Pheromind

### Run Agents
Use the built-in orchestrator to handle cleanup, config fixes, and deployments:

```bash
./run.sh
```

Or use:
```bash
docker-compose up --build
```

Tasks are defined in:
- `/specs/` — project tasks
- `/prompts/` — Claude-ready goal templates

---

## 📦 Build and Packaging

To build the project, generate the Prisma client, run tests, and package the necessary files for deployment (e.g., to Gemini), use the `build-and-package.sh` script:

```bash
chmod +x ./build-and-package.sh
./build-and-package.sh
```

This script performs the following actions:
- Fixes permissions for the current directory.
- Runs `npx prisma generate` to generate the Prisma client.
- Installs project dependencies using `npm install`.
- Builds the project using `npm run build`.
- Executes all project tests using `npm test`.
- Creates a `upload.zip` file containing only the essential files for deployment: `prisma/`, `src/`, `package.json`, `tsconfig.json`, and `.env.example`. This ensures a slim archive for upload.

## 🚀 Deployment (DigitalOcean)

1. Configure `.env` for production
2. SSH into your Droplet and clone the repo
3. Run:
```bash
docker-compose up -d
docker-compose exec app npx prisma migrate deploy
```

---

## 📁 Folder Overview

- `app/` – Next.js App Router project
- `agents/` – Multi-agent orchestration (Pheromind)
- `specs/` – Executable agent tasks
- `prompts/` – Prompt templates
- `ai_docs/` – System-level logs and architecture notes
- `Dockerfile`, `docker-compose.yml` – Container configs
- `run.sh` – CLI runner

---

## 🧠 Notes

- Logs: Stored in `logs/`
- Token tracing: Enabled via Gpustack
- Claude + RooCode integration required for full functionality

---

## 🧪 MVP Status Checklist
Before launch, verify the following:
- [ ] Onboarding screen loads and stores selection
- [ ] Chat interface renders and sends messages
- [ ] Docker build runs without error
- [ ] App deploys and responds at `http://<your-domain>`

---

## 🔐 Security
Ensure you DO NOT commit:
- `.env`
- API keys
- Database passwords

---

## 🙌 Powered By
- Next.js + Tailwind + Prisma
- Claude, RooCode, Pheromind

---

## 🤝 Handoff FAQ

**Which type/import errors are still open?**
All known type and import errors have been resolved. No TypeScript `@ts-ignore` or unresolved import issues remain.

**Where are all custom UI components?**
Custom UI components are located in:
- `components/ui/`
- `components/dashboard/`
- `components/home/`
- `components/layout/`

**Which env vars are strictly required at build time? (Versus runtime only?)**
See the environment variable documentation above and [`lib/validateEnv.js`](lib/validateEnv.js).
- **Build-time required:** All variables validated in `lib/validateEnv.js` must be set before building or deploying.
- **Runtime only:** Any variables not checked in `lib/validateEnv.js` may be set at runtime, but most are required at build.

**How will you enforce type safety and prevent TS regressions after removing ignore flags?**
- The `tsc --noEmit` pre-check script in [`package.json`](package.json) enforces type safety before builds.
- Additional best practices:
  - Use CI to run `tsc --noEmit` and lint checks on every PR.
  - Enable ESLint with TypeScript plugins.
  - Require code owner reviews for type-critical changes.

---

## 🛠️ Practical Tips for Future Development

- Don’t “just” rely on stubs and ignore flags. Fix types up front—`ignoreBuildErrors` was removed for a reason.
- Peer-dependency pain? Use `npm dedupe` and forcibly pin all versions if needed (even downgrading). All versions are now pinned.
- If Vercel logs stall, try a local build with `NODE_ENV=production` and all ENV vars. If it fails locally, Vercel will never work. Use `npm run test:prod` to verify.
- Keep a CHANGELOG: Even brief notes help. Mark any breaking change. If `CHANGELOG.md` does not exist, create one.
