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

    response = {
        "resource": resource,
        "path": path,
        "httpMethod": http_method,
        "headers": headers,
        "queryStringParameters": query_params,
        "body": body
    }
    subnet = os.environ('SUBNET_ID')
    task = os.environ('TASK_ARN')
    cluser = os.environ('CLUSTER_ARN')

    # Build and return API Gateway–style response
    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": f"Parameter value baked in: {os.environ.get('PARAM_VALUE')}",
            # "debug": response  # uncomment if you want to see the event details
        })
    }
