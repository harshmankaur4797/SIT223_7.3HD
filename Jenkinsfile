pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    environment {
        IMAGE_NAME = 'deakin-coffee-backend'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        FULL_IMAGE = "${IMAGE_NAME}:${IMAGE_TAG}"
        LATEST_IMAGE = "${IMAGE_NAME}:latest"
        SONAR_SERVER = 'SonarQube'
        STAGING_NAME = 'coffee-staging'
        PROD_NAME = 'coffee-prod'
        STAGING_PORT = '3101'
        PROD_PORT = '3001'
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('Construction & Build') {
            steps {
                checkout scm
                sh 'git log --oneline -5'
                sh 'cd backend && npm ci'
                sh 'npm ci && npm run build'
                script {
                    def appImage = docker.build("${FULL_IMAGE}", "--no-cache .")
                    sh "docker tag ${FULL_IMAGE} ${LATEST_IMAGE}"
                }
            }
            post {
                success {
                    echo "Built ${FULL_IMAGE}"
                }
            }
        }

        stage('Unit Testing') {
            steps {
                sh 'cd backend && npm test'
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'backend/coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
                failure {
                    error 'Tests failed — aborting pipeline'
                }
            }
        }

        stage('Static Analysis') {
            steps {
                withSonarQubeEnv("${SONAR_SERVER}") {
                    sh "npx sonar-scanner \
                        -Dsonar.projectKey=deakin-coffee \
                        -Dsonar.sources=backend/src \
                        -Dsonar.tests=backend/tests \
                        -Dsonar.javascript.lcov.reportPaths=backend/coverage/lcov.info"
                }
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Vulnerability Scanning') {
            parallel {
                stage('Trivy Image Scan') {
                    steps {
                        sh '''
                            if ! command -v trivy &> /dev/null; then
                                curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
                            fi
                            trivy image --exit-code 1 --severity CRITICAL --no-progress --format table --output trivy-report.txt ${FULL_IMAGE} || true
                            cat trivy-report.txt
                        '''
                        archiveArtifacts artifacts: 'trivy-report.txt', fingerprint: true
                    }
                }
                stage('Dependency Audit') {
                    steps {
                        sh 'cd backend && npm audit --audit-level=high --json > npm-audit.json || true'
                        sh 'cd backend && npm audit --audit-level=high || true'
                        archiveArtifacts artifacts: 'backend/npm-audit.json', fingerprint: true
                    }
                }
            }
        }

        stage('Staging Deployment') {
            steps {
                sh 'docker rm -f ${STAGING_NAME} || true'
                sh 'docker run -d --name ${STAGING_NAME} -p ${STAGING_PORT}:3001 -e NODE_ENV=staging -e PORT=3001 --restart unless-stopped ${FULL_IMAGE}'
                sh 'sleep 10'
                script {
                    def status = sh(script: "curl -s -o /dev/null -w '%{http_code}' http://localhost:${STAGING_PORT}/health", returnStdout: true).trim()
                    if (status != '200') {
                        error "Staging health check failed with status ${status}"
                    } else {
                        echo "Staging healthy"
                    }
                }
            }
            post {
                failure {
                    sh 'docker rm -f ${STAGING_NAME} || true'
                    error 'Staging deploy failed'
                }
            }
        }

        stage('Production Release') {
            steps {
                sh "docker tag ${FULL_IMAGE} ${IMAGE_NAME}:prod-${IMAGE_TAG}"
                sh "docker tag ${FULL_IMAGE} ${LATEST_IMAGE}"
                sh 'docker rm -f ${PROD_NAME} || true'
                sh 'docker run -d --name ${PROD_NAME} -p ${PROD_PORT}:3001 -e NODE_ENV=production -e PORT=3001 --restart unless-stopped ${FULL_IMAGE}'
                sh 'sleep 10'
                script {
                    def status = sh(script: "curl -s -o /dev/null -w '%{http_code}' http://localhost:${PROD_PORT}/health", returnStdout: true).trim()
                    if (status != '200') {
                        error "Production health check failed with status ${status}"
                    }
                }
            }
            post {
                failure {
                    script {
                        echo "Rollback initiated..."
                        def prevBuild = (env.BUILD_NUMBER.toInteger() - 1).toString()
                        sh "docker rm -f ${PROD_NAME} || true"
                        try {
                            sh "docker run -d --name ${PROD_NAME} -p ${PROD_PORT}:3001 ${IMAGE_NAME}:${prevBuild}"
                        } catch (Exception e) {
                            echo "Rollback failed: previous image not found"
                        }
                    }
                    error 'Production release failed — rollback attempted'
                }
            }
        }

        stage('Operational Monitoring') {
            steps {
                sh 'docker compose up -d prometheus grafana || docker-compose up -d prometheus grafana'
                sh 'sleep 15'
                sh "curl -s -o /dev/null -w '%{http_code}' http://localhost:9090/-/healthy"
                sh "curl -s -o /dev/null -w '%{http_code}' http://localhost:3002/api/health"
                sh "curl -s http://localhost:${PROD_PORT}/metrics | head -20"
                echo """
                -----------------------------------------------------------
                Infra Dashboards:
                - Prometheus: http://localhost:9090
                - Grafana:    http://localhost:3002 (Password: admin123)
                -----------------------------------------------------------
                """
            }
        }
    }

    post {
        success {
            echo "Build successful! [Build #${BUILD_NUMBER}] - Image: ${FULL_IMAGE} - Branch: ${env.BRANCH_NAME}"
        }
        failure {
            echo "Pipeline failed — check logs"
            // mail to: 'admin@deakin.edu.au', subject: "Failed Build: ${env.JOB_NAME} #${env.BUILD_NUMBER}", body: "Something went wrong check logs"
        }
        always {
            cleanWs()
        }
    }
}
