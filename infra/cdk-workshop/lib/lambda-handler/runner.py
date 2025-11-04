import boto3
session = boto3.Session(profile_name="admin")
ecs = session.client('ecs', region_name="us-east-1")

cluster_var = "arn:aws:ecs:us-east-1:037444031381:cluster/TaskStack-FargateCluster7CCD5F93-UDIGTsJ2VtQw"
task_id = "arn:aws:ecs:us-east-1:037444031381:task-definition/TaskStackTD914A46F5:3"
subnet = "subnet-0a286cb042d8b566c"

response = ecs.run_task(
    cluster=cluster_var,
    taskDefinition=task_id,
    launchType='FARGATE',
    networkConfiguration={
        'awsvpcConfiguration': {
            'subnets': [subnet],
            'assignPublicIp': 'ENABLED'
        }
    }


)
