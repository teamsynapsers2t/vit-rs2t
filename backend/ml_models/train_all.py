"""
Train All ML Models — orchestrator script.
Trains all 4 models and serializes them to backend/models/.
"""

import os
import sys
import pandas as pd

# Add parent dirs to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.ml_models.forecaster import train_forecasters
from backend.ml_models.clusterer import train_clusters
from backend.ml_models.roi_scorer import train_roi_model
from backend.ml_models.anomaly import detect_anomalies


def main():
    print("CivicSight — ML Model Training")
    print("=" * 50)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data", "processed")
    model_dir = os.path.join(base_dir, "models")
    os.makedirs(model_dir, exist_ok=True)

    # Load data
    master_path = os.path.join(data_dir, "master_optimization_table.csv")
    trends_path = os.path.join(data_dir, "historical_trends.csv")

    if not os.path.exists(master_path):
        print(f"ERROR: {master_path} not found. Run data_ingestion.py first.")
        sys.exit(1)

    master_df = pd.read_csv(master_path)
    print(f"  Loaded master table: {master_df.shape}")

    # 1. Time-Series Forecasting
    print("\n[1/4] Training Time-Series Forecasters...")
    if os.path.exists(trends_path):
        trends_df = pd.read_csv(trends_path)
        print(f"  Loaded trends data: {trends_df.shape}")
        forecasters, forecasts = train_forecasters(trends_df, save_dir=model_dir)
        print(f"  Generated forecasts for {len(forecasts)} sectors")
    else:
        print("  SKIP — historical_trends.csv not found")

    # 2. State Clustering
    print("\n[2/4] Training K-Means State Clusterer...")
    cluster_result = train_clusters(master_df, k=5, save_dir=model_dir)
    print(f"  Silhouette score: {cluster_result['silhouette']}")
    print(f"  PCA variance explained: {cluster_result['pca_variance_ratio']}")

    # Update master_df with cluster labels
    for item in cluster_result["states"]:
        mask = master_df["state"] == item["state"]
        master_df.loc[mask, "cluster_id"] = item["cluster"]

    # 3. ROI Regression
    print("\n[3/4] Training ROI Regression Model...")
    roi_result = train_roi_model(master_df, save_dir=model_dir)
    print(f"  R² (5-fold CV): {roi_result['r2_mean']} ± {roi_result['r2_std']}")
    print(f"  Top features: {list(roi_result['feature_importance'].keys())[:3]}")

    # 4. Anomaly Detection
    print("\n[4/4] Training Anomaly Detection Model...")
    anomaly_result = detect_anomalies(master_df, contamination=0.1, save_dir=model_dir)
    print(f"  Anomalies flagged: {anomaly_result['total_anomalies']}/{len(master_df)}")
    for detail in anomaly_result["anomaly_details"][:3]:
        print(f"    [!] {detail['state']}: {detail['flag_reason']}")

    # Update master_df with anomaly flags
    for item in anomaly_result["states"]:
        mask = master_df["state"] == item["state"]
        master_df.loc[mask, "anomaly_flag"] = item["anomaly_flag"]

    # Save updated master table
    master_df.to_csv(master_path, index=False)
    print(f"\n[DONE] All models trained and saved to {model_dir}/")
    print(f"   Updated {master_path} with cluster + anomaly labels")


if __name__ == "__main__":
    main()
