#!/bin/bash

# Navigate to the Pheromind agent folder
cd "$(dirname "$0")/agents/pheromind_agent"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
  source venv/bin/activate
fi

# Install dependencies if needed
if [ -f "requirements.txt" ]; then
  echo "Installing dependencies..."
  pip install -r requirements.txt
fi

# Create logs folder if it doesn't exist
mkdir -p logs

# Run Pheromind and save output to log file
echo "Running Pheromind with goal.md..."
python main.py agent_inputs/goal.md | tee logs/setup_log.txt
