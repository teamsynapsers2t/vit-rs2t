"""
CivicSight -- FastAPI Backend Entry Point
Loads data + ML models on startup, serves all API endpoints.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional, List
import pandas as pd

from backend.ml_models.forecaster import train_forecasters
from backend.ml_models.clusterer import train_clusters
from backend.ml_models.roi_scorer import train_roi_model
from backend.ml_models.anomaly import detect_anomalies
from backend.optimizer import run_optimizer, run_shock_simulation, DEFAULT_ROI

app = FastAPI(title="CivicSight API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global data stores ---
_data = {
    "master_df": None,
    "trends_df": None,
    "cluster_result": None,
    "roi_result": None,
    "anomaly_result": None,
    "forecasts": None,
}


@app.on_event("startup")
async def startup():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data", "processed")
    model_dir = os.path.join(base_dir, "models")

    print("\n>>> CivicSight API Starting...")
    print("=" * 50)

    master_path = os.path.join(data_dir, "master_optimization_table.csv")
    if os.path.exists(master_path):
        _data["master_df"] = pd.read_csv(master_path)
        print(f"  [OK] Loaded master table: {_data['master_df'].shape}")
    else:
        print(f"  [ERR] Master table not found at {master_path}")
        return

    trends_path = os.path.join(data_dir, "historical_trends.csv")
    if os.path.exists(trends_path):
        _data["trends_df"] = pd.read_csv(trends_path)
        print(f"  [OK] Loaded trends data: {_data['trends_df'].shape}")

    print("\n  Loading ML models...")
    try:
        _data["cluster_result"] = train_clusters(_data["master_df"], k=5, save_dir=model_dir)
        print(f"  [OK] Clusters: {_data['cluster_result']['k']} groups")
    except Exception as e:
        print(f"  [ERR] Clustering failed: {e}")

    try:
        _data["roi_result"] = train_roi_model(_data["master_df"], save_dir=model_dir)
        print(f"  [OK] ROI Model: R2={_data['roi_result']['r2_mean']}")
    except Exception as e:
        print(f"  [ERR] ROI model failed: {e}")

    try:
        _data["anomaly_result"] = detect_anomalies(_data["master_df"], contamination=0.1, save_dir=model_dir)
        print(f"  [OK] Anomalies: {_data['anomaly_result']['total_anomalies']} flagged")
    except Exception as e:
        print(f"  [ERR] Anomaly detection failed: {e}")

    try:
        if _data["trends_df"] is not None:
            _, _data["forecasts"] = train_forecasters(_data["trends_df"], save_dir=model_dir)
            print(f"  [OK] Forecasts: {len(_data['forecasts'])} sectors")
    except Exception as e:
        print(f"  [ERR] Forecasting failed: {e}")

    print(f"\n[READY] CivicSight API ready!")
    print(f"   Docs: http://localhost:8000/docs")


# ===================== BUDGET ENDPOINTS =====================

@app.get("/api/budget/summary")
async def budget_summary():
    df = _data["master_df"]
    if df is None:
        raise HTTPException(500, "Data not loaded")
    sectors = [c.replace("_allocation_crore", "") for c in df.columns if c.endswith("_allocation_crore")]
    breakdown = {}
    for s in sectors:
        col = f"{s}_allocation_crore"
        if col in df.columns:
            breakdown[s] = round(float(df[col].sum()), 2)
    total = round(float(df["total_budget_crore"].sum()), 2)
    return {
        "fiscal_year": "2024-25",
        "total_budget_crore": total,
        "num_states": len(df),
        "avg_hdi_score": round(float(df["hdi_score"].mean()), 3),
        "states_with_anomalies": int((df["anomaly_flag"] == -1).sum()),
        "sector_breakdown": breakdown,
        "sector_percentages": {s: round(v / total * 100, 2) if total > 0 else 0 for s, v in breakdown.items()},
    }


@app.get("/api/budget/states")
async def budget_states():
    df = _data["master_df"]
    if df is None:
        raise HTTPException(500, "Data not loaded")
    states = []
    for _, row in df.iterrows():
        sd = {
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
        sectors = {}
        for col in df.columns:
            if col.endswith("_allocation_crore"):
                s = col.replace("_allocation_crore", "")
                sectors[s] = {"crore": round(float(row[col]), 2), "pct": round(float(row.get(f"{s}_allocation_pct", 0)), 2)}
        sd["sectors"] = sectors
        states.append(sd)
    return {"states": states}


@app.get("/api/budget/state/{state_id}")
async def budget_state(state_id: str):
    df = _data["master_df"]
    tdf = _data["trends_df"]
    if df is None:
        raise HTTPException(500, "Data not loaded")
    for _, row in df.iterrows():
        sid = row["state"].lower().replace(" ", "-").replace("&", "and")
        if sid == state_id:
            sd = {
                "id": sid, "name": row["state"],
                "total_budget_crore": round(float(row["total_budget_crore"]), 2),
                "hdi_score": round(float(row.get("hdi_score", 0)), 3),
                "hdi_rank": int(df["hdi_score"].rank(ascending=False).loc[row.name]),
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
            sectors = {}
            for col in df.columns:
                if col.endswith("_allocation_pct"):
                    s = col.replace("_allocation_pct", "")
                    sectors[s] = {
                        "crore": round(float(row.get(f"{s}_allocation_crore", 0)), 2),
                        "pct": round(float(row[col]), 2),
                        "national_avg_pct": round(float(df[col].mean()), 2),
                    }
            sd["sectors"] = sectors
            if tdf is not None:
                st = tdf[tdf["state"] == row["state"]]
                history = []
                for _, tr in st.tail(5).iterrows():
                    yr = {"year": int(tr["year"]), "total_budget_crore": round(float(tr["total_budget_crore"]), 2)}
                    for c2 in st.columns:
                        if c2.endswith("_allocation_crore"):
                            yr[c2.replace("_allocation_crore", "")] = round(float(tr[c2]), 2)
                    history.append(yr)
                sd["history"] = history
            return sd
    raise HTTPException(404, f"State '{state_id}' not found")


@app.get("/api/budget/trends")
async def budget_trends(sector: Optional[str] = None):
    tdf = _data["trends_df"]
    if tdf is None:
        return {"trends": {}}
    if sector:
        col = f"{sector}_allocation_crore"
        if col not in tdf.columns:
            raise HTTPException(400, f"Unknown sector: {sector}")
        yearly = tdf.groupby("year")[col].sum().reset_index()
        return {"sector": sector, "trends": [{"year": int(r["year"]), "value": round(float(r[col]), 2)} for _, r in yearly.iterrows()]}
    sector_cols = [c for c in tdf.columns if c.endswith("_allocation_crore")]
    all_trends = {}
    for col in sector_cols:
        s = col.replace("_allocation_crore", "")
        yearly = tdf.groupby("year")[col].sum().reset_index()
        all_trends[s] = [{"year": int(r["year"]), "value": round(float(r[col]), 2)} for _, r in yearly.iterrows()]
    return {"trends": all_trends}


# ===================== OPTIMIZE ENDPOINTS =====================

class OptimizeRequest(BaseModel):
    total: float = 4765000
    roi_scores: Optional[Dict[str, float]] = None
    weights: Optional[Dict[str, float]] = None
    constraints: Optional[Dict[str, float]] = None

class ScenarioItem(BaseModel):
    name: str = "Scenario"
    total: float = 4765000
    weights: Optional[Dict[str, float]] = None
    constraints: Optional[Dict[str, float]] = None
    inflation_pct: float = 0
    gdp_change_pct: float = 0

class BatchRequest(BaseModel):
    scenarios: List[ScenarioItem]

class ShockRequest(BaseModel):
    total: float = 4765000
    inflation_pct: float = 0
    gdp_change_pct: float = 0
    weights: Optional[Dict[str, float]] = None


@app.post("/api/optimize")
async def optimize(req: OptimizeRequest):
    return run_optimizer(total=req.total, roi_scores=req.roi_scores, weights=req.weights, constraints=req.constraints)

@app.post("/api/optimize/scenarios")
async def optimize_scenarios(req: BatchRequest):
    results = []
    for s in req.scenarios:
        if s.inflation_pct != 0 or s.gdp_change_pct != 0:
            r = run_shock_simulation(total=s.total, inflation_pct=s.inflation_pct, gdp_change_pct=s.gdp_change_pct, weights=s.weights)
        else:
            r = run_optimizer(total=s.total, weights=s.weights, constraints=s.constraints)
        r["scenario_name"] = s.name
        results.append(r)
    return {"scenarios": results}

@app.post("/api/shock")
async def shock(req: ShockRequest):
    return run_shock_simulation(total=req.total, inflation_pct=req.inflation_pct, gdp_change_pct=req.gdp_change_pct, weights=req.weights)


# ===================== ML / ANALYTICS ENDPOINTS =====================

@app.get("/api/ml/forecast")
async def ml_forecast():
    return {"forecasts": _data["forecasts"] or {}}

@app.get("/api/ml/clusters")
async def ml_clusters():
    return _data["cluster_result"] or {"states": [], "centroids": []}

@app.get("/api/ml/anomalies")
async def ml_anomalies():
    return _data["anomaly_result"] or {"states": [], "anomaly_details": []}

@app.get("/api/ml/roi")
async def ml_roi():
    return _data["roi_result"] or {"roi_scores": [], "feature_importance": {}}

@app.get("/api/equity/gaps")
async def equity_gaps():
    df = _data["master_df"]
    if df is None:
        return {"gap_matrix": []}
    pct_cols = [c for c in df.columns if c.endswith("_allocation_pct")]
    avg = {c: float(df[c].mean()) for c in pct_cols}
    matrix = []
    for _, row in df.iterrows():
        g = {"state": row["state"], "hdi_score": round(float(row.get("hdi_score", 0)), 3)}
        td = 0
        for c in pct_cols:
            s = c.replace("_allocation_pct", "")
            gap = round(float(row[c]) - avg[c], 2)
            g[s] = gap
            td += abs(gap)
        g["total_deviation"] = round(td, 2)
        matrix.append(g)
    matrix.sort(key=lambda x: -x["total_deviation"])
    return {"national_averages": {c.replace("_allocation_pct", ""): round(v, 2) for c, v in avg.items()}, "gap_matrix": matrix}


# ===================== EXPLAIN ENDPOINT =====================

class ExplainRequest(BaseModel):
    context: str = "general"
    allocations: Optional[Dict[str, float]] = None
    state_name: Optional[str] = None
    total_budget: Optional[float] = None
    roi_score: Optional[float] = None

@app.post("/api/explain")
async def explain(req: ExplainRequest):
    if req.allocations:
        sorted_s = sorted(req.allocations.items(), key=lambda x: -x[1])
        top = ", ".join(s.replace("_", " ").title() for s, _ in sorted_s[:3])
        bottom = ", ".join(s.replace("_", " ").title() for s, _ in sorted_s[-3:])
        total = sum(v for _, v in sorted_s)
        text = (
            f"The proposed allocation prioritizes {top} -- these sectors receive the largest shares of the "
            f"Rs {total:,.0f} crore budget, reflecting their high ROI scores and alignment with citizen priorities.\n\n"
            f"Sectors like {bottom} receive comparatively lower allocations. This is typical when optimization "
            f"weights favor human development outcomes (health, education, poverty reduction) over administrative spending.\n\n"
            f"The equity constraint ensures social sectors (health, education, rural development, social welfare) "
            f"collectively receive at least 25% of the total budget."
        )
    elif req.state_name:
        text = (
            f"{req.state_name}'s budget reflects a mix of development priorities. States with similar HDI profiles "
            f"tend to allocate more toward education and health infrastructure, while maintaining fiscal prudence.\n\n"
            f"Key areas for improvement include increasing outcome-per-rupee efficiency in sectors where allocation "
            f"is high but outcome scores lag behind national averages."
        )
    else:
        text = (
            "India's Union Budget allocation follows established patterns where defence, infrastructure, and social "
            "welfare dominate spending. The optimization engine recommends re-balancing toward high-ROI sectors."
        )
    return {"explanation": text, "source": "template"}


# ===================== ROOT =====================

@app.get("/")
async def root():
    return {"name": "CivicSight API", "version": "1.0.0", "docs": "/docs"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "data_loaded": _data["master_df"] is not None,
        "models_loaded": {k: _data[k] is not None for k in ["cluster_result", "roi_result", "anomaly_result", "forecasts"]},
    }
