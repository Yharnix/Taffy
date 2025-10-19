from fastapi import FastAPI
from dotenv import load_dotenv
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
url = "https://api.github.com/app/installations/90642639/access_tokens"

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

def get_install_token(): 
    token = make_jwt()
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    print("here")
    res = requests.post(url, headers=headers)
    res.raise_for_status()
    data = res.json()
    print(f"Data received {data}")
    return data


@app.get('/')
async def root():
    # requests.post(url, data = json.dumps(data),header=headers)
    return {'message': get_install_token() }
