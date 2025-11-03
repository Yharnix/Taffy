
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ecr as ecr } from 'aws-cdk-lib';

// NOTE Should probally make a restrictions on who can push and pull

export class EcrStack extends Stack {
  public readonly repository: ecr.Repository
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const personal_repo = new ecr.Repository(this, 'PersonalRepo', {
      repositoryName: 'taffy-prod-images'
    })
    const repository = new ecr.Repository(this, 'Repo', {
      repositoryName: 'taffy-images'
    })
    this.repository = repository
  }
}