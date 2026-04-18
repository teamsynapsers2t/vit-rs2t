"""
K-Means State Clustering by spending pattern.
Groups 31 states into k clusters based on budget allocation profiles.
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
import joblib
import os


FEATURE_COLS = [
    "health_allocation_pct",
    "education_allocation_pct",
    "agriculture_allocation_pct",
    "infrastructure_allocation_pct",
    "composite_roi_score",
    "hdi_score",
    "poverty_headcount_pct",
    "fiscal_deficit_pct_gsdp",
]


def train_clusters(df: pd.DataFrame, k: int = 5, save_dir: str = None):
    """
    Train K-Means clustering on state budget features.

    Returns:
        dict with keys: states (list of {state, cluster, pca_x, pca_y}),
                        centroids (list of dicts per cluster),
                        silhouette (float)
    """
    available_cols = [c for c in FEATURE_COLS if c in df.columns]
    X_raw = df[available_cols].fillna(0)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_raw)

    # K-Means
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)

    # PCA for 2D visualization
    pca = PCA(n_components=2)
    coords = pca.fit_transform(X_scaled)

    # Silhouette score
    sil = silhouette_score(X_scaled, labels) if k > 1 else 0

    # Build results
    states_result = []
    for i, row in df.iterrows():
        states_result.append({
            "state": row["state"],
            "cluster": int(labels[i]),
            "pca_x": round(float(coords[i, 0]), 4),
            "pca_y": round(float(coords[i, 1]), 4),
        })

    # Centroids in original feature space
    centroids_scaled = kmeans.cluster_centers_
    centroids_original = scaler.inverse_transform(centroids_scaled)
    centroids_result = []
    for ci in range(k):
        centroid = {}
        for j, col in enumerate(available_cols):
            centroid[col] = round(float(centroids_original[ci, j]), 3)
        centroid["cluster"] = ci
        centroids_result.append(centroid)

    if save_dir:
        os.makedirs(save_dir, exist_ok=True)
        joblib.dump({
            "kmeans": kmeans,
            "scaler": scaler,
            "pca": pca,
            "feature_cols": available_cols,
        }, os.path.join(save_dir, "clusterer.pkl"))
        print(f"  [OK] Saved clusterer to {save_dir}/clusterer.pkl (silhouette={sil:.3f})")

    return {
        "states": states_result,
        "centroids": centroids_result,
        "silhouette": round(sil, 4),
        "k": k,
        "pca_variance_ratio": [round(float(v), 4) for v in pca.explained_variance_ratio_],
    }


def load_clusterer(model_dir: str):
    """Load pre-trained clusterer artifacts."""
    path = os.path.join(model_dir, "clusterer.pkl")
    if os.path.exists(path):
        return joblib.load(path)
    return None
