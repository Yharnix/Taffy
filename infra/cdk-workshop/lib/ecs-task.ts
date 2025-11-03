
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ecs as ecs } from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { aws_ecr as ecr } from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { aws_logs as logs } from 'aws-cdk-lib';

// NOTE Should probally make a restrictions on who can push and pull

export class EcsTaskStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
      isDefault: true,
    });
    const cluster = new ecs.Cluster(this, 'FargateCluster', {vpc})
    const taskDefinition = new ecs.TaskDefinition(this, 'TD', {
	memoryMiB: '512',
	cpu: '256',
	compatibility: ecs.Compatibility.FARGATE,
    });
    const repo = ecr.Repository.fromRepositoryArn(this, 'TaffyProdRepo', "arn:aws:ecr:us-east-1:037444031381:repository/taffy-prod-images")
    const logGroup = new logs.LogGroup(this, 'TaskLogGroup', {
      logGroupName: '/ecs/my-run-task',
      removalPolicy: RemovalPolicy.DESTROY,
    });   

    const containerDefinition = taskDefinition.addContainer('TheContainer', {
	image: ecs.ContainerImage.fromEcrRepository(repo,"latest"),
	memoryLimitMiB: 256,
	logging: ecs.LogDriver.awsLogs({

          streamPrefix: 'ecs',
	  logGroup,
        })
    });
  }
}