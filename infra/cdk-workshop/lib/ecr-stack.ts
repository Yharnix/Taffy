
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ecr as ecr } from 'aws-cdk-lib';

// NOTE Should probally make a restrictions on who can push and pull

export class EcrStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const repository = new ecr.Repository(this, 'Repo', {
      repositoryName: 'taffy-images'
    })
  }
}