#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkWorkshopStack } from '../lib/cdk-workshop-stack';
import { EcrStack } from '../lib/ecr-stack';
import { VpcStack } from '../lib/vpc-stack';
import { LambdaStack } from '../lib/lambda-api';
import { EcsTaskStack } from '../lib/ecs-task';

const app = new cdk.App();
new CdkWorkshopStack(app, 'CdkWorkshopStack', {
  // If you don't specify 'env', this stack will be environment-agnostic.
  //  * Account/Region-dependent features and context lookups will not work,
  //  * but a single synthesized template can be deployed anywhere.

  // Uncomment the next line to specialize this stack for the AWS Account
  //  * and Region that are implied by the current CLI configuration.
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  // Uncomment the next line if you know exactly what Account and Region you
  //  * want to deploy the stack to.
  env: { account: '037444031381', region: 'us-east-1' },

  // For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html
});

const ecr_stack = new EcrStack(app, 'EcrStack', {
  env: { account: '037444031381', region: 'us-east-1' },
})

const vpc_stack = new VpcStack(app, 'VpcStack', {
  env: { account: '037444031381', region: 'us-east-1' },
  repository: ecr_stack.repository
})

const env = { account: '037444031381', region: 'us-east-1' }

new LambdaStack(app, 'LambdaStack', {
    env: env,
})


new EcsTaskStack(app, 'TaskStack', {
    vpc: vpc_stack.vpc, 
    env: env,
})
