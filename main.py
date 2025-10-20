from fastapi import FastAPI, Request, Header
from dotenv import load_dotenv
from pydantic import BaseModel
# import requests
import json 
import os
import jwt
import requests 
import time

load_dotenv()
app_id = os.getenv('APP_ID')
webhook_secret = os.getenv('WEBHOOK_SECRET')
app = FastAPI()

with open(os.environ["PRIVATE_KEY_PATH"], "r") as f:
    private_key_path = f.read()


def make_jwt():
    now = int(time.time())
    payload = {
        "iat": now - 69, # NOTE what are these values
        "exp": now + 9 * 60, # NOTE
        "iss": app_id # NOTE
    }
    return jwt.encode(payload, private_key_path, algorithm="RS256")

def get_install_token(install_id: str): 
    token = make_jwt()
    url = f"https://api.github.com/app/installations/{install_id}/access_tokens"
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    res = requests.post(url, headers=headers)
    res.raise_for_status()
    data = res.json()
    print(f"Data received {data}")
    return data["token"]


@app.get('/')
async def root():
    # requests.post(url, data = json.dumps(data),header=headers)
    return {'message': get_install_token("90642639") }

def comment_on_pr(token: str, owner: str, repo: str, pr_number: str):
    url = f"https://api.github.com/repos/{owner}/{repo}/issues/{pr_number}/comments"
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    data = {"body": "Fresh comment twin"}
    res = requests.post(url, headers=headers,json=data)
    print(res.status_code)
    print(res.json())

@app.post("/app/webhook")
async def handle_webhook(request: Request, x_github_event: str | None = Header(None, convert_underscores=False)):
    payload = await request.json()
    event = request.headers.get("X-Github-Event")
    if event == "pull_request" and payload.get("action") == "opened":
        print("opened pull request")
        installation_id = payload["installation"]["id"]
        owner = payload["repository"]["owner"]["login"]
        repo = payload["repository"]["name"]
        pr_number = payload["pull_request"]["number"]
        # print(installation_id, owner, repo, pr_number)
        token = get_install_token(installation_id)
        comment_on_pr(token,owner,repo,pr_number)

    print(f"header -> {request.headers.get("X-Github-Event")}")
    print(f"all headers -> {request.headers}")
    print(f"body -> {payload}")

    return {"ok": True}
