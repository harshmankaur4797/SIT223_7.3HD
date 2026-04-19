#!/bin/bash

# ANSI Color Codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
function print_step() {
    echo -e "\n${YELLOW}>>> STEP $1: $2${NC}"
}

function print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

function print_success() {
    echo -e "${GREEN}SUCCESS: $1${NC}"
}

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}      DEAKIN COFFEE HOUSE DEVOPS SETUP          ${NC}"
echo -e "${BLUE}==================================================${NC}"

# STEP 1 - VERIFY DOCKER IS RUNNING
print_step "1" "Verifying Docker Status"
if ! docker info >/dev/null 2>&1; then
    print_error "Please start Docker Desktop first"
    exit 1
fi
print_success "Docker is running"

# STEP 2 - START SONARQUBE
print_step "2" "Starting SonarQube"
if [[ $(docker ps -q -f name=sonarqube) ]]; then
    echo "SonarQube already running"
elif [[ $(docker ps -aq -f name=sonarqube) ]]; then
    echo "SonarQube exists but is stopped. Starting..."
    docker start sonarqube
else
    echo "Creating new SonarQube container..."
    docker run -d --name sonarqube -p 9000:9000 --restart unless-stopped sonarqube:community
fi

echo -n "Waiting for SonarQube to be ready..."
COUNT=0
MAX=18 # 18 * 5s = 90s
until curl -s -u admin:admin http://localhost:9000/api/system/status | grep -q "UP" || [ $COUNT -eq $MAX ]; do
    echo -n "."
    sleep 5
    COUNT=$((COUNT + 1))
done

if [ $COUNT -eq $MAX ]; then
    echo -e "\n"
    print_error "SonarQube failed to start within 90 seconds. Check logs with 'docker logs sonarqube'"
    exit 1
fi

echo -e "\n"
print_success "SonarQube ready at http://localhost:9000"

# STEP 3 - START JENKINS
print_step "3" "Starting Jenkins"
if [[ $(docker ps -q -f name=jenkins) ]]; then
    echo "Jenkins already running"
elif [[ $(docker ps -aq -f name=jenkins) ]]; then
    echo "Jenkins exists but is stopped. Starting..."
    docker start jenkins
else
    echo "Creating new Jenkins container..."
    docker run -d --name jenkins \
        -p 8080:8080 -p 50000:50000 \
        --restart unless-stopped \
        -v jenkins_home:/var/jenkins_home \
        -v /var/run/docker.sock:/var/run/docker.sock \
        jenkins/jenkins:lts
fi

echo -n "Waiting for Jenkins to be ready..."
COUNT=0
MAX=24 # 24 * 5s = 120s
until curl -s -f http://localhost:8080/login >/dev/null || [ $COUNT -eq $MAX ]; do
    echo -n "."
    sleep 5
    COUNT=$((COUNT + 1))
done

if [ $COUNT -eq $MAX ]; then
    echo -e "\n"
    print_error "Jenkins failed to start within 120 seconds. Check logs with 'docker logs jenkins'"
    exit 1
fi

echo -e "\n"
print_success "Jenkins ready at http://localhost:8080"

# STEP 4 - GET JENKINS INITIAL PASSWORD
print_step "4" "Jenkins Initial Admin Password"
JENKINS_PW=$(docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword)
echo -e "${GREEN}--------------------------------------------------${NC}"
echo -e "YOUR PASSWORD: ${YELLOW}$JENKINS_PW${NC}"
echo -e "${GREEN}--------------------------------------------------${NC}"
echo "NOTE: You only need this password once during initial setup."

# STEP 5 - CREATE SONARQUBE PROJECT AND TOKEN
print_step "5" "Configuring SonarQube API"
echo "Creating project: deakin-coffee"
curl -s -u admin:admin -X POST "http://localhost:9000/api/projects/create?name=Deakin%20Coffee%20House%20SIT223&project=deakin-coffee" >/dev/null

echo "Generating token: jenkins-token"
TOKEN_RES=$(curl -s -u admin:admin -X POST "http://localhost:9000/api/user_tokens/generate?name=jenkins-token")
SONAR_TOKEN=$(echo "$TOKEN_RES" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//' | head -1)

if [ -z "$SONAR_TOKEN" ]; then
    print_error "Could not generate SonarQube token. Verify credentials or if token already exists."
else
    echo -e "${GREEN}--------------------------------------------------${NC}"
    echo -e "YOUR SONAR_TOKEN: ${YELLOW}$SONAR_TOKEN${NC}"
    echo -e "${GREEN}--------------------------------------------------${NC}"
    echo "SAVE THIS TOKEN — you will need it in Jenkins credentials."
fi

# STEP 6 - PRINT COMPLETE JENKINS CONFIGURATION INSTRUCTIONS
print_step "6" "Final Jenkins Setup Instructions"
echo -e "${BLUE}======================================================================${NC}"
echo -e "1. Go to ${YELLOW}http://localhost:8080${NC} and use the password listed in Step 4."
echo -e "2. Install suggested plugins, then manually add these via Plugin Manager:"
echo -e "   ${GREEN}NodeJS, Docker Pipeline, SonarQube Scanner, HTML Publisher${NC}"
echo -e "3. Manage Jenkins → Global Tool Configuration:"
echo -e "   - NodeJS → Add NodeJS → Name: ${YELLOW}NodeJS-18${NC} → Version: 18.x"
echo -e "4. Manage Jenkins → Configure System → SonarQube servers:"
echo -e "   - Add → Name: ${YELLOW}SonarQube${NC} → URL: ${YELLOW}http://localhost:9000${NC}"
echo -e "5. Manage Jenkins → Credentials → Global → Add Credentials:"
echo -e "   - Kind: ${YELLOW}Secret Text${NC} → ID: ${YELLOW}SONAR_TOKEN${NC} → Secret: ${GREEN}[Past Token]${NC}"
echo -e "6. New Item → Pipeline → Name: ${YELLOW}deakin-coffee-pipeline${NC}:"
echo -e "   - Definition: Pipeline script from SCM"
echo -e "   - SCM: Git → URL: [Your Repo URL]"
echo -e "   - Script Path: ${YELLOW}Jenkinsfile${NC}"
echo -e "${BLUE}======================================================================${NC}"
echo -e "\n${GREEN}Setup Complete! You are ready to run your DevOps pipeline.${NC}"
