# hlots of potential edge cases with these api calls
# for one repos can not be empty

from fastapi import FastAPI, Request, Header
import base64
from dotenv import load_dotenv
from pydantic import BaseModel
# import requests
import json 
import os
import jwt
import requests 
import time

load_dotenv()
print("PRIVATE_KEY_PATH:", os.getenv("PRIVATE_KEY_PATH"))
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
    return {'message': get_install_token("90862783") }

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
def make_headers(token: str):
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    return headers

def make_pr(repo: str,token: str, default_branch: str):
    headers = make_headers(token)
    url = f"https://api.github.com/repos/{repo}/pulls"
    data = {"title": "Custom workflow required by Taffy", "body": "Please approve this pr to allow taffy to spin up infrastructure", "head":"taffy_workflow", "base":default_branch}
    res = requests.post(url, headers=headers, json=data).json()
    
def commit_workflow(repo, token):
    headers = make_headers(token)
    url = f"https://api.github.com/repos/{repo}/contents/.github/workflows/taffy.yml"
    with open("./workflows/taffy.yml", "rb") as f:
        content = f.read()
        b64_content = base64.b64encode(content).decode("utf-8")
    data = {"message": "Taffy BOT -> Add a workflow file to your repo", "content": b64_content, "branch": "taffy_workflow"}
    res = requests.put(url, headers=headers, json=data).json()

def create_branch(repo: str, sha: str, token: str):
    headers = make_headers(token)
    url = f"https://api.github.com/repos/{repo}/git/refs"
    data = {"ref":"refs/heads/taffy_workflow", "sha":sha}
    res = requests.post(url,headers=headers,json=data).json()

def get_default_branch_sha(repo: str, branch: str, token: str):
    headers = make_headers(token)
    url = f"https://api.github.com/repos/{repo}/git/ref/heads/{branch}"
    print(url)
    res = requests.get(url,headers=headers).json()
    print(res)
    return res["object"]["sha"]
    
def get_default_branch(repo: str, token: str):
    url = f"https://api.github.com/repos/{repo}"
    print(url)
    headers = make_headers(token)
    res = requests.get(url,headers=headers).json()
    return res["default_branch"]

def create_pr(repo: str, token: str):
    default_branch = get_default_branch(repo, token)
    default_sha = get_default_branch_sha(repo, default_branch, token)
    create_branch(repo, default_sha, token)
    commit_workflow(repo, token)
    make_pr(repo, token,default_branch)

@app.get("/installed")
def installed_app():
    token = get_install_token("90862783")
    headers = make_headers(token)
    headers = {"Accept": "application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Authorization": f"Bearer {make_jwt()}" }
    r = requests.get(f"https://api.github.com/repos/Yharnix/ci/installation", headers=headers)
    print(r.json())
    return r.json()
     
    
@app.post("/app/webhook")
async def handle_webhook(request: Request, x_github_event: str | None = Header(None, convert_underscores=False)):
    payload = await request.json()
    event = request.headers.get("X-Github-Event")
    # NOTE This works, I can detect when the whole process compeltes
    # NOTE The plan is to when I detect, 
    if event == "workflow_run":
        action = payload.get("action")
        if action == "completed":
            print("Workflow completed")
    if event == "installation" and payload.get("action") == "created":
        print("New app installed can now begin branch creation, pr making and workflow file install")
        installation_id = payload["installation"]["id"]
        repositories = payload["repositories"]
        token = get_install_token(installation_id)
        for repo in repositories:
            full_name = repo["full_name"]
            # b_name = get_default_branch(full_name, token)
            create_pr(full_name, token)

        # repos = payload["repositories"]
        # org = payload["organization"]
        # req = payload["requester"]
        # sender = payload["sender"]
        # repo = payload["repository"]
        # print(f"repo -> {repo}\n org -> {org}\n -> sender -> {sender}\n reqeuster -> {requester}\n repos -> {repos}")
        # DONE find the default branch 
        # DONE get the latest sha
        # DONE make a new branch from the latest sha
        # DONE make a commit adding the contents to that branch
        # TODO open a pr adding this workflw file to the repository


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
