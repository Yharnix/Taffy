# Dockerfile
FROM node:20-alpine

# Install AWS CLI and CDK
RUN apk add --no-cache python3 py3-pip bash git jq curl \
  && python3 -m venv venv \
  && . ./venv/bin/activate \
  && pip3 install awscli \
  && npm install -g aws-cdk

# Set working directory
WORKDIR /app

COPY package*.json  ./

# npm install
RUN npm install

# Copy your CDK app
COPY . .

# Install dependencies
# RUN npm install -g aws-cdk


# Default command
# CMD ["cdk", "deploy", "--require-approval", "never"]
ENTRYPOINT ["./entrypoint.sh"]
