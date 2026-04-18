"""
Analytics API Routes — /api/ml/*, /api/equity/*
Serves ML model outputs: forecasts, clusters, anomalies, ROI, equity gaps.
"""

from fastapi import APIRouter
import numpy as np

router = APIRouter(tags=["analytics"])


def init_routes(master_df, cluster_result, roi_result, anomaly_result, forecasts):
    """Initialize analytics routes with pre-computed ML results."""

    @router.get("/api/ml/forecast")
    async def ml_forecast():
        """Prophet-style 5-year forecast per sector with CI bands."""
        if not forecasts:
            return {"forecasts": {}, "message": "No forecast data available"}
        return {"forecasts": forecasts}

    @router.get("/api/ml/clusters")
    async def ml_clusters():
        """K-Means state clusters with PCA coordinates and centroids."""
        if not cluster_result:
            return {"clusters": [], "message": "No cluster data available"}
        return cluster_result

    @router.get("/api/ml/anomalies")
    async def ml_anomalies():
        """Isolation Forest anomaly flags and details."""
        if not anomaly_result:
            return {"anomalies": [], "message": "No anomaly data available"}
        return anomaly_result

    @router.get("/api/ml/roi")
    async def ml_roi():
        """ROI regression scores and feature importance."""
        if not roi_result:
            return {"roi_scores": [], "message": "No ROI data available"}
        return roi_result

    @router.get("/api/equity/gaps")
    async def equity_gaps():
        """Inter-state equity gap matrix — state × sector deviation from national avg."""
        sector_pct_cols = [c for c in master_df.columns if c.endswith("_allocation_pct")]

        # Calculate national averages
        national_avg = {}
        for col in sector_pct_cols:
            national_avg[col] = float(master_df[col].mean())

        # Build gap matrix
        gap_matrix = []
        for _, row in master_df.iterrows():
            state_gaps = {
                "state": row["state"],
                "hdi_score": round(float(row.get("hdi_score", 0)), 3),
            }
            total_gap = 0
            for col in sector_pct_cols:
                sector = col.replace("_allocation_pct", "")
                gap = round(float(row[col]) - national_avg[col], 2)
                state_gaps[sector] = gap
                total_gap += abs(gap)
            state_gaps["total_deviation"] = round(total_gap, 2)
            gap_matrix.append(state_gaps)

        # Sort by total deviation (most unequal first)
        gap_matrix.sort(key=lambda x: -x["total_deviation"])

        return {
            "national_averages": {
                col.replace("_allocation_pct", ""): round(v, 2)
                for col, v in national_avg.items()
            },
            "gap_matrix": gap_matrix,
        }

    return router
