#!/bin/bash

# ANSI Color Codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

function print_pass() {
    echo -e "${GREEN}PASS: $1${NC}"
    PASS_COUNT=$((PASS_COUNT + 1))
}

function print_fail() {
    echo -e "${RED}FAIL: $1${NC}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
}

function print_step() {
    echo -e "\n${YELLOW}>>> STEP $1: $2${NC}"
}

echo -e "${YELLOW}==================================================${NC}"
echo -e "${YELLOW}      DEAKIN COFFEE HOUSE LOCAL VERIFIER         ${NC}"
echo -e "${YELLOW}==================================================${NC}"

# STEP 1 - CHECK NODE AND NPM VERSIONS
print_step "1" "Checking Node and NPM Versions"
NODE_VER=$(node -v 2>/dev/null)
if [[ $? -eq 0 ]]; then
    MAJOR_VER=$(echo $NODE_VER | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $MAJOR_VER -ge 18 ]]; then
        print_pass "Node version is $NODE_VER (Minimum v18 required)"
    else
        print_fail "Node version $NODE_VER is below v18"
    fi
else
    print_fail "Node is not installed"
fi

NPM_VER=$(npm -v 2>/dev/null)
if [[ $? -eq 0 ]]; then
    print_pass "NPM version is $NPM_VER"
else
    print_fail "NPM is not installed"
fi

# STEP 2 - BACKEND DEPENDENCY INSTALL
print_step "2" "Installing Backend Dependencies"
cd backend || { print_fail "Could not enter backend directory"; exit 1; }
if npm ci; then
    print_pass "Backend dependencies installed successfully"
else
    print_fail "npm ci failed — check your package.json"
    exit 1
fi

# STEP 3 - RUN BACKEND TESTS
print_step "3" "Running Backend Tests"
if npm test; then
    print_pass "All tests passed"
else
    print_fail "Tests failed — fix before continuing"
    exit 1
fi

# STEP 4 - CHECK TEST COVERAGE FILE EXISTS
print_step "4" "Verifying Test Coverage"
if [[ -f "coverage/lcov.info" ]]; then
    print_pass "Test coverage file (lcov.info) exists"
else
    print_fail "Coverage file not found in backend/coverage/"
fi

# STEP 5 - BUILD FRONTEND
print_step "5" "Building Frontend"
cd ..
if npm ci && npm run build; then
    print_pass "Frontend built successfully"
else
    print_fail "Frontend build failed"
    exit 1
fi

# STEP 6 - CHECK DOCKER IS RUNNING
print_step "6" "Checking Docker Status"
if docker info >/dev/null 2>&1; then
    print_pass "Docker daemon is running"
else
    print_fail "Start Docker Desktop first"
    exit 1
fi

# STEP 7 - BUILD DOCKER IMAGE
print_step "7" "Building Docker Image"
if docker build -t deakin-coffee-backend:test .; then
    print_pass "Docker image built successfully"
else
    print_fail "Docker build failed"
    exit 1
fi

# STEP 8 - RUN CONTAINER HEALTH CHECK
print_step "8" "Running Container Health Check"
docker rm -f coffee-verify-test >/dev/null 2>&1
if docker run -d --name coffee-verify-test -p 3099:3001 -e PORT=3001 deakin-coffee-backend:test; then
    echo "Waiting 8 seconds for container to start..."
    sleep 8
    RES=$(curl -s http://localhost:3099/health)
    if [[ $RES == *"ok"* ]]; then
        print_pass "Container health check passed (received 'ok')"
    else
        print_fail "Container health check failed — received: $RES"
    fi
    docker rm -f coffee-verify-test >/dev/null 2>&1
else
    print_fail "Could not start docker container"
fi

# STEP 9 - CLEANUP
print_step "9" "Cleaning Up"
if docker rmi deakin-coffee-backend:test >/dev/null 2>&1; then
    print_pass "Test image removed"
else
    echo "Note: Could not automatically remove test image"
fi

# FINAL SUMMARY
echo -e "\n${YELLOW}==================================================${NC}"
echo -e "${YELLOW}                 FINAL SUMMARY                     ${NC}"
echo -e "${YELLOW}==================================================${NC}"
echo -e "Total Checks Passed: ${GREEN}$PASS_COUNT${NC}"
echo -e "Total Checks Failed: ${RED}$FAIL_COUNT${NC}"

if [[ $FAIL_COUNT -eq 0 ]]; then
    echo -e "\n${GREEN}✅ Ready to push to GitHub and run Jenkins${NC}"
else
    echo -e "\n${RED}❌ Fix the above issues before running Jenkins${NC}"
fi
echo -e "${YELLOW}==================================================${NC}"
