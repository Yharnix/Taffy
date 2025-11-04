import boto3

aws ecs list-clusters --profile admin
aws ecs list-task-definitions --profile admin
aws ec2 describe-subnets --filters "Name=vpc-id,Values=<your-vpc-id>"


aws ecs run-task \
  --cluster arn:aws:ecs:us-east-1:037444031381:cluster/TaskStack-FargateCluster7CCD5F93-UDIGTsJ2VtQw \
  --launch-type FARGATE \
  --task-definition arn:aws:ecs:us-east-1:037444031381:task-definition/TaskStackTD914A46F5:3 \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-0f249fd29b5668fea],assignPublicIp=ENABLED}" \
  --profile admin



CLUSTER = arn:aws:ecs:us-east-1:037444031381:cluster/TaskStack-FargateCluster7CCD5F93-UDIGTsJ2VtQw
TAKSK_ID = arn:aws:ecs:us-east-1:037444031381:task-definition/TaskStackTD914A46F5:3

subnet = subnet-0f249fd29b5668fea
