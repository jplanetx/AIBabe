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

## 📦 Deployment (DigitalOcean)

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
