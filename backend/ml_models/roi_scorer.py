"""
ROI Regression — Random Forest predicting composite outcome score.
This model powers the optimizer's objective function weights.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score
import joblib
import os


FEATURE_COLS = [
    "health_allocation_pct",
    "education_allocation_pct",
    "agriculture_allocation_pct",
    "infrastructure_allocation_pct",
    "rural_dev_allocation_pct",
    "fiscal_deficit_pct_gsdp",
    "hdi_score",
    "poverty_headcount_pct",
]

TARGET_COL = "composite_roi_score"


def train_roi_model(df: pd.DataFrame, save_dir: str = None):
    """
    Train Random Forest regressor to predict composite ROI score.

    Returns:
        dict with r2_mean, r2_std, feature_importance, roi_scores
    """
    available_features = [c for c in FEATURE_COLS if c in df.columns]
    X = df[available_features].fillna(df[available_features].median())
    y = df[TARGET_COL].fillna(50)

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=8,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X, y)

    # Cross-validation
    cv_scores = cross_val_score(model, X, y, cv=min(5, len(X)), scoring="r2")

    # Feature importance
    importance = dict(zip(available_features, model.feature_importances_.tolist()))
    importance = {k: round(v, 4) for k, v in sorted(importance.items(), key=lambda x: -x[1])}

    # Per-state ROI predictions
    predictions = model.predict(X)
    roi_scores = []
    for i, row in df.iterrows():
        roi_scores.append({
            "state": row["state"],
            "actual_roi": round(float(y.iloc[i]), 2),
            "predicted_roi": round(float(predictions[i]), 2),
        })

    if save_dir:
        os.makedirs(save_dir, exist_ok=True)
        joblib.dump({
            "model": model,
            "feature_cols": available_features,
        }, os.path.join(save_dir, "roi_model.pkl"))
        print(f"  [OK] Saved ROI model to {save_dir}/roi_model.pkl (R2={cv_scores.mean():.3f})")

    return {
        "r2_mean": round(float(cv_scores.mean()), 4),
        "r2_std": round(float(cv_scores.std()), 4),
        "feature_importance": importance,
        "roi_scores": roi_scores,
    }


def load_roi_model(model_dir: str):
    """Load pre-trained ROI model."""
    path = os.path.join(model_dir, "roi_model.pkl")
    if os.path.exists(path):
        return joblib.load(path)
    return None


def predict_roi(model_artifacts: dict, allocation_pcts: dict):
    """Predict ROI for a given allocation configuration."""
    model = model_artifacts["model"]
    feature_cols = model_artifacts["feature_cols"]

    X = np.array([[allocation_pcts.get(col, 0) for col in feature_cols]])
    prediction = model.predict(X)[0]
    return round(float(prediction), 2)
