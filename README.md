# Deakin Coffee House: DevOps CI/CD Implementation
A comprehensive full-stack coffee shop web application integrated with an enterprise-grade Jenkins DevOps pipeline and real-time monitoring.

## 1. Project Technology Stack
| Category | Technology |
| :--- | :--- |
| **Language** | JavaScript (ES6+) |
| **Frontend** | React 19 + Vite |
| **Backend** | Node.js + Express |
| **Testing** | Jest + Supertest (10 Tests) |
| **Code Quality** | SonarQube |
| **Security** | Trivy (Container) + npm audit (Dependencies) |
| **Containerisation** | Docker + Docker Compose |
| **Monitoring** | Prometheus + Grafana (Dashboard 11159) |
| **CI/CD** | Jenkins (Declarative Pipeline) |

## 2. Project Structure
```text
deakin/
├── backend/                   # Node.js Express API source code
│   ├── src/
│   │   ├── app.js             # Core Express application logic & metrics
│   │   └── server.js          # API entry point & port listener
│   ├── tests/
│   │   └── app.test.js        # 10 Jest integration tests
│   └── package.json           # Backend dependencies and scripts
├── monitoring/                # Infrastructure-as-Code for monitoring
│   ├── prometheus.yml         # Prometheus scrape configuration
│   └── grafana-datasource.yml # Automated Grafana datasource provisioning
├── Dockerfile                 # Multi-stage secure build for backend
├── docker-compose.yml         # Orchestration for App, Prom, and Grafana
├── Jenkinsfile                # 7-stage CI/CD pipeline definition
├── sonar-project.properties   # SonarQube analysis configuration
├── .eslintrc.json             # Root-level JavaScript linting rules
└── README.md                  # Project documentation (this file)
```

## 3. Backend API Endpoints
| Method | Route | Description |
| :--- | :--- | :--- |
| GET | `/health` | Returns system status and uptime. |
| GET | `/metrics` | Exposes Prometheus format application metrics. |
| GET | `/api/drinks` | Returns a hardcoded list of featured drinks. |
| GET | `/api/cookies` | Returns a hardcoded list of featured cookies. |
| POST | `/api/order` | Accepts `{ drinkId, cookieId, customerName }` and returns a 201 confirmation. |
| GET | `/api/orders` | Retrieves the list of all orders from in-memory storage. |

## 4. CI/CD Pipeline Stages
The Jenkins pipeline consists of exactly 7 stages:
1.  **Construction & Build**: Uses `npm ci` and `docker build`. It installs all dependencies for frontend and backend before building the production-ready Docker image.
2.  **Unit Testing**: Uses `Jest` and `Supertest`. It executes 10 tests to verify API correctness and publishes an HTML coverage report for transparency.
3.  **Static Analysis**: Uses `SonarQube Scanner`. It performs a deep scan of the source code for bugs and smells, waiting for the Quality Gate result before proceeding.
4.  **Vulnerability Scanning**: Uses `Trivy` and `npm audit`. Executed in parallel, it checks for critical vulnerabilities in both the container image and the dependency tree.
5.  **Staging Deployment**: Uses `Docker`. It deploys the application to port 3101 and performs an automated smoke test on the `/health` endpoint.
6.  **Production Release**: Uses `Docker`. It tags the image as `prod` and deploys to port 3001, featuring an automated rollback to the previous build if health checks fail.
7.  **Operational Monitoring**: Uses `Docker Compose`. It initializes Prometheus and Grafana, verifying that metrics are being correctly scraped from the production instance.

## 5. Local Setup Instructions
Follow these commands to test the application locally:

**Initialize Backend & Tests:**
```bash
cd backend
npm ci
npm test
```

**Launch Full Stack:**
```bash
cd ..
docker-compose up --build -d
```

**Access URLs:**
*   **Web Application**: [http://localhost:3001](http://localhost:3001)
*   **Prometheus**: [http://localhost:9090](http://localhost:9090)
*   **Grafana**: [http://localhost:3002](http://localhost:3002) (Login: `admin` / `admin123`)

## 6. Jenkins Configuration Guide
To successfully run this pipeline, the following setup is required:

1.  **Required Plugins**:
    *   NodeJS Plugin
    *   Docker Pipeline
    *   SonarQube Scanner
    *   HTML Publisher
2.  **Global Tool Configuration**:
    *   Add **NodeJS** installation named `NodeJS-18`.
3.  **System Configuration**:
    *   Add **SonarQube Server** named `SonarQube` at `http://localhost:9000`.
4.  **Credentials**:
    *   Configure a **Secret Text** credential named `SONAR_TOKEN`.

## 7. Security Findings & Mitigation
| Severity | Package | Issue | Resolution |
| :--- | :--- | :--- | :--- |
| **High** | `ajv` | ReDoS vulnerability in validation logic. | Updated package to latest stable version (6.14.0+). |
| **Critical** | `node:18` | OS-level vulnerability in alpine image. | Switched to latest patched Alpine build in multi-stage Dockerfile. |

## 8. Infrastructure Monitoring
The application implements **Real-time Monitoring** via a Prometheus-Grafana stack:
*   **Scraping**: Prometheus scans the `/metrics` endpoint of the backend every 15 seconds.
*   **Visualization**: Grafana is provisioned at port 3002 with Prometheus pre-configured as the datasource.
*   **Dashboards**: Use the **Grafana Dashboard ID 11159** (Node Exporter Full or similar Express templates) to visualize request rates, latency, and system health.
