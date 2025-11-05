
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ecs as ecs } from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { aws_ecr as ecr } from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { aws_logs as logs } from 'aws-cdk-lib';
import { aws_ssm as ssm } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

// NOTE Should probally make a restrictions on who can push and pull

interface EcsTaskStackProps extends StackProps {
  vpc: ec2.IVpc;
}

export class EcsTaskStack extends Stack {
  constructor(scope: Construct, id: string, props: EcsTaskStackProps) {
    super(scope, id, props);
    const sg = new ec2.SecurityGroup(this, 'FargateServiceSG', {
      vpc: props.vpc,
      description: 'Allow outbound HTTPS for Fargate tasks',
      allowAllOutbound: true,
    });
    const cluster = new ecs.Cluster(this, 'FargateCluster', {vpc: props.vpc})
    const taskDefinition = new ecs.TaskDefinition(this, 'TD', {
	memoryMiB: '512',
	cpu: '256',
	compatibility: ecs.Compatibility.FARGATE,
    });
    // Task definiton needs permissions to pull from ECR
    taskDefinition.addToExecutionRolePolicy(new iam.PolicyStatement({
    actions: [
	"ecr:GetAuthorizationToken",
	"ecr:BatchCheckLayerAvailability",
	"ecr:GetDownloadUrlForLayer",
	"ecr:BatchGetImage",
	"logs:CreateLogStream",
	"logs:PutLogEvents"
    ],
    effect: iam.Effect.ALLOW,
    resources: ["*"],
    }));
    

    const repo = ecr.Repository.fromRepositoryArn(this, 'TaffyProdRepo', "arn:aws:ecr:us-east-1:037444031381:repository/taffy-prod-images")
    const logGroup = new logs.LogGroup(this, 'TaskLogGroup', {
      logGroupName: '/ecs/my-run-task',
      removalPolicy: RemovalPolicy.DESTROY,
    });   

    new ssm.StringParameter(this, 'SgParam', {
      parameterName: '/taffy/security_group_fargate',
      description: 'Security Group for Fargate tasks, allows all outbound',
      stringValue: sg.securityGroupId,
    });

    new ssm.StringParameter(this, 'TaskDefParam', {
      parameterName: '/taffy/taskdef_arn',
      description: 'ARN of Fargate task definition',
      stringValue: taskDefinition.taskDefinitionArn,
    });

    new ssm.StringParameter(this, 'ClusterParam', {
	allowedPattern: '.*',
	description: 'Cluster arn',
	parameterName: '/taffy/cluster',
	stringValue: cluster.clusterArn,
	//tier: ssm.ParameterTier.ADVANCED,
    })
    new ssm.StringParameter(this, 'PrivateSubnetsParam', {
	parameterName: '/taffy/vpc/private-subnets',
	description: 'Comma-separated list of private subnet IDs for ECS tasks',
	stringValue: props.vpc.privateSubnets.map(s => s.subnetId).join(','),
    });

    new ssm.StringParameter(this, 'PublicSubnetsParam', {
	parameterName: '/taffy/vpc/public-subnets',
	description: 'Comma-separated list of public subnet IDs for ECS tasks',
	stringValue: props.vpc.publicSubnets.map(s => s.subnetId).join(','),
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