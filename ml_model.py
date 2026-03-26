"""
Green Cloud Framework - ML Energy Prediction Model
Uses Linear Regression to predict energy consumption based on task parameters.
"""

import numpy as np
from sklearn.linear_model import LinearRegression

# ---------------------------------------------------------------------------
# Synthetic training data
# Features: [cpu_usage (%), memory_usage (GB), duration (minutes)]
# Target  : energy_consumption (kWh)
# ---------------------------------------------------------------------------

np.random.seed(42)

_N_SAMPLES = 200
_cpu = np.random.uniform(10, 100, _N_SAMPLES)
_memory = np.random.uniform(1, 64, _N_SAMPLES)
_duration = np.random.uniform(1, 120, _N_SAMPLES)

# Realistic energy formula with some noise
_energy = (
    0.05 * _cpu
    + 0.03 * _memory
    + 0.02 * _duration
    + 0.001 * _cpu * _duration
    + np.random.normal(0, 0.3, _N_SAMPLES)
)

X_train = np.column_stack([_cpu, _memory, _duration])
y_train = _energy

# Train the model once at import time
model = LinearRegression()
model.fit(X_train, y_train)

# Model accuracy info
_score = model.score(X_train, y_train)
print(f"[ML Model] Trained LinearRegression  R² = {_score:.4f}")


def predict_energy(cpu_usage: float, memory_usage: float, duration: float) -> float:
    """
    Predict energy consumption (kWh) for a given task.

    Args:
        cpu_usage   : CPU usage percentage (0-100)
        memory_usage: Memory usage in GB
        duration    : Task duration in minutes

    Returns:
        Predicted energy consumption in kWh (≥ 0.01)
    """
    features = np.array([[cpu_usage, memory_usage, duration]])
    prediction = model.predict(features)[0]
    return round(max(prediction, 0.01), 3)


def get_model_info() -> dict:
    """Return model metadata for the dashboard."""
    return {
        "algorithm": "Linear Regression",
        "r2_score": round(_score, 4),
        "training_samples": _N_SAMPLES,
        "features": ["cpu_usage (%)", "memory_usage (GB)", "duration (min)"],
        "coefficients": {
            "cpu_usage": round(model.coef_[0], 5),
            "memory_usage": round(model.coef_[1], 5),
            "duration": round(model.coef_[2], 5),
        },
        "intercept": round(model.intercept_, 5),
    }
