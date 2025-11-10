import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import {aws_ec2 as ec2} from 'aws-cdk-lib';
import { aws_ssm as ssm } from 'aws-cdk-lib';
import { aws_ecs as ecs } from 'aws-cdk-lib';
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
    const publicSubnets = ssm.StringParameter.valueForStringParameter(this, '/taffy/vpc/public-subnets');
    const privateSubnets = ssm.StringParameter.valueForStringParameter(this, '/taffy/vpc/private-subnets');
    const clusterArn = ssm.StringParameter.valueForStringParameter(this, '/taffy/cluster/customer');
    const clusterName = ssm.StringParameter.valueForStringParameter(this, '/taffy/cluster/customer/name');
    console.log(`Public Subnets -> ${publicSubnets}`)
    console.log(`Private Subnets -> ${privateSubnets}`)
    console.log(`Vpc Id -> ${vpcId}`)
    
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'LookupVpc',{
      vpcId: vpcId,
      availabilityZones: ["us-east-1a"],
      publicSubnetIds: publicSubnets.split(','),
      privateSubnetIds: privateSubnets.split(','),
    })

    const cluster = ecs.Cluster.fromClusterAttributes(this, 'ImportedCluster', {
      clusterArn,
      clusterName: 'CustomerCluster', // replace or fetch via SSM
      vpc,
      securityGroups: [],
    });

    const queue = new sqs.Queue(this, `${owner}${repo}${pr}${sha.substring(0,7)}`, {
      visibilityTimeout: cdk.Duration.seconds(300)
    });
  }
}
