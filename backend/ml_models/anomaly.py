"""
Anomaly Detection — Isolation Forest for flagging unusual budget allocations.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os


SECTOR_COLS = [
    "health_allocation_pct",
    "education_allocation_pct",
    "agriculture_allocation_pct",
    "infrastructure_allocation_pct",
    "rural_dev_allocation_pct",
    "energy_allocation_pct",
]


def detect_anomalies(df: pd.DataFrame, contamination: float = 0.1, save_dir: str = None):
    """
    Run Isolation Forest anomaly detection on allocation percentages.

    Returns:
        dict with anomalies list and model info
    """
    available_cols = [c for c in SECTOR_COLS if c in df.columns]
    X = df[available_cols].fillna(df[available_cols].median())

    clf = IsolationForest(
        contamination=contamination,
        random_state=42,
        n_estimators=100,
    )
    flags = clf.fit_predict(X)          # -1 = anomaly, 1 = normal
    scores = clf.decision_function(X)   # lower = more anomalous

    results = []
    anomaly_details = []

    for i, row in df.iterrows():
        entry = {
            "state": row["state"],
            "anomaly_flag": int(flags[i]),
            "anomaly_score": round(float(scores[i]), 4),
        }
        results.append(entry)

        if flags[i] == -1:
            # Find which sectors are most anomalous for this state
            state_vals = X.iloc[i]
            medians = X.median()
            deviations = {}
            for col in available_cols:
                dev = state_vals[col] - medians[col]
                deviations[col] = round(float(dev), 2)

            most_anomalous = max(deviations.items(), key=lambda x: abs(x[1]))
            direction = "over-allocated" if most_anomalous[1] > 0 else "under-allocated"
            sector_name = most_anomalous[0].replace("_allocation_pct", "").replace("_", " ").title()

            anomaly_details.append({
                "state": row["state"],
                "score": round(float(scores[i]), 4),
                "flag_reason": f"{sector_name} is {direction} by {abs(most_anomalous[1]):.1f}pp vs median",
                "sector": most_anomalous[0],
                "deviation": most_anomalous[1],
            })

    # Sort anomalies by severity
    anomaly_details.sort(key=lambda x: x["score"])

    if save_dir:
        os.makedirs(save_dir, exist_ok=True)
        joblib.dump({
            "model": clf,
            "feature_cols": available_cols,
        }, os.path.join(save_dir, "anomaly_model.pkl"))
        n_anom = sum(1 for f in flags if f == -1)
        print(f"  [OK] Saved anomaly model to {save_dir}/anomaly_model.pkl ({n_anom} anomalies flagged)")

    return {
        "states": results,
        "anomaly_details": anomaly_details,
        "total_anomalies": sum(1 for f in flags if f == -1),
        "contamination": contamination,
    }


def load_anomaly_model(model_dir: str):
    """Load pre-trained anomaly model."""
    path = os.path.join(model_dir, "anomaly_model.pkl")
    if os.path.exists(path):
        return joblib.load(path)
    return None
