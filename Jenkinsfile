pipeline {
  agent none
  environment {
    IMAGE = "membership-portal"
    ECR_URL = "https://527059199351.dkr.ecr.us-west-1.amazonaws.com/"
  }
  stages {
    stage('Build') {
      parallel {
        // stage('Lint') {
        //   agent {
        //     docker {
        //       image 'node:8-alpine'
        //     }
        //   }
        //   steps {
        //     sh 'yarn'
        //     sh 'yarn lint'
        //   }
        // }
        stage('Test') {
          agent {
            docker {
              image 'node:8-alpine'
            }
          }
          steps {
            sh 'yarn'
            sh 'yarn test'
          }
        }
        stage('Build') {
          agent {
            dockerfile {
              filename 'Dockerfile'
              additionalBuildArgs '-t $IMAGE'
            }
          }
          steps {
            sh 'echo "Done"'
          }
        }
      }
    }
    stage('Push') {
      agent any
      when {
        branch "deploy"
      }
      steps {
        script {
          def url = env.ECR_URL + env.IMAGE
          def tags = [env.GIT_COMMIT[0..6], env.GIT_BRANCH]
          docker.withRegistry(url, "ecr:us-west-1:AWS_CREDENTIALS") {
            tags.each { tag ->
              docker.image(env.IMAGE).push(tag)
            }
          }
        }
      }
    }
    stage('Deploy') {
      agent any
      when {
        branch "deploy"
      }
      steps {
        sshagent(credentials: ['members.uclaacm.com']) {
          sh 'ssh -o StrictHostKeyChecking=no -l ec2-user members.uclaacm.com "cd membership-portal-deployment/prod && make deploy"'
        }
      }
    }
  }
}
