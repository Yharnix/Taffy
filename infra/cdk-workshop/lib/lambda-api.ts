// Importing necessary AWS CDK modules and constructs
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ssm as ssm } from 'aws-cdk-lib'
import { aws_iam as iam } from 'aws-cdk-lib'
import lambda = require('aws-cdk-lib/aws-lambda')
import apigw = require('aws-cdk-lib/aws-apigateway')

// Defining the CDK stack class that extends the Stack class
export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props); // Calling the constructor of the parent class (Stack)
    const public_subnets = ssm.StringParameter.valueFromLookup(this, '/taffy/vpc/public-subnets')
    const task_arn = ssm.StringParameter.valueFromLookup(this, '/taffy/taskdef_arn')
    const cluster_arn = ssm.StringParameter.valueFromLookup(this, '/taffy/cluster')
    const fn = new lambda.Function(this, 'MyFunction', {
      code: lambda.Code.fromAsset('lib/lambda-handler'),
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'index.handler',
      environment: {
        CLUSTER_ARN: cluster_arn,
        TASK_ARN: task_arn,
        PUBLIC_SUBNETS: public_subnets
      },
    });
    fn.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ecs:RunTask', 'iam:PassRole'],
      resources: ['*'], // Can be restricted later
    }));
    const endpoint = new apigw.LambdaRestApi(this, 'MyEndpoint', {
	handler: fn,
	restApiName: "TaskRunnerApi"
    })
  }
}

