"""
Budget Allocation Optimizer — PuLP Linear Programming Engine.
Maximizes weighted ROI across 11 sectors subject to budget and equity constraints.
"""

from typing import Dict, Optional


SECTORS = [
    "health", "education", "agriculture", "infrastructure",
    "rural_dev", "defence", "social_welfare", "water",
    "energy", "urban", "admin"
]

# Default ROI scores (can be overridden by ML model predictions)
DEFAULT_ROI = {
    "health": 0.85, "education": 0.90, "agriculture": 0.70,
    "infrastructure": 0.75, "rural_dev": 0.72, "defence": 0.40,
    "social_welfare": 0.78, "water": 0.65, "energy": 0.60,
    "urban": 0.55, "admin": 0.30,
}


def run_optimizer(
    total: float,
    roi_scores: Optional[Dict[str, float]] = None,
    weights: Optional[Dict[str, float]] = None,
    constraints: Optional[Dict[str, float]] = None,
) -> dict:
    """
    Run LP optimization for budget allocation.

    Args:
        total: Total budget in crore
        roi_scores: ROI score per sector (0-1)
        weights: User priority weights per sector (default 1.0)
        constraints: Dict with keys like "health_min", "health_max" (in crore)

    Returns:
        dict with status, allocations, total_roi, breakdown
    """
    try:
        import pulp
    except ImportError:
        # Fallback: simple weighted proportional allocation
        return _fallback_optimizer(total, roi_scores, weights, constraints)

    if roi_scores is None:
        roi_scores = DEFAULT_ROI.copy()
    if weights is None:
        weights = {s: 1.0 for s in SECTORS}
    if constraints is None:
        constraints = {}

    prob = pulp.LpProblem("BudgetAllocation", pulp.LpMaximize)
    sectors = list(roi_scores.keys())

    # Decision variables
    x = {s: pulp.LpVariable(f"x_{s}", lowBound=0) for s in sectors}

    # Objective: maximize weighted ROI
    prob += pulp.lpSum(
        weights.get(s, 1.0) * roi_scores.get(s, 0.5) * x[s] for s in sectors
    )

    # Budget constraint: allocations must sum to total
    prob += pulp.lpSum(x[s] for s in sectors) == total

    # Sector bounds
    for s in sectors:
        mn = constraints.get(f"{s}_min", total * 0.01)  # min 1%
        mx = constraints.get(f"{s}_max", total * 0.40)  # max 40%
        prob += x[s] >= mn
        prob += x[s] <= mx

    # Equity constraint: social sectors >= 25%
    social = ["health", "education", "rural_dev", "social_welfare"]
    prob += pulp.lpSum(x[s] for s in social if s in x) >= total * 0.25

    # Fiscal constraint: defence + admin <= 15%
    if "defence" in x and "admin" in x:
        prob += x["defence"] + x["admin"] <= total * 0.15

    # Solve
    prob.solve(pulp.PULP_CBC_CMD(msg=0))

    allocations = {}
    for s in sectors:
        val = pulp.value(x[s])
        allocations[s] = round(val, 2) if val else 0

    actual_total = sum(allocations.values())

    return {
        "status": pulp.LpStatus[prob.status],
        "allocations": allocations,
        "total_roi": round(pulp.value(prob.objective) / total if total > 0 else 0, 4),
        "total_allocated": round(actual_total, 2),
        "breakdown": {
            s: {
                "amount_crore": allocations[s],
                "percentage": round(allocations[s] / total * 100, 2) if total > 0 else 0,
                "roi_score": roi_scores.get(s, 0),
                "weight": weights.get(s, 1.0),
            }
            for s in sectors
        },
    }


def _fallback_optimizer(total, roi_scores, weights, constraints):
    """Proportional allocation fallback when PuLP is not available."""
    if roi_scores is None:
        roi_scores = DEFAULT_ROI.copy()
    if weights is None:
        weights = {s: 1.0 for s in SECTORS}

    # Weight by ROI * priority
    raw_weights = {s: roi_scores.get(s, 0.5) * weights.get(s, 1.0) for s in SECTORS}
    total_weight = sum(raw_weights.values())

    allocations = {}
    for s in SECTORS:
        pct = raw_weights[s] / total_weight if total_weight > 0 else 1 / len(SECTORS)
        allocations[s] = round(total * pct, 2)

    return {
        "status": "Optimal (fallback)",
        "allocations": allocations,
        "total_roi": round(sum(roi_scores.get(s, 0) * allocations[s] for s in SECTORS) / total if total > 0 else 0, 4),
        "total_allocated": round(sum(allocations.values()), 2),
        "breakdown": {
            s: {
                "amount_crore": allocations[s],
                "percentage": round(allocations[s] / total * 100, 2) if total > 0 else 0,
                "roi_score": roi_scores.get(s, 0),
                "weight": weights.get(s, 1.0),
            }
            for s in SECTORS
        },
    }


def run_shock_simulation(
    total: float,
    inflation_pct: float = 0,
    gdp_change_pct: float = 0,
    roi_scores: Optional[Dict[str, float]] = None,
    weights: Optional[Dict[str, float]] = None,
) -> dict:
    """
    Simulate economic shock and return adjusted optimal allocation.

    Shocks affect:
    - Budget total: reduced by inflation impact
    - ROI scores: shifted by GDP changes
    """
    if roi_scores is None:
        roi_scores = DEFAULT_ROI.copy()

    # Adjust total for inflation
    adjusted_total = total * (1 - inflation_pct / 100)

    # Adjust ROI scores for GDP changes
    adjusted_roi = {}
    for s, score in roi_scores.items():
        # GDP growth boosts productive sectors more
        if s in ("infrastructure", "energy", "urban"):
            adjusted_roi[s] = max(0, min(1, score + gdp_change_pct / 100))
        elif s in ("social_welfare", "rural_dev"):
            # Social sectors become more important during downturns
            adjusted_roi[s] = max(0, min(1, score - gdp_change_pct / 200))
        else:
            adjusted_roi[s] = score

    result = run_optimizer(adjusted_total, adjusted_roi, weights)
    result["shock_params"] = {
        "inflation_pct": inflation_pct,
        "gdp_change_pct": gdp_change_pct,
        "original_total": total,
        "adjusted_total": round(adjusted_total, 2),
    }
    return result
