"""
Budget API Routes — /api/budget/*
Serves national budget summary, state data, and historical trends.
"""

from fastapi import APIRouter, HTTPException
from typing import Optional

router = APIRouter(prefix="/api/budget", tags=["budget"])


def init_routes(master_df, trends_df):
    """Initialize routes with data references."""

    @router.get("/summary")
    async def budget_summary():
        """National budget summary — totals, sector breakdown, fiscal year."""
        sectors = [c.replace("_allocation_crore", "") for c in master_df.columns if c.endswith("_allocation_crore")]

        sector_breakdown = {}
        for s in sectors:
            col = f"{s}_allocation_crore"
            if col in master_df.columns:
                sector_breakdown[s] = round(float(master_df[col].sum()), 2)

        total_budget = round(float(master_df["total_budget_crore"].sum()), 2)
        avg_hdi = round(float(master_df["hdi_score"].mean()), 3)
        anomaly_count = int((master_df["anomaly_flag"] == -1).sum())

        return {
            "fiscal_year": "2024-25",
            "total_budget_crore": total_budget,
            "num_states": len(master_df),
            "avg_hdi_score": avg_hdi,
            "states_with_anomalies": anomaly_count,
            "sector_breakdown": sector_breakdown,
            "sector_percentages": {
                s: round(v / total_budget * 100, 2) if total_budget > 0 else 0
                for s, v in sector_breakdown.items()
            },
        }

    @router.get("/states")
    async def budget_states():
        """All states with budget + outcome data."""
        states = []
        for _, row in master_df.iterrows():
            state_data = {
                "id": row["state"].lower().replace(" ", "-").replace("&", "and"),
                "name": row["state"],
                "total_budget_crore": round(float(row["total_budget_crore"]), 2),
                "hdi_score": round(float(row.get("hdi_score", 0)), 3),
                "cluster_id": int(row.get("cluster_id", 0)),
                "anomaly_flag": int(row.get("anomaly_flag", 1)),
                "composite_roi_score": round(float(row.get("composite_roi_score", 50)), 2),
                "health_outcome_score": round(float(row.get("health_outcome_score", 50)), 1),
                "education_outcome_score": round(float(row.get("education_outcome_score", 50)), 1),
                "infant_mortality_rate": round(float(row.get("infant_mortality_rate", 30)), 1),
                "literacy_rate_pct": round(float(row.get("literacy_rate_pct", 70)), 1),
                "poverty_headcount_pct": round(float(row.get("poverty_headcount_pct", 20)), 1),
                "fiscal_deficit_pct_gsdp": round(float(row.get("fiscal_deficit_pct_gsdp", 3)), 2),
            }

            # Sector allocations
            sectors = {}
            for col in master_df.columns:
                if col.endswith("_allocation_crore"):
                    s = col.replace("_allocation_crore", "")
                    sectors[s] = {
                        "crore": round(float(row[col]), 2),
                        "pct": round(float(row.get(f"{s}_allocation_pct", 0)), 2),
                    }
            state_data["sectors"] = sectors
            states.append(state_data)

        return {"states": states}

    @router.get("/state/{state_id}")
    async def budget_state(state_id: str):
        """Single state deep data — all sectors, all years."""
        # Match by ID format
        for _, row in master_df.iterrows():
            sid = row["state"].lower().replace(" ", "-").replace("&", "and")
            if sid == state_id:
                state_data = {
                    "id": sid,
                    "name": row["state"],
                    "total_budget_crore": round(float(row["total_budget_crore"]), 2),
                    "hdi_score": round(float(row.get("hdi_score", 0)), 3),
                    "hdi_rank": int(master_df["hdi_score"].rank(ascending=False).loc[row.name]),
                    "cluster_id": int(row.get("cluster_id", 0)),
                    "anomaly_flag": int(row.get("anomaly_flag", 1)),
                    "composite_roi_score": round(float(row.get("composite_roi_score", 50)), 2),
                    "health_outcome_score": round(float(row.get("health_outcome_score", 50)), 1),
                    "education_outcome_score": round(float(row.get("education_outcome_score", 50)), 1),
                    "infant_mortality_rate": round(float(row.get("infant_mortality_rate", 30)), 1),
                    "literacy_rate_pct": round(float(row.get("literacy_rate_pct", 70)), 1),
                    "poverty_headcount_pct": round(float(row.get("poverty_headcount_pct", 20)), 1),
                    "fiscal_deficit_pct_gsdp": round(float(row.get("fiscal_deficit_pct_gsdp", 3)), 2),
                }

                # Sector allocations with national averages
                sectors = {}
                for col in master_df.columns:
                    if col.endswith("_allocation_pct"):
                        s = col.replace("_allocation_pct", "")
                        crore_col = f"{s}_allocation_crore"
                        sectors[s] = {
                            "crore": round(float(row.get(crore_col, 0)), 2),
                            "pct": round(float(row[col]), 2),
                            "national_avg_pct": round(float(master_df[col].mean()), 2),
                        }
                state_data["sectors"] = sectors

                # Historical data for this state
                if trends_df is not None:
                    state_trends = trends_df[trends_df["state"] == row["state"]]
                    history = []
                    for _, tr in state_trends.tail(5).iterrows():
                        yr = {"year": int(tr["year"]), "total_budget_crore": round(float(tr["total_budget_crore"]), 2)}
                        for col in state_trends.columns:
                            if col.endswith("_allocation_crore"):
                                s = col.replace("_allocation_crore", "")
                                yr[s] = round(float(tr[col]), 2)
                        history.append(yr)
                    state_data["history"] = history

                return state_data

        raise HTTPException(status_code=404, detail=f"State '{state_id}' not found")

    @router.get("/trends")
    async def budget_trends(sector: Optional[str] = None):
        """Historical time-series data by sector."""
        if trends_df is None:
            return {"trends": [], "message": "No historical data available"}

        if sector:
            col = f"{sector}_allocation_crore"
            if col not in trends_df.columns:
                raise HTTPException(status_code=400, detail=f"Unknown sector: {sector}")
            yearly = trends_df.groupby("year")[col].sum().reset_index()
            return {
                "sector": sector,
                "trends": [
                    {"year": int(r["year"]), "value": round(float(r[col]), 2)}
                    for _, r in yearly.iterrows()
                ],
            }

        # All sectors
        sector_cols = [c for c in trends_df.columns if c.endswith("_allocation_crore")]
        all_trends = {}
        for col in sector_cols:
            s = col.replace("_allocation_crore", "")
            yearly = trends_df.groupby("year")[col].sum().reset_index()
            all_trends[s] = [
                {"year": int(r["year"]), "value": round(float(r[col]), 2)}
                for _, r in yearly.iterrows()
            ]

        return {"trends": all_trends}

    return router
