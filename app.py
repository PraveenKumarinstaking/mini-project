"""
Green Cloud Framework – FastAPI Backend
Carbon-aware task scheduling with ML-based energy prediction.
"""

import random
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from ml_model import predict_energy, get_model_info

# ─── App Setup ────────────────────────────────────────────────────────────────
app = FastAPI(title="Green Cloud Framework API")

# ─── Models ──────────────────────────────────────────────────────────────────
class TaskInput(BaseModel):
    name: str = "Unnamed Task"
    cpu_usage: float = 50.0
    memory_usage: float = 8.0
    duration: float = 30.0

# ─── Simulated Data Centers ──────────────────────────────────────────────────
DATA_CENTERS = [
    {"id": "dc-us-west", "name": "US West (Oregon)", "region": "North America", "renewable_pct": 78, "base_carbon": 35, "status": "online"},
    {"id": "dc-eu-north", "name": "EU North (Sweden)", "region": "Europe", "renewable_pct": 92, "base_carbon": 18, "status": "online"},
    {"id": "dc-asia-east", "name": "Asia East (Singapore)", "region": "Asia Pacific", "renewable_pct": 45, "base_carbon": 65, "status": "online"},
    {"id": "dc-us-east", "name": "US East (Virginia)", "region": "North America", "renewable_pct": 60, "base_carbon": 50, "status": "online"},
    {"id": "dc-eu-west", "name": "EU West (Ireland)", "region": "Europe", "renewable_pct": 85, "base_carbon": 25, "status": "online"},
]

CARBON_THRESHOLD = 50  # gCO₂/kWh

# ─── In-Memory Storage ──────────────────────────────────────────────────────
tasks_history = []
carbon_timeline = []


def _carbon_intensity(dc: dict) -> int:
    return max(5, dc["base_carbon"] + random.randint(-15, 15))


def _seed_initial_data():
    sample_tasks = [
        ("Data Pipeline ETL", 72, 16, 45),
        ("Model Training Job", 95, 32, 90),
        ("Web Scraping Batch", 40, 8, 20),
        ("Log Aggregation", 30, 4, 15),
        ("Image Processing", 85, 24, 60),
        ("Report Generation", 25, 6, 10),
        ("Video Transcoding", 90, 32, 75),
        ("Database Backup", 35, 12, 30),
    ]
    for i, (name, cpu, mem, dur) in enumerate(sample_tasks):
        energy = predict_energy(cpu, mem, dur)
        dc = random.choice(DATA_CENTERS)
        ci = _carbon_intensity(dc)
        carbon = round(energy * ci / 1000, 3)
        status = "completed" if ci < CARBON_THRESHOLD else "delayed"
        ts = datetime.now() - timedelta(hours=len(sample_tasks) - i)
        tasks_history.append({
            "id": str(uuid.uuid4())[:8],
            "name": name,
            "cpu_usage": cpu,
            "memory_usage": mem,
            "duration": dur,
            "energy_predicted": energy,
            "carbon_intensity": ci,
            "carbon_emission": carbon,
            "data_center": dc["name"],
            "status": status,
            "timestamp": ts.isoformat(),
        })
        carbon_timeline.append({
            "time": ts.strftime("%H:%M"),
            "carbon": ci,
            "energy": energy,
            "label": name[:20],
        })


_seed_initial_data()


# ─── Routes ──────────────────────────────────────────────────────────────────
@app.post("/api/schedule")
async def schedule_task(task: TaskInput):
    energy = predict_energy(task.cpu_usage, task.memory_usage, task.duration)

    dc_options = []
    for dc in DATA_CENTERS:
        ci = _carbon_intensity(dc)
        dc_options.append((dc, ci))
    dc_options.sort(key=lambda x: x[1])

    best_dc, best_ci = dc_options[0]
    carbon_emission = round(energy * best_ci / 1000, 3)

    if best_ci < CARBON_THRESHOLD:
        status, decision = "running", "Run Now"
        message = f"Carbon intensity is LOW ({best_ci} gCO₂/kWh) at {best_dc['name']}. Task scheduled."
    else:
        status, decision = "delayed", "Delayed"
        message = f"Carbon intensity is HIGH ({best_ci} gCO₂/kWh). Task delayed."

    task_record = {
        "id": str(uuid.uuid4())[:8],
        "name": task.name,
        "cpu_usage": task.cpu_usage,
        "memory_usage": task.memory_usage,
        "duration": task.duration,
        "energy_predicted": energy,
        "carbon_intensity": best_ci,
        "carbon_emission": carbon_emission,
        "data_center": best_dc["name"],
        "status": status,
        "decision": decision,
        "timestamp": datetime.now().isoformat(),
    }
    tasks_history.append(task_record)
    carbon_timeline.append({
        "time": datetime.now().strftime("%H:%M"),
        "carbon": best_ci,
        "energy": energy,
        "label": task.name[:20],
    })

    return {"success": True, "task": task_record, "message": message}


@app.get("/api/tasks")
async def get_tasks():
    return tasks_history[::-1]


@app.get("/api/metrics")
async def get_metrics():
    total_tasks = len(tasks_history)
    if total_tasks == 0:
        return {"total_tasks": 0, "tasks_run": 0, "tasks_delayed": 0, "total_energy": 0, "total_carbon": 0, "avg_carbon_intensity": 0, "carbon_saved": 0, "efficiency_pct": 0}

    tasks_run = sum(1 for t in tasks_history if t["status"] in ("running", "completed"))
    tasks_delayed = sum(1 for t in tasks_history if t["status"] == "delayed")
    total_energy = round(sum(t["energy_predicted"] for t in tasks_history), 2)
    total_carbon = round(sum(t["carbon_emission"] for t in tasks_history), 3)
    avg_ci = round(sum(t["carbon_intensity"] for t in tasks_history) / total_tasks, 1)

    worst_case_carbon = round(sum(t["energy_predicted"] * 80 / 1000 for t in tasks_history), 3)
    carbon_saved = round(max(worst_case_carbon - total_carbon, 0), 3)
    efficiency_pct = round((carbon_saved / worst_case_carbon) * 100, 1) if worst_case_carbon else 0

    return {
        "total_tasks": total_tasks,
        "tasks_run": tasks_run,
        "tasks_delayed": tasks_delayed,
        "total_energy": total_energy,
        "total_carbon": total_carbon,
        "avg_carbon_intensity": avg_ci,
        "carbon_saved": carbon_saved,
        "efficiency_pct": efficiency_pct,
    }


@app.get("/api/datacenters")
async def get_datacenters():
    return [{**dc, "current_carbon": _carbon_intensity(dc)} for dc in DATA_CENTERS]


@app.get("/api/carbon-timeline")
async def get_carbon_timeline():
    return carbon_timeline[-20:]


@app.get("/api/model-info")
async def model_info():
    return get_model_info()


# ─── Static Files ───────────────────────────────────────────────────────────
app.mount("/", StaticFiles(directory="static", html=True), name="static")

# ─── Run ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("\n🌿 Green Cloud Framework (FastAPI) running at http://localhost:5000\n")
    uvicorn.run(app, host="0.0.0.0", port=5000)
