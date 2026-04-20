# SIT223/SIT753 DevOps Pipeline - High Distinction Submission

**Project Title:** Deakin Coffee House - Integrated Web Application
**Author:** Harsh Mankaur
**GitHub Repository:** https://github.com/harshmankaur4797/SIT223_7.3HD

---

## Project Overview
Deakin Coffee House is a full-stack application featuring a React-based frontend and a Node.js Express backend. The application allows users to browse coffee and cookie selections and place orders. 

The DevOps pipeline implemented in this task ensures that the application is built, tested, secured, and monitored in a professional production-like environment.

## Pipeline Architecture
The pipeline consists of **all 7 required stages**, fully automated and integrated within Jenkins.

### 1. Build Stage
- **Tool:** Docker (Multi-stage Build)
- **Description:** Jenkins executes a multi-stage docker build using `Dockerfile`.
  - **Stage 1:** Compiles the React frontend using Vite.
  - **Stage 2:** Installs production dependencies for the Node.js backend.
  - **Stage 3:** Combines the built assets into a secure, slim Alpine-based production image.
- **Artifact:** A tagged Docker image `deakin-coffee-app:[BUILD_NUMBER]`.

### 2. Test Stage
- **Tool:** Jest (Testing Framework)
- **Description:** Automated unit and integration tests are executed against the backend logic.
- **Reporting:** HTML code coverage reports are generated and published directly to the Jenkins dashboard using the HTML Publisher plugin.

### 3. Code Quality Stage
- **Tool:** SonarQube
- **Description:** Performs static analysis of the codebase (Frontend and Backend).
- **Quality Gate:** The pipeline is configured to **fail automatically** if the SonarQube quality gate (covering security hotspots, code smells, and duplication) is not met.

### 4. Security Stage
- **Tools:** Trivy, NPM Audit
- **Description:**
  - **Trivy:** Scans the final Docker image for OS-level vulnerabilities.
  - **NPM Audit:** Scans the Node.js dependency tree for high-risk vulnerabilities.
- **Gate:** The pipeline enforces a "Critical" severity policy, failing the build if any critical vulnerabilities are detected.

### 5. Deploy Stage (Staging)
- **Tool:** Docker
- **Description:** The built image is deployed to a staging environment (Port 3101).
- **Verification:** An automated health check (`/health`) is performed after deployment to ensure service availability before moving to production.

### 6. Release Stage (Production)
- **Tool:** Docker (Blue/Green Style Promotion)
- **Description:** Upon successful staging validation, the image is tagged as `stable` and promoted to the production environment (Port 3001).
- **Rollback:** The pipeline includes automated rollback logic; if the production health check fails, the last known stable build is automatically redeployed.

### 7. Monitoring Stage
- **Tools:** Prometheus, Grafana
- **Description:** 
  - **Prometheus:** Scrapes real-time metrics from the `/metrics` endpoint of the production application.
  - **Grafana:** Visualizes application performance (Request count, status codes, uptime) via a pre-configured dashboard.
- **Integration:** All components run on a shared Docker network (`coffee-network`) for secure, high-performance service discovery.

---

## Submission Checklist
- [x] All 7 Stages Implemented
- [x] Full Automation (Pipeline from SCM)
- [x] Secure Non-Root User Execution
- [x] Quality Gates & Security Enforcement
- [x] Automated Rollback Support
- [x] Live Monitoring Dashboards
