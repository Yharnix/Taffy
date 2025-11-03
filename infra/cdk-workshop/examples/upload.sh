AWS_REGION=us-east-1
AWS_ACCOUNT_ID=037444031381
aws ecr get-login-password --region $AWS_REGION --profile admin \
  | docker login \
  --username AWS \
  --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com


echo "$AWS_ACCOUNT_ID.dkr.erc.$AWS_REGION.amazonaws.com/taffy-prod-images:latest"
