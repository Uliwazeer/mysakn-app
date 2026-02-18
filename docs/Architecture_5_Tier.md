# 🏗️ 5-Tier Architecture Documentation

## Overview
MySakn follows a robust **5-Tier Architecture** ensuring scalability, security, and separation of concerns.

## The 5 Tiers
1.  **Tier 1: Client Tier (Frontend)**
    *   **Technology**: HTML5, CSS3, Vanilla JS.
    *   **Role**: User Interface and interaction logic.
    *   **Location**: `apps/frontend` (Browser).

2.  **Tier 2: API Gateway / Web Tier (Nginx)**
    *   **Technology**: Nginx (Reverse Proxy).
    *   **Role**:
        *   Serves static content.
        *   **Routes API requests** (`/api/...`) to appropriate backend services.
        *   Hides internal service topology (Security).
    *   **Configuration**: `apps/frontend/nginx.conf`.

3.  **Tier 3: Application Tier (Microservices)**
    *   **Technology**: Node.js, Express.
    *   **Services**:
        *   `auth-service`: User management.
        *   `housing-service`: Listings management.
        *   `booking-service`: Booking workflow.
        *   `notification-service`: Alert system.
    *   **Communication**: Talk to each other via internal HTTP (REST) or Events.

4.  **Tier 4: Integration Tier (Event Bus)**
    *   **Technology**: Apache Kafka.
    *   **Role**: Asynchronous communication.
    *   **Flows**: 
        *   `Booking Created` -> Kafka -> `Notification Service` -> Email/Alert.
        *   `User Registered` -> Kafka -> `Notification Service` -> Verification Code (SMS/Email).

5.  **Tier 5: Data Persistence Tier (Database)**
    *   **Technology**: MongoDB.
    *   **Role**: Permanent storage for Users, Listings, Bookings.

---

## 🚀 How to Run All Tiers Together
Simply run the unified deployment script!

```bash
./scripts/deploy.sh
```

**What happens behind the scenes:**
1.  **Tier 5 & 4 Start**: Script deploys MongoDB and Kafka first (Infrastructure).
2.  **Tier 3 Starts**: Script builds and deploys Backend Services (`infra/k8s/`).
3.  **Tier 2 & 1 Start**: Script builds Frontend/Nginx image, configures routes in `nginx.conf`, and deploys it.

**Accessing the Application:**
*   Open your browser at: `http://<MINIKUBE_IP>:30080`
*   All API calls will automatically route through the 5 tiers.
