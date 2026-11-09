
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 90, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15'))
        skipDefaultCheckout(true)
    }

    parameters {
        choice(
            name: 'ACTION',
            choices: ['ci', 'deploy'],
            description: 'ci = check only; deploy = deploy after approval'
        )

        choice(
            name: 'TARGET',
            choices: ['all', 'backend', 'frontend'],
            description: 'Deployment target'
        )

        string(
            name: 'AWS_REGION',
            defaultValue: 'ap-southeast-1',
            description: 'AWS Region'
        )

        string(
            name: 'PROJECT_NAME',
            defaultValue: 'myapp',
            description: 'Terraform project name'
        )
    }

    environment {
        TF_IN_AUTOMATION = 'true'
        TF_INPUT = '0'
        AWS_PAGER = ''

        // Configure TF_STATE_BUCKET in Jenkins Global Environment.
        // AWS credentials should come from an IAM Role
        // or Jenkins Credentials, not from the repository.
    }

    stages {

        // ==========================================
        // 1. CHECKOUT SOURCE CODE
        // ==========================================
        stage('Checkout') {
            steps {
                checkout scm

                script {
                    env.IMAGE_TAG = 'sha-' + sh(
                        script: 'git rev-parse --short=12 HEAD',
                        returnStdout: true
                    ).trim()
                }

                echo "Image tag: ${env.IMAGE_TAG}"
                echo "Action: ${params.ACTION}"
                echo "Target: ${params.TARGET}"
            }
        }

        // ==========================================
        // 2. CHECK BUILD TOOLS
        // ==========================================
        stage('Tool versions') {
            steps {
                sh '''#!/bin/bash
set -euo pipefail

java -version
node --version
npm --version
terraform version | head -n 2
aws --version
'''
            }
        }

        // ==========================================
        // 3. BACKEND UNIT TESTS
        // ==========================================
        stage('Backend unit tests') {
            steps {
                sh '''#!/bin/bash
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
        stage('Frontend build') {
            steps {
                sh '''#!/bin/bash
set -euo pipefail

cd frontend

npm ci

VITE_API_BASE_URL=/api/v1 npm run build
'''
            }
        }

        // ==========================================
        // 5. TERRAFORM VALIDATION
        // ==========================================
        stage('Terraform validation') {
            steps {
                sh '''#!/bin/bash
set -euo pipefail

for stack in application frontend; do

    path="terraform/environments/prod/$stack"

    rm -f "$path/backend.tf"
    rm -rf "$path/.terraform"

    terraform -chdir="$path" init \
        -backend=false \
        -input=false \
        -no-color

    terraform -chdir="$path" validate \
        -no-color

done
'''
            }
        }

        // ==========================================
        // 6. DEPLOY APPROVAL
        // ==========================================
        stage('Deploy approval and AWS preflight') {
            when {
                expression {
                    params.ACTION == 'deploy'
                }
            }

            steps {
                script {
                    def gitBranch = (
                        env.BRANCH_NAME ?: env.GIT_BRANCH ?: ''
                    ).replaceFirst('^origin/', '')

                    if (gitBranch != 'main' || env.CHANGE_ID) {
                        error(
                            "Deployment allowed only from main: ${gitBranch}"
                        )
                    }

                    if (!env.TF_STATE_BUCKET?.trim()) {
                        error(
                            'TF_STATE_BUCKET is not configured in Jenkins'
                        )
                    }
                }

                input(
                    message: "Deploy ${params.TARGET} to AWS ${params.AWS_REGION}?",
                    ok: 'Deploy'
                )

                sh '''#!/bin/bash
set -euo pipefail

command -v docker
command -v aws
command -v terraform

aws sts get-caller-identity \
    --query '{Account:Account,Arn:Arn}' \
    --output json

aws s3api head-bucket \
    --bucket "$TF_STATE_BUCKET"
'''
            }
        }

        // ==========================================
        // 7. BUILD & PUSH BACKEND IMAGE TO ECR
        // ==========================================
        stage('Build and push backend image to ECR') {
            when {
                expression {
                    params.ACTION == 'deploy' &&
                    params.TARGET in ['all', 'backend']
                }
            }

            steps {
                sh '''#!/bin/bash
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

    echo "Image already exists: $image_uri"

else

    docker build \
        --platform linux/amd64 \
        -t "$image_uri" \
        ./backend

    aws ecr get-login-password \
        --region "$AWS_REGION" |
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
        // 8. DEPLOY BACKEND USING TERRAFORM
        // ==========================================
        stage('Terraform apply application / ECS') {
            when {
                expression {
                    params.ACTION == 'deploy' &&
                    params.TARGET in ['all', 'backend']
                }
            }

            steps {
                sh '''#!/bin/bash
set -euo pipefail

stack="terraform/environments/prod/application"

cat > "$stack/backend.tf" <<'EOF'
terraform {
  backend "s3" {}
}
EOF

terraform -chdir="$stack" init \
    -reconfigure \
    -input=false \
    -no-color \
    -backend-config="bucket=$TF_STATE_BUCKET" \
    -backend-config="key=prod/application/terraform.tfstate" \
    -backend-config="region=$AWS_REGION" \
    -backend-config="encrypt=true" \
    -backend-config="use_lockfile=true"

terraform -chdir="$stack" plan \
    -input=false \
    -no-color \
    -out=deploy.tfplan \
    -var="aws_region=$AWS_REGION" \
    -var="project_name=$PROJECT_NAME" \
    -var="state_bucket_name=$TF_STATE_BUCKET" \
    -var="image_tag=$IMAGE_TAG"

terraform -chdir="$stack" apply \
    -input=false \
    -no-color \
    deploy.tfplan

cluster=$(terraform -chdir="$stack" output -raw ecs_cluster_name)
service=$(terraform -chdir="$stack" output -raw ecs_service_name)

aws ecs wait services-stable \
    --region "$AWS_REGION" \
    --cluster "$cluster" \
    --services "$service"

api_url=$(terraform -chdir="$stack" output -raw application_url)

curl \
    --fail \
    --silent \
    --show-error \
    --retry 18 \
    --retry-delay 10 \
    --retry-all-errors \
    "$api_url/actuator/health"

echo "Backend API: $api_url"
'''
            }
        }

        // ==========================================
        // 9. DEPLOY FRONTEND
        // ==========================================
        stage('Terraform apply frontend / CloudFront') {
            when {
                expression {
                    params.ACTION == 'deploy' &&
                    params.TARGET in ['all', 'frontend']
                }
            }

            steps {
                sh '''#!/bin/bash
set -euo pipefail

stack="terraform/environments/prod/frontend"

cat > "$stack/backend.tf" <<'EOF'
terraform {
  backend "s3" {}
}
EOF

terraform -chdir="$stack" init \
    -reconfigure \
    -input=false \
    -no-color \
    -backend-config="bucket=$TF_STATE_BUCKET" \
    -backend-config="key=prod/frontend/terraform.tfstate" \
    -backend-config="region=$AWS_REGION" \
    -backend-config="encrypt=true" \
    -backend-config="use_lockfile=true"

terraform -chdir="$stack" plan \
    -input=false \
    -no-color \
    -out=deploy.tfplan \
    -var="aws_region=$AWS_REGION" \
    -var="project_name=$PROJECT_NAME" \
    -var="state_bucket_name=$TF_STATE_BUCKET"

terraform -chdir="$stack" apply \
    -input=false \
    -no-color \
    deploy.tfplan

bucket=$(terraform -chdir="$stack" output -raw s3_bucket_name)

distribution=$(terraform -chdir="$stack" output -raw cloudfront_distribution_id)

aws s3 sync \
    frontend/dist \
    "s3://$bucket/" \
    --delete \
    --region "$AWS_REGION"

aws cloudfront create-invalidation \
    --distribution-id "$distribution" \
    --paths '/*'

frontend_url=$(terraform -chdir="$stack" output -raw frontend_url)

echo "Frontend: $frontend_url"
'''
            }
        }
    }

    // ==========================================
    // POST BUILD
    // ==========================================
    post {

        success {
            echo "Pipeline succeeded"
            echo "ACTION=${params.ACTION}"
            echo "TARGET=${params.TARGET}"
        }

        failure {
            echo 'Pipeline failed. Check Jenkins logs.'
            echo 'For ECS errors, check ECS events and CloudWatch logs.'
        }

        cleanup {
            sh '''#!/bin/bash
set +e

rm -f terraform/environments/prod/application/deploy.tfplan

rm -f terraform/environments/prod/frontend/deploy.tfplan
'''
        }
    }
}
