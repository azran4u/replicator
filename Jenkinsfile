#!groovy

properties([[$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', artifactDaysToKeepStr: '', artifactNumToKeepStr: '10', daysToKeepStr: '', numToKeepStr: '10']]]);

IMAGE_NAME = "motiuma1/geopoc:${BUILD_NUMBER}"
NAMESPACE = "geopoc"

node {
     
    stage ('Clean Workspace') {
        deleteDir()
    }    
    
    stage ('Checkout') {
        checkout scm
    }
    
    stage ('Install dependencies') {
        sh "npm install"    
    }

    stage ('Build') {
        sh "npm run build"
    }
    
    stage('Build Docker image and Push') {
        withCredentials([usernamePassword(credentialsId:'dockerhub_credentilas', passwordVariable:'DOCKERHUB_PASS', usernameVariable:'DOCKERHUB_USER')]) {
            if ("${env.BRANCH_NAME}" == 'master') {
                sh "docker login -u ${DOCKERHUB_USER} -p ${DOCKERHUB_PASS}"
                sh "docker build -t ${IMAGE_NAME} ."
                sh "docker push ${IMAGE_NAME}"
                sh "docker rmi ${IMAGE_NAME}"
            }
        }
    }


    stage('Deploy to Kubernetes') {
        if ("${env.BRANCH_NAME}" == 'master') {
            withKubeConfig([credentialsId: 'geopoc-project-config']) {
                sh "sed -i 's/BUILDNUM/${BUILD_NUMBER}/g' k8s/DEPLOYMENT.yaml"
                // sh "kubectl apply -f k8s/SECRETS.yaml --namespace ${NAMESPACE}"
                sh "kubectl apply -f k8s/DEPLOYMENT.yaml --namespace ${NAMESPACE}"
            }
        }
    }
    
    stage ('Clean Workspace') {
        deleteDir()
    }    
}
