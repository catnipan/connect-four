pipeline {
    agent {
        docker {
            image 'node:12-alpine' 
            args '-p 3030:3030 -v /root/test:/root/www/g/connect-four' 
        }
    }
    stages {
        stage('Install Dependencies') { 
            steps {
                sh 'npm install'
            }
        }
        stage('Build and Deliver') {
            steps {
                sh 'npm run build'
            }
        }
    }
}