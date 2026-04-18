"""
Time-Series Forecasting using simple trend extrapolation.
Falls back from Prophet (complex install) to a numpy-based linear trend model.
"""

import numpy as np
import pandas as pd
import joblib
import os


class SimpleForecaster:
    """Linear trend forecaster per sector — lightweight Prophet alternative."""

    def __init__(self):
        self.models = {}  # sector -> (slope, intercept, residual_std)

    def fit(self, df: pd.DataFrame, sector_col: str, year_col: str = "year"):
        """Fit a linear trend for each sector allocation."""
        # Aggregate across all states per year
        yearly = df.groupby(year_col)[sector_col].mean().reset_index()
        years = yearly[year_col].values.astype(float)
        values = yearly[sector_col].values.astype(float)

        if len(years) < 2:
            self.models[sector_col] = (0, values.mean() if len(values) else 0, 1.0)
            return

        # Fit linear regression
        coeffs = np.polyfit(years, values, 1)
        predicted = np.polyval(coeffs, years)
        residuals = values - predicted
        residual_std = np.std(residuals) if len(residuals) > 1 else 1.0

        self.models[sector_col] = (coeffs[0], coeffs[1], residual_std)

    def predict(self, sector_col: str, future_years: list, ci_width: float = 0.80):
        """Predict future values with confidence intervals."""
        if sector_col not in self.models:
            return []

        slope, intercept, std = self.models[sector_col]
        z = 1.28  # ~80% CI

        results = []
        for year in future_years:
            yhat = slope * year + intercept
            # Widen CI for further-out predictions
            years_ahead = year - 2024
            uncertainty = std * z * (1 + 0.1 * years_ahead)
            results.append({
                "year": int(year),
                "yhat": round(float(yhat), 2),
                "yhat_lower": round(float(yhat - uncertainty), 2),
                "yhat_upper": round(float(yhat + uncertainty), 2),
            })
        return results


def train_forecasters(trends_df: pd.DataFrame, save_dir: str = None):
    """Train forecasters for all sector allocation columns."""
    sector_cols = [c for c in trends_df.columns if c.endswith("_allocation_crore")]

    forecasters = {}
    future_years = list(range(2025, 2030))

    for col in sector_cols:
        forecaster = SimpleForecaster()
        forecaster.fit(trends_df, col, "year")
        forecasters[col] = forecaster

    if save_dir:
        os.makedirs(save_dir, exist_ok=True)
        joblib.dump(forecasters, os.path.join(save_dir, "forecasters.pkl"))
        print(f"  [OK] Saved {len(forecasters)} forecasters to {save_dir}/forecasters.pkl")

    # Generate forecasts
    all_forecasts = {}
    for col, fc in forecasters.items():
        sector_name = col.replace("_allocation_crore", "")
        all_forecasts[sector_name] = fc.predict(col, future_years)

    return forecasters, all_forecasts


def load_forecasters(model_dir: str):
    """Load pre-trained forecasters."""
    path = os.path.join(model_dir, "forecasters.pkl")
    if os.path.exists(path):
        return joblib.load(path)
    return None
