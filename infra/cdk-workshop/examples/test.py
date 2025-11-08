import time
import os
owner = os.getenv("OWNER")
repo = os.getenv("REPO")
sha = os.getenv("SHA")
print(f"sha: {sha}, repo: {repo}, owner: {owner}")

