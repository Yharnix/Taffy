import boto3
import json
import os

def handler(event, context):
    # Extract specific properties from the event object
    resource = event.get('resource')
    path = event.get('path')
    http_method = event.get('httpMethod')
    headers = event.get('headers')
    query_params = event.get('queryStringParameters')
    body = event.get('body')

    ecs = boto3.client('ecs', region_name="us-east-1")

    response = {
        "resource": resource,
        "path": path,
        "httpMethod": http_method,
        "headers": headers,
        "queryStringParameters": query_params,
        "body": body
    }
    subnet = os.environ.get('PUBLIC_SUBNETS').split(',')[0]
    task = os.environ.get('TASK_ARN')
    cluster_arn = os.environ.get('CLUSTER_ARN')

    # Build and return API Gateway–style response

    response = ecs.run_task(
        cluster=cluster_arn,
        taskDefinition=task,
        launchType='FARGATE',
        networkConfiguration={
            'awsvpcConfiguration': {
                'subnets': [subnet],
                'assignPublicIp': 'ENABLED'
            }
        }
    )
    return {
        "statusCode": 200,
        "body": json.dumps({
            "subnets": f"subnets: {subnet}",
            "tasks": f"task: {task}",
            "clusters": f"cluster_arn: {cluster_arn}",
            # "debug": response  # uncomment if you want to see the event details
        })
    }
