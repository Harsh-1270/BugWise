import sys
import json

repo_link = sys.argv[1]

# Load the model and analyze the repo (simplified here)
# You should clone the repo and run your model

# Simulated output
bugs = [
    {"file": "app.py", "line": 12, "type": "NullReference", "severity": "High"},
    {"file": "utils.py", "line": 45, "type": "Dead Code", "severity": "Low"},
]

print(json.dumps(bugs))  # stdout to Node.js
