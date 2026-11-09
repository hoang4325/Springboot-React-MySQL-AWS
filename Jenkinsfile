
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '15'))
        timeout(time: 90, unit: 'MINUTES')
        skipDefaultCheckout(true)
    }

    triggers {
        githubPush()
    }

    parameters {
        choice(
            name: 'ACTION',
            choices: ['ci', 'deploy'],
            description: 'ci: test/validate only; deploy: AWS deployment with approval'
        )

        choice(
            name: 'TARGET',
            choices: ['all', 'backend', 'frontend'],
            description: 'Which application component to deploy'
        )

        string(
            name: 'AWS_REGION',
            defaultValue: 'ap-southeast-1',
            description: 'AWS region'
        )

        string(
            name: 'PROJECT_NAME',
            defaultValue: 'myapp',
            description: 'Terraform project prefix'
        )
    }

    environment {
        TF_IN_AUTOMATION = 'true'
        TF_INPUT         = '0'
        AWS_PAGER        = ''
    }

    stages {

        // ==========================================
        // 1. CHECKOUT SOURCE CODE
        // ==========================================
        stage('Checkout') {
            steps {
                script {
                    def scmInfo = checkout scm

                    env.SCM_BRANCH = env.BRANCH_NAME ?:
                        (scmInfo.GIT_BRANCH ?: env.GIT_BRANCH ?: '')

                    env.IMAGE_TAG = 'sha-' + sh(
                        script: 'git rev-parse --short=12 HEAD',
                        returnStdout: true
                    ).trim()

                    echo "Branch: ${env.SCM_BRANCH}"
                    echo "Image tag: ${env.IMAGE_TAG}"
                }
            }
        }

        // ==========================================
        // 2. CHECK REQUIRED TOOLS
        // ==========================================
        stage('Check tool versions') {
            steps {
                sh '''#!/usr/bin/env bash
set -euo pipefail

java -version
node --version
npm --version
docker --version
terraform version | head -n 1
aws --version
curl --version | head -n 1
'''
            }
        }

        // ==========================================
        // 3. BACKEND UNIT TESTS
        // ==========================================
        stage('Backend tests') {
            steps {
                sh '''#!/usr/bin/env bash
set -euo pipefail

cd backend

sed -i 's/\\r$//' mvnw
chmod +x mvnw

./mvnw -B -ntp test
'''
            }
        }

        // ==========================================
        // 4. FRONTEND BUILD
        // ==========================================
        stage('Build frontend') {
            steps {
                sh '''#!/usr/bin/env bash
set -euo pipefail

cd frontend

npm ci

VITE_API_BASE_URL=/api/v1 npm run build
'''
            }
        }

        // ==========================================
        // 5. VALIDATE TERRAFORM
        // ==========================================
        stage('Validate Terraform') {
            steps {
                sh '''#!/usr/bin/env bash
set -euo pipefail

for stack in networking database registry application frontend; do

    dir="terraform/environments/prod/$stack"

    echo "Validating $dir"

    terraform -chdir="$dir" init \
        -backend=false \
        -input=false \
        -no-color \
        -lockfile=readonly

    terraform -chdir="$dir" validate \
        -no-color

done
'''
            }
        }

        // ==========================================
        // 6. CI DOCKER BUILD
        // ==========================================
        stage('CI Docker build') {
            when {
                expression {
                    params.ACTION == 'ci'
                }
            }

            steps {
                sh '''#!/usr/bin/env bash
set -euo pipefail

docker build \
    --platform linux/amd64 \
    -t "todo-backend-ci:${IMAGE_TAG}" \
    ./backend
'''
            }
        }

        // ==========================================
        // 7. DEPLOYMENT APPROVAL
        // ==========================================
        stage('Approve AWS deployment') {
            when {
                expression {
                    params.ACTION == 'deploy'
                }
            }

            steps {
                script {
                    def branch = (env.SCM_BRANCH ?: '')
                        .replaceFirst('^refs/heads/', '')
                        .replaceFirst('^refs/remotes/', '')
                        .replaceFirst('^origin/', '')

                    if (branch != 'main' || env.CHANGE_ID) {
                        error(
                            "Deployment is permitted only from main; checked out: ${env.SCM_BRANCH}"
                        )
                    }

                    if (!env.TF_STATE_BUCKET?.trim()) {
                        error(
                            'Missing Jenkins environment variable TF_STATE_BUCKET'
                        )
                    }

                    if (!env.TF_STATE_KMS_KEY_ARN?.trim()) {
                        error(
                            'Missing Jenkins environment variable TF_STATE_KMS_KEY_ARN'
                        )
                    }
                }

                input(
                    message: "Deploy ${params.TARGET} to AWS (${params.AWS_REGION})?",
                    ok: 'Deploy'
                )

                sh '''#!/usr/bin/env bash
set -euo pipefail

aws sts get-caller-identity \
    --query '{Account:Account,Arn:Arn}' \
    --output json

aws s3api head-bucket \
    --bucket "$TF_STATE_BUCKET" \
    --region "$AWS_REGION"

aws kms describe-key \
    --key-id "$TF_STATE_KMS_KEY_ARN" \
    --region "$AWS_REGION" \
    --query 'KeyMetadata.KeyState' \
    --output text
'''
            }
        }

        // ==========================================
        // 8. BUILD & PUSH BACKEND IMAGE TO ECR
        // ==========================================
        stage('Push backend image to ECR') {
            when {
                expression {
                    params.ACTION == 'deploy' &&
                    params.TARGET in ['all', 'backend']
                }
            }

            steps {
                sh '''#!/usr/bin/env bash
set -euo pipefail

repo_name="${PROJECT_NAME}-prod-backend"

repo_uri=$(aws ecr describe-repositories \
    --region "$AWS_REGION" \
    --repository-names "$repo_name" \
    --query 'repositories[0].repositoryUri' \
    --output text)

image_uri="${repo_uri}:${IMAGE_TAG}"

if aws ecr describe-images \
    --region "$AWS_REGION" \
    --repository-name "$repo_name" \
    --image-ids "imageTag=$IMAGE_TAG" \
    >/dev/null 2>&1; then

    echo "Immutable image already present: $image_uri"

else

    docker build \
        --platform linux/amd64 \
        -t "$image_uri" \
        ./backend

    aws ecr get-login-password \
        --region "$AWS_REGION" | \
        docker login \
            --username AWS \
            --password-stdin \
            "${repo_uri%%/*}"

    docker push "$image_uri"

fi
'''
            }
        }

        // ==========================================
        // 9. DEPLOY BACKEND: ECS + ALB
        // ==========================================
        stage('Terraform deploy Application (ECS + ALB)') {
            when {
                expression {
                    params.ACTION == 'deploy' &&
                    params.TARGET in ['all', 'backend']
                }
            }

            steps {
                sh '''#!/usr/bin/env bash
set -euo pipefail

stack='terraform/environments/prod/application'

# Generate Terraform S3 backend configuration
cat > "$stack/backend.tf" <<'HCL'
terraform {
  backend "s3" {}
}
HCL

# Initialize Terraform remote state
terraform -chdir="$stack" init \
    -reconfigure \
    -input=false \
    -no-color \
    -backend-config="bucket=$TF_STATE_BUCKET" \
    -backend-config="key=prod/application/terraform.tfstate" \
    -backend-config="region=$AWS_REGION" \
    -backend-config="encrypt=true" \
    -backend-config="kms_key_id=$TF_STATE_KMS_KEY_ARN" \
    -backend-config="use_lockfile=true"

# Terraform plan
terraform -chdir="$stack" plan \
    -input=false \
    -no-color \
    -out=deploy.tfplan \
    -var="aws_region=$AWS_REGION" \
    -var="project_name=$PROJECT_NAME" \
    -var="state_bucket_name=$TF_STATE_BUCKET" \
    -var="image_tag=$IMAGE_TAG"

# Terraform apply
terraform -chdir="$stack" apply \
    -input=false \
    -no-color \
    deploy.tfplan

# Get ECS outputs
cluster=$(terraform -chdir="$stack" output -raw ecs_cluster_name)

service=$(terraform -chdir="$stack" output -raw ecs_service_name)

# Wait until ECS service is stable
aws ecs wait services-stable \
    --region "$AWS_REGION" \
    --cluster "$cluster" \
    --services "$service"

# Verify backend health
api_url=$(terraform -chdir="$stack" output -raw application_url)

curl \
    --fail \
    --silent \
    --show-error \
    --retry 12 \
    --retry-delay 10 \
    --retry-all-errors \
    "$api_url/actuator/health"

echo "Backend API: $api_url"
'''
            }
        }

        // ==========================================
        // 10. DEPLOY FRONTEND: S3 + CLOUDFRONT
        // ==========================================
        stage('Terraform deploy Frontend (S3 + CloudFront)') {
            when {
                expression {
                    params.ACTION == 'deploy' &&
                    params.TARGET in ['all', 'frontend']
                }
            }

            steps {
                sh '''#!/usr/bin/env bash
set -euo pipefail

stack='terraform/environments/prod/frontend'

# Generate Terraform S3 backend configuration
cat > "$stack/backend.tf" <<'HCL'
terraform {
  backend "s3" {}
}
HCL

# Initialize Terraform remote state
terraform -chdir="$stack" init \
    -reconfigure \
    -input=false \
    -no-color \
    -backend-config="bucket=$TF_STATE_BUCKET" \
    -backend-config="key=prod/frontend/terraform.tfstate" \
    -backend-config="region=$AWS_REGION" \
    -backend-config="encrypt=true" \
    -backend-config="kms_key_id=$TF_STATE_KMS_KEY_ARN" \
    -backend-config="use_lockfile=true"

# Terraform plan
terraform -chdir="$stack" plan \
    -input=false \
    -no-color \
    -out=deploy.tfplan \
    -var="aws_region=$AWS_REGION" \
    -var="project_name=$PROJECT_NAME" \
    -var="state_bucket_name=$TF_STATE_BUCKET"

# Terraform apply
terraform -chdir="$stack" apply \
    -input=false \
    -no-color \
    deploy.tfplan

# Get Terraform outputs
bucket=$(terraform -chdir="$stack" output -raw s3_bucket_name)

distribution=$(terraform -chdir="$stack" output -raw cloudfront_distribution_id)

# Upload React static files to S3
aws s3 sync \
    frontend/dist \
    "s3://$bucket/" \
    --delete \
    --region "$AWS_REGION"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id "$distribution" \
    --paths '/*'

frontend_url=$(terraform -chdir="$stack" output -raw frontend_url)

echo "Frontend URL: $frontend_url"
'''
            }
        }
    }

    // ==========================================
    // PIPELINE RESULT & CLEANUP
    // ==========================================
    post {
        success {
            echo "Pipeline completed successfully"
            echo "ACTION=${params.ACTION}"
            echo "TARGET=${params.TARGET}"
        }

        failure {
            echo 'Pipeline failed'
            echo 'Check Jenkins console output, ECS events and CloudWatch logs'
        }

        always {
            deleteDir()
        }
    }
}
