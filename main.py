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
url = "https://api.github.com/user/repos"

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

async def get_install_token(): 
    app_jwt = make_jwt()
    


@app.get('/')
async def root():
    # requests.post(url, data = json.dumps(data),header=headers)
    return {'message':make_jwt() }
