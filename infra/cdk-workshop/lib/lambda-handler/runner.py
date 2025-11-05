import boto3
session = boto3.Session(profile_name="admin")
ecs = session.client('ecs', region_name="us-east-1")

cluster_var = "arn:aws:ecs:us-east-1:037444031381:cluster/TaskStack-FargateCluster7CCD5F93-UDIGTsJ2VtQw"
task_id = "arn:aws:ecs:us-east-1:037444031381:task-definition/TaskStackTD914A46F5:4"
subnet = "subnet-0c5a2f16faa21746c"

response = ecs.run_task(
    cluster=cluster_var,
    taskDefinition=task_id,
    launchType='FARGATE',
    networkConfiguration={
        'awsvpcConfiguration': {
            'subnets': [subnet],
            'securityGroups': ['sg-0dec959341e3ad8e2'],
            'assignPublicIp': 'ENABLED'
        }
    }


)
