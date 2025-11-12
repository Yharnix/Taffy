docker build -t github:latest ./

AWS_REGION=us-east-1
AWS_ACCOUNT_ID=037444031381
aws ecr get-login-password --region $AWS_REGION --profile admin \
  | docker login \
  --username AWS \
  --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

docker tag github "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/taffy-prod-images:github"

docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/taffy-prod-images:github"
