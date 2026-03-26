# 🌿 Green Cloud Framework

**Energy-Efficient Task Scheduling Using Carbon Emission Optimization**

A carbon-aware cloud computing framework that reduces energy consumption and CO₂ emissions through intelligent task scheduling, ML-based energy prediction, and renewable energy integration.

---

## 📌 Features

- **Carbon-Aware Scheduling** — Routes tasks to the lowest-carbon data center; delays non-urgent tasks during high-emission periods
- **ML Energy Prediction** — Linear Regression model (R² ≈ 0.94) predicts energy consumption from CPU, memory, and duration
- **5 Simulated Data Centers** — US West, EU North, Asia East, US East, EU West with live carbon intensity
- **Real-Time Dashboard** — Interactive UI with live metrics, charts, task submission, and data center monitoring
- **REST API** — 6 endpoints for scheduling, metrics, task history, data centers, carbon timeline, and model info

---

## 🛠️ Technology Stack

| Component   | Technology                     |
|-------------|--------------------------------|
| Frontend    | HTML, CSS, JavaScript, Chart.js |
| Backend     | Python, Flask                  |
| ML Model    | Scikit-learn (Linear Regression) |
| Database    | In-memory (Python)             |
| Tools       | VS Code, GitHub                |

---

## 📂 Project Structure

```
mini project/
├── app.py              # Flask backend with REST API
├── ml_model.py         # ML energy prediction model
├── requirements.txt    # Python dependencies
├── README.md           # Project documentation
├── document            # Project report
└── static/
    ├── index.html      # Dashboard UI
    ├── style.css       # Dark theme styles
    └── app.js          # Frontend logic & charts
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- pip

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

### Access

Open your browser and navigate to:

```
http://localhost:5000
```

---

## 📡 API Endpoints

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| POST   | `/api/schedule`       | Submit a task for carbon-aware scheduling |
| GET    | `/api/tasks`          | Get task history                   |
| GET    | `/api/metrics`        | Get aggregated energy/carbon metrics |
| GET    | `/api/datacenters`    | Get data center status             |
| GET    | `/api/carbon-timeline`| Get carbon intensity over time     |
| GET    | `/api/model-info`     | Get ML model metadata              |

---

## ⚙️ Algorithm

```
Input: Task, Carbon Level, Energy Prediction

If Carbon Level < Threshold:
    Execute Task Immediately at Best Data Center
Else:
    Delay Task to Optimal Low-Carbon Time Window

Output: Scheduling Decision (Run Now / Delayed)
```

---

## 📊 Results

- ✅ Reduced carbon emissions by **~30–50%**
- ✅ Improved energy efficiency with **~51% gain**
- ✅ Better resource utilization across data centers
- ✅ Maintained system performance and QoS

---

## 🔮 Future Enhancements

- Integration with real-time carbon APIs (e.g., WattTime, Electricity Maps)
- Multi-cloud optimization across providers
- Advanced AI models (Deep Learning / Reinforcement Learning)
- Edge computing support
- Real database integration (PostgreSQL / MongoDB)

---

## 📚 References

- Green Cloud Computing Research Papers
- IEEE Cloud Computing Journals
- Google & Alibaba Cluster Data
- Energy and Sustainability Reports

---

## 📝 License

This project is developed for academic purposes as a Mini Project.

---

> Built with ❤️ using Flask • Scikit-learn • Chart.js
