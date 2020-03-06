pipeline {
  agent any
    environment {
      imageName = "altertech/eva-demo-smarthome"
      kubeCluster = "altt-1"
      app = imageName.tokenize('/').last().replace('_', '-')
    }
  stages {
    stage('build') {
      steps {
        script {
          sh "make submodules"
          sh "docker build -t ${imageName}:${BUILD_NUMBER} ."
        }}
    }
    stage('pub') {
      steps {
        script {
          sh "docker tag ${imageName}:${BUILD_NUMBER} ${imageName}:latest"
          sh "docker push ${imageName}:${BUILD_NUMBER}"
          sh "docker push ${imageName}:latest"
        }
      }
    }
    stage('deploy') {
      steps {
        script {
          sh "kube-deploy ${kubeCluster} ${app}"
        }
      }
    }
  }
  post {
    always {
        sh "docker rmi ${imageName}:${BUILD_NUMBER}"
        }
    success { sh 'job-notify ok' }
    failure { sh 'job-notify failed' }
  }
}
