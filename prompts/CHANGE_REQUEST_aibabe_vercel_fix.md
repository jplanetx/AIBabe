## 📝 SPARC Change Request Blueprint: **Deploy AIBabe to Vercel**

**Project**: AIBabe  
**Tech Stack**: Next.js 15.2.3 / React 18.2.0  
**Prepared For**: Pheromind AI Orchestration  
**Prepared By**: [User]  
**Date**: 2025-05-16

---

### 🎯 Objective

Ensure a fully functioning test deployment of AIBabe on Vercel, resolving existing build blockers and enabling CI/CD workflows for rapid live iteration. This deployment must be AI-verifiable and reproducible.

---

### 📍 Current State Summary

- ✅ Local build & run passes (`next build && next start`)
- ✅ Docker image confirmed working on `localhost:3000`
- ❌ Vercel build fails due to `cmdk` missing type declarations
- ❌ Some environment variables are unset on Vercel
- 🔧 Manual `types/cmdk.d.ts` may resolve TS issue
- 🧷 Lockfile (`package-lock.json`) not committed

---

### 📦 Tasks & AI-Verifiable Deliverables

#### **Phase: Fix Build and Enable CI/CD**
Each task defines an **AI-Verifiable Output**, enabling autonomous agent verification per Pheromind methodology.

---

**Task 1: Dependency & Lockfile Sync**

- 🛠️ Action: Sync `package.json` and regenerate `package-lock.json` via clean install
- ✅ AI-Verifiable Criteria:
  - File `package-lock.json` committed
  - `npm ci && npm run build` completes without error (exit code 0)
  - Output of `npm list cmdk` matches declared version

---

**Task 2: Type Stub Fix for `cmdk`**

- 🛠️ Action: Create `types/cmdk.d.ts` with `declare module 'cmdk';`
- ✅ AI-Verifiable Criteria:
  - File `types/cmdk.d.ts` exists with correct declaration
  - `tsc --noEmit` completes without errors referencing `cmdk`

---

**Task 3: tsconfig Fix**

- 🛠️ Action: Add `typeRoots: ["./types", "./node_modules/@types"]` to `tsconfig.json`
- ✅ AI-Verifiable Criteria:
  - `tsconfig.json` contains required `typeRoots`
  - Build (`next build`) succeeds without `cmdk` type errors

---

**Task 4: Vercel Env Setup**

- 🛠️ Action: Ensure all required env vars (`DATABASE_URL`, `NEXT_PUBLIC_API_URL`, etc.) are set in Vercel dashboard
- ✅ AI-Verifiable Criteria:
  - Vercel project dashboard contains these env vars (queried via Vercel API or CLI)
  - `next build` on Vercel succeeds (green check)

---

**Task 5: Trigger Build and Validate Health**

- 🛠️ Action: Deploy app to Vercel and validate health
- ✅ AI-Verifiable Criteria:
  - `/api/health` endpoint returns HTTP 200
  - Page at `/` loads without console errors or 5xx status codes

---

**Task 6: Enable Auto Deploy**

- 🛠️ Action: Enable deploy on push to `main` branch in Vercel
- ✅ AI-Verifiable Criteria:
  - Vercel dashboard shows "auto deploy from GitHub main" enabled
  - Commit to `main` triggers successful build (checked via webhook status or Vercel deploy logs)

---

### 🏁 Final High-Level Acceptance Test

**Test Name**: End-to-End Deployment Success & CI Pipeline Activation  
**Blueprint References**: Tasks 1–6  
**AI-Verifiable Criteria**:

1. `next build` succeeds on Vercel for commit `X`
2. `/api/health` returns 200 in deployed environment
3. `package-lock.json`, `types/cmdk.d.ts`, `tsconfig.json` are present and match known hash values
4. Vercel deploy log confirms commit hash `X` built successfully
5. CI log includes "triggered by push to main"
