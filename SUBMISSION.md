# SIT223/SIT753 DevOps Pipeline - High Distinction Submission

**Student Name:** Harsh Mankaur
**Student ID:** [Your Student ID Here]
**Unit:** SIT223/SIT753
**Task Name:** 7.3 HD — DevOps Pipeline with Jenkins

---

## 1. Project Overview
**Deakin Coffee House** is a full-stack integrated web application. It features a modern React 19 frontend for customer interaction and a robust Node.js Express backend for order management and business logic. The project is fully containerized and orchestrated through a professional-grade DevOps lifecycle.

## 2. Pipeline Architecture (7 Stages)
The automated CI/CD pipeline consists of exactly 7 rigorous stages implemented in Jenkins:

| Stage | Description | Tools Used |
| :--- | :--- | :--- |
| **1. Build** | Compiles frontend assets and builds a secure multi-stage Docker image. | Docker, npm |
| **2. Test** | Executes 10 automated Jest tests and publishes coverage reports. | Jest, Supertest |
| **3. Code Quality** | Static code analysis with enforced quality gates. | SonarQube |
| **4. Security** | Parallel container scanning and dependency vulnerability audit. | Trivy, npm audit |
| **5. Deploy** | Automated deployment to a staging environment with health verification. | Docker |
| **6. Release** | Blue/Green style production promotion with automated rollback. | Docker |
| **7. Monitoring** | Real-time observability and metric visualization. | Prometheus, Grafana |

## 3. Technology Stack
- **Frontend:** React 19, Vite
- **Backend:** Node.js, Express, prom-client
- **Automation:** Jenkins (Poll SCM)
- **Quality/Security:** SonarQube, Trivy, NPM Audit
- **Deployment:** Docker, Docker Compose
- **Observability:** Prometheus, Grafana

## 4. Resource Links
- **GitHub Repository:** https://github.com/harshmankaur4797/SIT223_7.3HD
- **Demonstration Video:** [Your Shared Video Link Here]

---

## 5. Evidence Summary
- [x] All 7 Stages turn Green in Jenkins
- [x] SonarQube Quality Gate Passed
- [x] No Critical Vulnerabilities detected by Trivy
- [x] Metrics flowing to Grafana Dashboard
- [x] Automated Rollback logic verified
