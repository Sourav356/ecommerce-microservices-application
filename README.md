# Polyglot Microservices E-Commerce Architecture 🌐

This repository contains a full-stack, DevOps-ready e-commerce platform built using a powerful Polyglot Microservices Architecture. The backend is powered by Node.js, Java (Spring Boot), Go, and Python (FastAPI), while the frontend uses React (Vite). All services communicate via a centralized API Gateway, with the Order Service acting as a distributed orchestrator.

---

## 🏛️ Architecture Overview

The system utilizes an **API Gateway Pattern** for client ingress, and an **Orchestrator Pattern** for processing distributed transactions across isolated domains.

```mermaid
graph TD
    %% Define styles
    classDef frontend fill:#38bdf8,stroke:#0284c7,stroke-width:2px,color:white;
    classDef gateway fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:white;
    classDef java fill:#ec4899,stroke:#be185d,stroke-width:2px,color:white;
    classDef go fill:#10b981,stroke:#047857,stroke-width:2px,color:white;
    classDef python fill:#fbbf24,stroke:#b45309,stroke-width:2px,color:black;
    classDef db fill:#64748b,stroke:#334155,stroke-width:2px,color:white;

    %% Nodes
    Client["💻 React Frontend<br/>(Port 5173)"]:::frontend
    Gateway["🚪 API Gateway<br/>(Node.js - Port 4000)"]:::gateway
    
    User["👤 User Service<br/>(Java - Port 4001)"]:::java
    Product["📦 Product Service<br/>(Python - Port 4003)"]:::python
    Cart["🛒 Cart Service<br/>(Go - Port 4004)"]:::go
    Order["🧾 Order Service<br/>(Java - Port 4006)"]:::java
    Payment["💳 Payment Service<br/>(Go - Port 4007)"]:::go
    Notification["📧 Notification Service<br/>(Python - Port 4008)"]:::python
    
    DB[(PostgreSQL Database<br/>Isolated Schemas)]:::db

    %% Connections
    Client -->|HTTP GET/POST| Gateway
    
    Gateway -->|/api/users| User
    Gateway -->|/api/products| Product
    Gateway -->|/api/cart| Cart
    Gateway -->|/api/orders| Order
    
    %% Orchestration Flow highlight
    Order -->|1. Fetch Cart Items| Gateway
    Order -->|2. Fetch Prices| Gateway
    Order -->|3. Process Payment| Payment
    Order -->|4. Dispatch Receipt| Notification
    
    %% DB Connections
    User -.-> DB
    Product -.-> DB
    Cart -.-> DB
    Order -.-> DB
```

### 🔄 Request Orchestration Flow
To see how the "requests move" during a checkout, follow this sequence trace:

```mermaid
sequenceDiagram
    participant C as 💻 Frontend
    participant G as 🚪 Gateway
    participant O as 🧾 Order Service
    participant CA as 🛒 Cart Service
    participant P as 💳 Payment Service
    participant N as 📧 Notification
    
    C->>G: POST /api/orders/checkout
    G->>O: Forward Request
    Note over O: Start Orchestration
    O->>G: GET /api/cart
    G->>CA: Fetch Cart Data
    CA-->>G: Cart Items []
    G-->>O: Return Items
    O->>G: POST /api/inventory/reduce
    G->>CA: Update Stock Levels
    O->>G: POST /api/payments/process
    G->>P: Authorize Charge
    P-->>G: Transaction: SUCCESS
    G-->>O: Payment Confirmed
    O->>G: POST /api/notifications/send
    G->>N: Dispatch Receipt
    N-->>G: OK
    O->>G: DELETE /api/cart
    G->>CA: Flush User Cart
    O-->>G: 200 OK (Order Finalized)
    G-->>C: Success Toast!
```

---

## ⚙️ Configuration (.env)

The application is now fully parameterized for Docker and EKS. Each service folder contains a `.env` file for local overrides. Use the **`.env.example`** at the project root as a template.

---

## 🚀 Installation & Startup

Before running the services, you must install dependencies for each environment.

### 1. Unified Gateway & Frontend (Node.js)
```bash
cd api-gateway && npm install && npm start
cd frontend && npm install && npm run dev
```

### 2. Python Services (Product & Notification)
```bash
# It is recommended to use a virtualenv
cd product-service && pip install -r requirements.txt && python main.py
cd notification-service && pip install -r requirements.txt && python main.py
```

### 3. Go Services (Cart & Payment)
```bash
# Go modules will automatically download, but you can run:
cd cart-service && go mod tidy && go run .
cd payment-service && go mod tidy && go run .
```

### 4. Java Services (User & Order)
```bash
# Maven wrapper handles everything including dependency fetch
cd user-service && ./mvnw spring-boot:run
cd order-service && ./mvnw spring-boot:run
```

---

## 🔌 Service Port Mapping

| Service Name | Language/Framework | Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | React / Vite | `5173` | The Client UI. Handles auth state and Cart overlay. |
| **API Gateway** | Node.js / Express | `4000` | Central ingress point. Proxies requests to internal ports. |
| **User Service** | Java / Spring Boot | `4001` | Handles User Registration and JWT Login. |
| **Order Service** | Java / Spring Boot | `4006` | The Orchestrator. Coordinates checkout flow. |
| **Product Service** | Python / FastAPI | `4003` | Manages catalog items. |
| **Cart Service** | Go / `net/http` | `4004` | Stores volatile cart state. |
| **Inventory Service** | Node.js / Express | `4005` | Validates stock before order. |
| **Payment Service** | Go / `net/http` | `4007` | Simulates mock payment gateway transactions. |
| **Notification Service** | Python / FastAPI | `4008` | Mocks outgoing email / SMS dispatches. |
