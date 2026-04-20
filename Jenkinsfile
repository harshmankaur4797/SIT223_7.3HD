pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
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
        DOCKER_NET = 'coffee-network'
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Construction & Build') {
            steps {
                sh "docker network create ${DOCKER_NET} || true"
                checkout scm
                
                echo "Installing backend dependencies..."
                sh 'cd backend && npm ci'
                
                echo "Installing frontend dependencies and building..."
                sh 'npm ci && npm run build'
                
                script {
                    // Docker build using the root Dockerfile (Multi-stage)
                    docker.build("${FULL_IMAGE}", "--no-cache .")
                    sh "docker tag ${FULL_IMAGE} ${LATEST_IMAGE}"
                }
            }
            post {
                success {
                    echo "Successfully built integrated image: ${FULL_IMAGE}"
                }
            }
        }

        stage('Automated Testing') {
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
                    error 'Unit tests failed — stopping pipeline'
                }
            }
        }

        stage('Code Quality Analysis') {
            steps {
                withSonarQubeEnv("${SONAR_SERVER}") {
                    sh "npx sonar-scanner \
                        -Dsonar.projectKey=deakin-coffee \
                        -Dsonar.projectName='Deakin Coffee House SIT223' \
                        -Dsonar.sources=backend/src,src \
                        -Dsonar.tests=backend/tests \
                        -Dsonar.javascript.lcov.reportPaths=backend/coverage/lcov.info \
                        -Dsonar.host.url=http://sonarqube:9000"
                }
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('DevSecOps - Security') {
            parallel {
                stage('Trivy Image Scan') {
                    steps {
                        sh '''
                            if ! command -v trivy &> /dev/null; then
                                curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
                            fi
                            trivy image --severity CRITICAL --exit-code 1 --no-progress ${FULL_IMAGE} || true
                            trivy image --severity CRITICAL --format table --output trivy-report.txt ${FULL_IMAGE}
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
                sh "docker rm -f ${STAGING_NAME} || true"
                sh "docker run -d --name ${STAGING_NAME} --network ${DOCKER_NET} -p ${STAGING_PORT}:3001 -e NODE_ENV=staging -e PORT=3001 --restart unless-stopped ${FULL_IMAGE}"
                sh 'sleep 10'
                script {
                    def status = sh(script: "curl -s -o /dev/null -w '%{http_code}' http://localhost:${STAGING_PORT}/health", returnStdout: true).trim()
                    if (status != '200') {
                        error "Staging deployment fails health check (Status: ${status})"
                    }
                }
            }
            post {
                failure {
                    sh "docker rm -f ${STAGING_NAME} || true"
                }
            }
        }

        stage('Production Release') {
            steps {
                sh "docker tag ${FULL_IMAGE} ${IMAGE_NAME}:prod-${IMAGE_TAG}"
                sh "docker tag ${FULL_IMAGE} ${IMAGE_NAME}:stable"
                
                sh "docker rm -f ${PROD_NAME} || true"
                sh "docker run -d --name ${PROD_NAME} --network ${DOCKER_NET} -p ${PROD_PORT}:3001 -e NODE_ENV=production -e PORT=3001 --restart unless-stopped ${FULL_IMAGE}"
                sh 'sleep 10'
                script {
                    def status = sh(script: "curl -s -o /dev/null -w '%{http_code}' http://localhost:${PROD_PORT}/health", returnStdout: true).trim()
                    if (status != '200') {
                        error "Production health check failed"
                    }
                }
            }
            post {
                failure {
                    script {
                        echo "!!! Production Health Failure - Rollback Initiated !!!"
                        def prevBuild = (env.BUILD_NUMBER.toInteger() - 1).toString()
                        sh "docker rm -f ${PROD_NAME} || true"
                        try {
                            sh "docker run -d --name ${PROD_NAME} --network ${DOCKER_NET} -p ${PROD_PORT}:3001 ${IMAGE_NAME}:${prevBuild}"
                            echo "Rollback successful"
                        } catch (Exception e) {
                            echo "CRITICAL: Rollback failed"
                        }
                    }
                }
            }
        }

        stage('Operational Monitoring') {
            steps {
                sh """
                    docker rm -f prometheus grafana || true
                    docker run -d --name prometheus --network ${DOCKER_NET} -p 9090:9090 \
                        -v \$(pwd)/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml \
                        prom/prometheus:latest || true
                    docker run -d --name grafana --network ${DOCKER_NET} -p 3002:3000 \
                        -e GF_SECURITY_ADMIN_PASSWORD=admin123 \
                        -v \$(pwd)/monitoring/grafana-datasource.yml:/etc/grafana/provisioning/datasources/datasource.yml \
                        grafana/grafana:latest || true
                """
                sh 'sleep 15'
                sh "curl -s -f http://localhost:9090/-/healthy || echo 'Prometheus skipped'"
                sh "curl -s -f http://localhost:3002/api/health || echo 'Grafana skipped'"
                echo """
                -----------------------------------------------------------
                DEPLOYMENT COMPLETE
                - App URL:    http://localhost:${PROD_PORT}
                - Prometheus: http://localhost:9090
                - Grafana:    http://localhost:3002 (admin / admin123)
                -----------------------------------------------------------
                """
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully for Build #${BUILD_NUMBER}"
        }
        failure {
            echo "Pipeline failed. Check Jenkins console and email notifications."
        }
        always {
            cleanWs()
        }
    }
}
