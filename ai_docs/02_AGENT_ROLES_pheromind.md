### 🕸 Pheromind (Multi-Agent Orchestrator)

**Setup:**
- Installed under `/agents/pheromind_agent`
- Customize `agent_config.json` for task-specific logic

**Use for:**
- Coordinating cleanup, build, and deploy steps across AI Girlfriend app
- Replacing brittle prompt chaining with persistent pheromone-based memory
- Auto-scheduling retries or shifts in priority

**Workflow:**
- Define high-level goal
- Drop into `pheromind_agent/agent_inputs/goal.md`
- Run `main.py` or trigger via Python module from Elevate

**Prompt location:** `/prompts/pheromind_start_goal.md`
