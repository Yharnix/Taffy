import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ecr as ecr } from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { aws_ssm as ssm } from 'aws-cdk-lib';
import { aws_ecs as ecs } from 'aws-cdk-lib';
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import {aws_route53 as route53} from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib'
import { CfnResource } from 'aws-cdk-lib'



// NOTE Should probally make a restrictions on who can push and pull

export const PREFIX = 'my-app';

interface VpcStackProps extends StackProps {
  repository: ecr.IRepository;
}

export class VpcStack extends Stack {
  readonly vpc: ec2.Vpc;
  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);
    const { repository } = props;
    
    const zone = route53.HostedZone.fromLookup(this, 'TaffyZone', {
      domainName: 'taffyrun.com',
    });

    
    // const hosted_zone = zone.node.findChild('Resource') as CfnResource;
    // hosted_zone.applyRemovalPolicy(RemovalPolicy.RETAIN)

    const vpc = new ec2.Vpc(this, "MyVpc", {
      maxAzs: 3 // Default is all AZs in region
    });
    this.vpc = vpc

    const cluster = new ecs.Cluster(this, "GithubCluster", {
      vpc: vpc
    });

    const customer_cluster = new ecs.Cluster(this, 'CustomerCluster', {vpc: vpc})
    

    new ssm.StringParameter(this, 'CustomerClusterName', {
	allowedPattern: '.*',
	description: 'VPC id for other stacks to reference',
	parameterName: '/taffy/cluster/customer/name',
	stringValue: customer_cluster.clusterName,
	//tier: ssm.ParameterTier.ADVANCED,
    })
    
    new ssm.StringParameter(this, 'CustomerClusterArn', {
	allowedPattern: '.*',
	description: 'VPC id for other stacks to reference',
	parameterName: '/taffy/cluster/customer',
	stringValue: customer_cluster.clusterArn,
	//tier: ssm.ParameterTier.ADVANCED,
    })


    
    new ssm.StringParameter(this, 'Parameter', {
	allowedPattern: '.*',
	description: 'VPC id for other stacks to reference',
	parameterName: '/taffy/vpcid',
	stringValue: vpc.vpcId,
	//tier: ssm.ParameterTier.ADVANCED,
    })


    // Create a load-balanced Fargate service and make it public
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyFargateService", {
      cluster: cluster, // Required
      cpu: 256, // Default is 256
      domainZone: zone,
      domainName: 'github-webhook.taffyrun.com',
      desiredCount: 1, // Default is 1
      taskImageOptions: { image: ecs.ContainerImage.fromEcrRepository(repository, "github") },
      memoryLimitMiB: 2048, // Default is 512
      publicLoadBalancer: true // Default is true
    });
  }
}