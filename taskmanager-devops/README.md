# Task Manager DevOps Project

This is a complete DevOps project demonstrating a 7-stage CI/CD pipeline using Jenkins on Windows.

## Project Structure
- `src/`: Backend application (Node.js/Express)
- `tests/`: API tests (Jest/Supertest)
- `Jenkinsfile`: 7-stage CI/CD pipeline
- `.eslintrc.json`: Linting configuration
- `sonar-project.properties`: SonarQube configuration

## How to Run Locally
1. `npm install`
2. `npm start` (Runs on port 3000)
3. `npm test` (Runs tests and generates coverage)

## Jenkins Pipeline Stages
1. **BUILD**: Install dependencies and archive package.json.
2. **TEST**: Run Jest tests and publish JUnit reports.
3. **CODE QUALITY**: Run ESLint and SonarQube analysis.
4. **SECURITY**: Run npm audit and Retire.js.
5. **DEPLOY STAGING**: Deploy to port 3001 with health check and smoke test.
6. **RELEASE PRODUCTION**: Deploy to port 3000 with git tagging.
7. **MONITORING**: Capture health and metrics.
