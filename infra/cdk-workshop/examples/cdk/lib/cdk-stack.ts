import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import {aws_ec2 as ec2} from 'aws-cdk-lib';
import { aws_ssm as ssm } from 'aws-cdk-lib';
import { aws_ecs as ecs } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}


export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const repo = requireEnv('REPO')
    const owner = requireEnv('OWNER')
    const sha = requireEnv('SHA')
    const pr = requireEnv('PR')
    const vpcId = ssm.StringParameter.valueForStringParameter(this, '/taffy/vpcid');
    const publicSubnets = ssm.StringListParameter.valueForTypedListParameter(this, '/taffy/vpc/public-subnets');
    const privateSubnets = ssm.StringListParameter.valueForTypedListParameter(this, '/taffy/vpc/private-subnets');
    const clusterArn = ssm.StringParameter.valueForStringParameter(this, '/taffy/cluster/customer');
    const clusterName = ssm.StringParameter.valueForStringParameter(this, '/taffy/cluster/customer/name');
    console.log(`Public Subnets -> ${publicSubnets}`)
    console.log(`Private Subnets -> ${privateSubnets}`)
    console.log(`Vpc Id -> ${vpcId}`)
    
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'LookupVpc',{
      vpcId: vpcId,
      availabilityZones: ["us-east-1a"],
      publicSubnetIds: publicSubnets,
      privateSubnetIds: privateSubnets,
    })

    const cluster = ecs.Cluster.fromClusterAttributes(this, 'ImportedCluster', {
      clusterArn,
      clusterName,// replace or fetch via SSM
      vpc,
      securityGroups: [],
    });
    
   const image_tag = `${owner}-${repo}-${sha}`
   const imageUri = `037444031381.dkr.ecr.us-east-1.amazonaws.com/taffy-images:${image_tag}`


   const serviceName = `${repo}-${owner}-${pr}-${sha.substring(0,7)}`
    const service = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'PreviewService', {
      cluster,
      desiredCount: 1,
      publicLoadBalancer: true,
      assignPublicIp: true,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry(imageUri),
        containerPort: 80,
      },
      serviceName,
    });
    
    service.taskDefinition.executionRole?.addToPrincipalPolicy(
      new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
      ],
      resources: ["*"],
    }));

    new cdk.CfnOutput(this, 'ServiceDNS', {
      value: `http://${service.loadBalancer.loadBalancerDnsName}`,
    });

  }
}