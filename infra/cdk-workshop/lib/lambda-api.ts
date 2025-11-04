// Importing necessary AWS CDK modules and constructs
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ssm as ssm } from 'aws-cdk-lib'
import lambda = require('aws-cdk-lib/aws-lambda')
import apigw = require('aws-cdk-lib/aws-apigateway')

// Defining the CDK stack class that extends the Stack class
export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props); // Calling the constructor of the parent class (Stack)
    const paramValue = ssm.StringParameter.valueFromLookup(this, '/taffy/goofy-string')
    const fn = new lambda.Function(this, 'MyFunction', {
      code: lambda.Code.fromAsset('lib/lambda-handler'),
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'index.handler',
      environment: {
        PARAM_VALUE: paramValue
      },
    });
    const endpoint = new apigw.LambdaRestApi(this, 'MyEndpoint', {
	handler: fn,
	restApiName: "TaskRunnerApi"
    })
  }
}

