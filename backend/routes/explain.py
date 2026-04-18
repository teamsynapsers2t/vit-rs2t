"""
Explain API Route — /api/explain
Generates natural language explanations of budget allocations.
Uses template-based fallback when Claude API key is not available.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Optional
import os

router = APIRouter(tags=["explain"])


class ExplainRequest(BaseModel):
    context: str = "general"
    allocations: Optional[Dict[str, float]] = None
    state_name: Optional[str] = None
    total_budget: Optional[float] = None
    roi_score: Optional[float] = None


def init_routes():
    """Initialize explain routes."""

    @router.post("/api/explain")
    async def explain_allocation(request: ExplainRequest):
        """Generate AI explanation of allocation decisions."""
        api_key = os.environ.get("ANTHROPIC_API_KEY")

        if api_key:
            try:
                return await _claude_explain(api_key, request)
            except Exception as e:
                return _template_explain(request, error=str(e))
        else:
            return _template_explain(request)

    return router


async def _claude_explain(api_key: str, request: ExplainRequest):
    """Call Claude API for natural language explanation."""
    try:
        import httpx

        prompt = _build_prompt(request)

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 500,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )

            if response.status_code == 200:
                data = response.json()
                text = data["content"][0]["text"]
                return {"explanation": text, "source": "claude-api"}
            else:
                return _template_explain(request, error=f"API returned {response.status_code}")
    except Exception as e:
        return _template_explain(request, error=str(e))


def _build_prompt(request: ExplainRequest):
    """Build prompt for Claude API."""
    parts = ["You are an expert Indian public finance analyst. Explain the following budget allocation in 2-3 clear paragraphs for a citizen audience."]

    if request.state_name:
        parts.append(f"\nState: {request.state_name}")
    if request.total_budget:
        parts.append(f"Total Budget: ₹{request.total_budget:,.0f} crore")
    if request.roi_score:
        parts.append(f"Composite ROI Score: {request.roi_score}/100")
    if request.allocations:
        parts.append("\nSector Allocations:")
        for sector, amount in sorted(request.allocations.items(), key=lambda x: -x[1]):
            parts.append(f"  - {sector.replace('_', ' ').title()}: ₹{amount:,.0f} crore")

    parts.append("\nExplain: Why is this allocation structured this way? What trade-offs were made? What could be improved?")
    return "\n".join(parts)


def _template_explain(request: ExplainRequest, error: str = None):
    """Template-based fallback explanation."""
    if request.allocations:
        sorted_sectors = sorted(request.allocations.items(), key=lambda x: -x[1])
        top_3 = sorted_sectors[:3]
        bottom_3 = sorted_sectors[-3:]

        top_names = ", ".join(s.replace("_", " ").title() for s, _ in top_3)
        bottom_names = ", ".join(s.replace("_", " ").title() for s, _ in bottom_3)

        total = sum(v for _, v in sorted_sectors)

        explanation = (
            f"The proposed allocation prioritizes {top_names} — these sectors receive "
            f"the largest shares of the ₹{total:,.0f} crore budget, reflecting their high ROI scores "
            f"and alignment with citizen priorities. "
            f"\n\n"
            f"Sectors like {bottom_names} receive comparatively lower allocations. "
            f"This is typical when optimization weights favor human development outcomes "
            f"(health, education, poverty reduction) over administrative and discretionary spending. "
            f"\n\n"
            f"The equity constraint ensures that social sectors (health, education, rural development, "
            f"social welfare) collectively receive at least 25% of the total budget, preventing "
            f"under-investment in critical public services."
        )
    elif request.state_name:
        explanation = (
            f"{request.state_name}'s budget reflects a mix of development priorities. "
            f"States with similar HDI profiles tend to allocate more toward education and health infrastructure, "
            f"while maintaining fiscal prudence through controlled deficit spending. "
            f"\n\n"
            f"Key areas for improvement include increasing outcome-per-rupee efficiency in sectors "
            f"where allocation is high but outcome scores lag behind national averages. "
            f"Cross-state comparisons reveal opportunities for targeted intervention in sectors "
            f"with the highest marginal returns."
        )
    else:
        explanation = (
            "India's Union Budget allocation follows established patterns where defence, infrastructure, "
            "and social welfare dominate spending. The optimization engine recommends re-balancing "
            "toward high-ROI sectors like health and education, where marginal spending improvements "
            "yield the greatest developmental outcomes. "
            "\n\n"
            "The model ensures fiscal responsibility by constraining total allocation and maintaining "
            "minimum thresholds for essential services."
        )

    result = {"explanation": explanation, "source": "template"}
    if error:
        result["note"] = f"Claude API unavailable ({error}). Using template response."
    return result
