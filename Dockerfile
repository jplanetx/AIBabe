FROM python:3.10-slim

WORKDIR /app

COPY agents/pheromind_agent /app

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "main.py", "agent_inputs/goal.md"]
