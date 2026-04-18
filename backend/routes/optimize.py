"""
Optimization API Routes — /api/optimize, /api/shock
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Optional, List
from backend.optimizer import run_optimizer, run_shock_simulation, DEFAULT_ROI

router = APIRouter(tags=["optimize"])


class OptimizeRequest(BaseModel):
    total: float = 4765000  # Default: Union Budget 2024-25 in crore
    roi_scores: Optional[Dict[str, float]] = None
    weights: Optional[Dict[str, float]] = None
    constraints: Optional[Dict[str, float]] = None


class ScenarioRequest(BaseModel):
    name: str = "Scenario"
    total: float = 4765000
    weights: Optional[Dict[str, float]] = None
    constraints: Optional[Dict[str, float]] = None
    inflation_pct: float = 0
    gdp_change_pct: float = 0


class BatchScenarioRequest(BaseModel):
    scenarios: List[ScenarioRequest]


class ShockRequest(BaseModel):
    total: float = 4765000
    inflation_pct: float = 0
    gdp_change_pct: float = 0
    weights: Optional[Dict[str, float]] = None


def init_routes(roi_scores=None):
    """Initialize routes with optional ML-derived ROI scores."""
    _roi_scores = roi_scores or DEFAULT_ROI

    @router.post("/api/optimize")
    async def optimize(request: OptimizeRequest):
        """Run LP optimizer with given constraints and weights."""
        scores = request.roi_scores or _roi_scores
        result = run_optimizer(
            total=request.total,
            roi_scores=scores,
            weights=request.weights,
            constraints=request.constraints,
        )
        return result

    @router.post("/api/optimize/scenarios")
    async def optimize_scenarios(request: BatchScenarioRequest):
        """Batch optimize multiple scenarios for comparison."""
        results = []
        for scenario in request.scenarios:
            if scenario.inflation_pct != 0 or scenario.gdp_change_pct != 0:
                result = run_shock_simulation(
                    total=scenario.total,
                    inflation_pct=scenario.inflation_pct,
                    gdp_change_pct=scenario.gdp_change_pct,
                    roi_scores=_roi_scores,
                    weights=scenario.weights,
                )
            else:
                result = run_optimizer(
                    total=scenario.total,
                    roi_scores=_roi_scores,
                    weights=scenario.weights,
                    constraints=scenario.constraints,
                )
            result["scenario_name"] = scenario.name
            results.append(result)

        return {"scenarios": results}

    @router.post("/api/shock")
    async def shock_simulation(request: ShockRequest):
        """Simulate economic shock and return adjusted allocation."""
        result = run_shock_simulation(
            total=request.total,
            inflation_pct=request.inflation_pct,
            gdp_change_pct=request.gdp_change_pct,
            roi_scores=_roi_scores,
            weights=request.weights,
        )
        return result

    return router
