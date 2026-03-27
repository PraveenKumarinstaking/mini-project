# Software Requirements Specification (SRS)
## Green Cloud Framework: Energy-Efficient Task Scheduling

### 1. Introduction
#### 1.1 Purpose
The purpose of this document is to provide a detailed description of the Green Cloud Framework. It covers the functional and non-functional requirements, system features, and external interface requirements necessary for building a carbon-aware cloud task scheduler.

#### 1.2 Scope
The Green Cloud Framework is a system designed to optimize cloud computing workloads by reducing their carbon footprint. It integrates Machine Learning for energy prediction and a carbon-aware scheduling algorithm to route tasks to data centers with the lowest carbon intensity or delay them until a lower-emission window is available.

#### 1.3 Definitions, Acronyms, and Abbreviations
- **SRS**: Software Requirements Specification
- **gCO₂/kWh**: Grams of CO₂ per kilowatt-hour (unit of carbon intensity)
- **ML**: Machine Learning
- **QoS**: Quality of Service
- **SLA**: Service Level Agreement

#### 1.4 Overview
This SRS follows the IEEE 830-1998 standard. Section 2 providing an overall description of the product, Section 3 detailing system features, Section 4 specifying external interface requirements, and Section 5 defining non-functional requirements.

---

### 2. Overall Description
#### 2.1 Product Perspective
The Green Cloud Framework is an independent system consisting of a FastAPI backend, an ML-based prediction engine, and a web-based real-time monitoring dashboard.

#### 2.2 Product Functions
- Task energy consumption prediction using Linear Regression.
- Carbon-aware scheduling (Run Now vs. Delayed) based on threshold-based algorithms.
- Multi-region data center simulation with varying carbon intensities.
- Real-time visualization of energy usage, carbon savings, and scheduling decisions.

#### 2.3 User Classes and Characteristics
- **Cloud Administrators**: Monitor system-wide carbon efficiency and manage data center thresholds.
- **Developers/Users**: Submit tasks and view individual task status/energy predictions.

#### 2.4 Operating Environment
- **Operating System**: Windows, Linux, or macOS.
- **Runtime**: Python 3.8+
- **Browser**: Modern web browsers (Chrome, Firefox, Safari, Edge).

#### 2.5 Design and Implementation Constraints
- The system currently uses an in-memory database for simulation purposes.
- The ML model uses synthetic/historical data for training and prediction.

---

### 3. System Features
#### 3.1 Carbon-Aware Task Scheduling
- **Description**: Automatically routes tasks to the data center with the lowest current carbon intensity.
- **Input**: Task parameters (CPU, Memory, Duration), current grid carbon data.
- **Requirement**: If the lowest available carbon intensity is below the user-defined threshold (default: 50 gCO₂/kWh), the task is run immediately. Otherwise, it is marked as "Delayed".

#### 3.2 ML Energy Prediction
- **Description**: Uses a Linear Regression model to estimate the energy (kWh) required for a task before it is executed.
- **Accuracy**: Targets an R² score of >0.90 (Current implementation ≈ 0.94).
- **Features**: CPU Usage (%), Memory Usage (GB), and Duration (minutes).

#### 3.3 Real-Time Dashboard
- **Description**: A web-based interface for monitoring and interaction.
- **Features**:
    - Live Timeline for carbon intensity.
    - Global Data Center status overview.
    - Task History log with audit details.
    - Efficiency metrics showing total CO₂ saved.

---

### 4. External Interface Requirements
#### 4.1 User Interfaces
- **Web Dashboard**: Dark-themed, responsive UI built with HTML, Vanilla CSS, and JavaScript.
- **Charts**: Use Chart.js for visualizing temporal carbon trends.

#### 4.2 Software Interfaces
- **FastAPI**: Backend framework for REST API endpoints.
- **Scikit-learn**: ML library for energy modeling.
- **StaticFiles**: ASGI mounting for serving UI assets.

#### 4.3 Communications Interfaces
- **REST API**: HTTP POST/GET requests for data exchange.
- **JSON**: Data serialization format.

---

### 5. Non-functional Requirements
#### 5.1 Performance Requirements
- Carbon-aware decisions should be made within 100ms of task submission.
- Real-time dashboard should update data at 5-second intervals.

#### 5.2 Sustainability Requirements
- The system must prioritize carbon reduction over immediate task execution when possible.
- Target a minimum of 30% carbon reduction compared to non-optimized scheduling.

#### 5.3 Reliability
- System uptime of 99.9% for simulated environments.
- Graceful handling of invalid task inputs with descriptive error messages.
