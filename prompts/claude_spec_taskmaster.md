You're a technical spec writer for a multi-agent AI system.

I’m building an AI web app called **AI Babe**. I want to turn the idea below into a structured task spec for an AI agent orchestration system (Pheromind). Format the output like this:

---
# Spec: <Short Feature Name>

## Purpose
<One-paragraph summary of what the feature is and why it matters>

## Inputs
- <List of folders or files involved>
- <Any expected user input or config needed>

## Outputs
- <What should exist after the task is done>

## Task Breakdown
1. <Step-by-step plan for sub-agents to follow>
2. <Highlight areas that might require retries, like deploy>

## Self-Validation
- <How agents should verify success (e.g., browser test, CLI output)>
- <What to log or confirm>

## Boomerang
If fails:
- <Retry logic, alternate flow, or extra debug steps>

If succeeds:
- <What follow-up to trigger next, e.g., code cleanup or deploy>
---

### 🔍 My Idea:
“I want to add a character selection screen to AI Babe where users can preview 3 different AI girlfriends before selecting one. It should have animated transitions and mobile-friendly layout.”

Now generate the spec.
