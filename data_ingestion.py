"""
CivicSight -- Data Ingestion & API Integration
Fetches real data from data.gov.in APIs with fallback to mock data.

Data Sources:
  1. data.gov.in  -- NFHS-5 health indicators, IMR, state expenditure
  2. Mock generator -- Realistic budget allocation data (fallback)

Outputs:
  - backend/data/processed/master_optimization_table.csv  (31 rows x 34 cols)
  - backend/data/processed/historical_trends.csv          (31 states x 30 yrs)
"""

import os
import random
import math
import csv
import json

random.seed(42)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "backend", "data", "processed")

# ============================================================
# data.gov.in API Configuration
# ============================================================
# Get your API key: https://data.gov.in -> Register -> Dashboard -> Generate Key
# Save it in .env file as DATAGOV_API_KEY=your-key-here

# Resource IDs for specific datasets on data.gov.in
# To find more: search on data.gov.in -> click dataset -> click "API" tab -> copy resource_id from URL
DATAGOV_RESOURCES = {
    # NFHS-5 State Factsheet (health, nutrition, demographic indicators)
    "nfhs5": "7c568619-b9b4-40bb-b563-68c28c27a6c1",

    # State/UT-wise Infant Mortality Rate (2013-2017)
    "imr": "06df7220-4440-4633-98ee-f6bdb8287440",

    # Add more resource IDs here as you find them on data.gov.in:
    # Search "state wise expenditure" -> click result -> click API tab -> copy resource_id
    # "budget_expenditure": "paste-resource-id-here",
    # "literacy_census":    "paste-resource-id-here",
    # "poverty_bpl":        "paste-resource-id-here",
    # "fiscal_deficit":     "paste-resource-id-here",
}


def load_api_key():
    """Load API key from .env file or environment."""
    # Try .env file first
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("DATAGOV_API_KEY=") and "paste" not in line:
                    return line.split("=", 1)[1].strip()
    # Try environment variable
    return os.environ.get("DATAGOV_API_KEY")


def fetch_datagov_resource(resource_id, api_key, limit=500):
    """Fetch data from data.gov.in API.

    API Pattern: https://api.data.gov.in/resource/{resource_id}?api-key={key}&format=json&limit={n}
    """
    try:
        import requests
    except ImportError:
        print("    [WARN] 'requests' not installed. Run: pip install requests")
        return None

    url = f"https://api.data.gov.in/resource/{resource_id}"
    params = {
        "api-key": api_key,
        "format": "json",
        "limit": limit,
        "offset": 0,
    }

    try:
        print(f"    Fetching {url[:60]}...")
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        records = data.get("records", [])
        print(f"    [OK] Got {len(records)} records (total: {data.get('total', '?')})")
        return records
    except Exception as e:
        print(f"    [ERR] API call failed: {e}")
        return None


def fetch_all_api_data(api_key):
    """Fetch all available datasets from data.gov.in."""
    results = {}
    for name, resource_id in DATAGOV_RESOURCES.items():
        if resource_id and "paste" not in resource_id:
            print(f"  Fetching '{name}' dataset...")
            records = fetch_datagov_resource(resource_id, api_key)
            if records:
                results[name] = records
                # Save raw API response for debugging
                raw_dir = os.path.join(OUTPUT_DIR, "raw_api")
                os.makedirs(raw_dir, exist_ok=True)
                with open(os.path.join(raw_dir, f"{name}.json"), "w") as f:
                    json.dump(records, f, indent=2)
        else:
            print(f"  [SKIP] '{name}' -- no resource_id configured")
    return results


def enrich_with_api_data(master_rows, api_data):
    """Merge real API data into mock master table where available."""
    if not api_data:
        return master_rows

    # Build lookup by state name (lowercase)
    state_lookup = {row["state"].lower(): row for row in master_rows}

    # --- Merge NFHS-5 data (health indicators) ---
    if "nfhs5" in api_data:
        print("  Merging NFHS-5 health indicators...")
        merged = 0
        # NFHS-5 uses 'states_uts' for state name and 'area' for Urban/Rural/Total
        # We only want 'Total' rows
        for record in api_data["nfhs5"]:
            area = str(record.get("area", "")).strip()
            if area != "Total":
                continue

            state_name = str(record.get("states_uts", "")).strip()
            if not state_name or state_name == "India":
                continue

            key = state_name.lower()
            if key not in state_lookup:
                continue

            row = state_lookup[key]
            updated = False

            # IMR from NFHS-5
            imr_field = "infant_mortality_rate__per_1000_live_births_"
            if imr_field in record and record[imr_field] not in (None, "", "*", "NA"):
                try:
                    val = float(str(record[imr_field]).replace("-", ""))
                    if val > 0:
                        row["infant_mortality_rate"] = round(val, 1)
                        updated = True
                except (ValueError, TypeError):
                    pass

            # Literacy from NFHS-5 (women 15-49 who are literate)
            lit_field = "_women__age_15_49__who_are_literate4____"
            if lit_field in record and record[lit_field] not in (None, "", "*", "NA"):
                try:
                    val = float(str(record[lit_field]))
                    if val > 0:
                        row["literacy_rate_pct"] = round(val, 1)
                        updated = True
                except (ValueError, TypeError):
                    pass

            # Child stunting as a proxy for health outcome
            stunt_field = "children_under_5_years_who_are_stunted__height_for_age_18____"
            if stunt_field in record and record[stunt_field] not in (None, "", "*", "NA"):
                try:
                    stunting = float(str(record[stunt_field]).replace("-", ""))
                    # Lower stunting = better health outcome
                    row["health_outcome_score"] = round(min(100, max(10, 100 - stunting * 1.5)), 1)
                    updated = True
                except (ValueError, TypeError):
                    pass

            if updated:
                merged += 1
        print(f"    [OK] Merged {merged} NFHS-5 records")

    # --- Merge IMR data ---
    if "imr" in api_data:
        print("  Merging Infant Mortality Rate data...")
        merged = 0
        for record in api_data["imr"]:
            state_name = (
                record.get("state_ut", "") or
                record.get("state", "") or
                record.get("State/UT", "")
            ).strip()
            if not state_name:
                continue
            key = state_name.lower()
            if key in state_lookup:
                # Get the latest year's IMR
                for field in ["_2017", "2017", "imr_2017", "total_2017", "imr"]:
                    if field in record and record[field]:
                        try:
                            state_lookup[key]["infant_mortality_rate"] = round(float(record[field]), 1)
                            merged += 1
                            break
                        except (ValueError, TypeError):
                            pass
        print(f"    [OK] Merged {merged} IMR records")

    return master_rows


# ============================================================
# Mock Data Generator (Fallback)
# ============================================================

STATES = [
    ("Andhra Pradesh", 2.5e5, 0.65),
    ("Arunachal Pradesh", 3.2e4, 0.55),
    ("Assam", 1.2e5, 0.57),
    ("Bihar", 2.7e5, 0.52),
    ("Chhattisgarh", 1.1e5, 0.56),
    ("Goa", 2.5e4, 0.76),
    ("Gujarat", 3.0e5, 0.67),
    ("Haryana", 1.8e5, 0.70),
    ("Himachal Pradesh", 5.5e4, 0.72),
    ("Jharkhand", 1.0e5, 0.53),
    ("Karnataka", 3.1e5, 0.68),
    ("Kerala", 1.7e5, 0.78),
    ("Madhya Pradesh", 2.8e5, 0.55),
    ("Maharashtra", 6.5e5, 0.70),
    ("Manipur", 3.5e4, 0.56),
    ("Meghalaya", 2.0e4, 0.58),
    ("Mizoram", 1.5e4, 0.65),
    ("Nagaland", 2.2e4, 0.60),
    ("Odisha", 2.0e5, 0.57),
    ("Punjab", 1.9e5, 0.69),
    ("Rajasthan", 3.2e5, 0.60),
    ("Sikkim", 1.2e4, 0.66),
    ("Tamil Nadu", 3.5e5, 0.71),
    ("Telangana", 2.4e5, 0.67),
    ("Tripura", 2.8e4, 0.59),
    ("Uttar Pradesh", 7.0e5, 0.52),
    ("Uttarakhand", 6.5e4, 0.68),
    ("West Bengal", 3.3e5, 0.60),
    ("Delhi", 7.8e4, 0.75),
    ("Jammu & Kashmir", 1.1e5, 0.63),
    ("Puducherry", 1.0e4, 0.74),
]

SECTORS = [
    "health", "education", "agriculture", "infrastructure",
    "rural_dev", "defence", "social_welfare", "water",
    "energy", "urban", "admin"
]

SECTOR_RANGES = {
    "health":          (4.0, 9.0),
    "education":       (10.0, 18.0),
    "agriculture":     (5.0, 12.0),
    "infrastructure":  (8.0, 16.0),
    "rural_dev":       (5.0, 10.0),
    "defence":         (1.0, 4.0),
    "social_welfare":  (4.0, 9.0),
    "water":           (2.0, 5.0),
    "energy":          (4.0, 8.0),
    "urban":           (3.0, 7.0),
    "admin":           (5.0, 10.0),
}


def rand_range(lo, hi):
    return round(random.uniform(lo, hi), 2)


def normalize_pcts(pcts):
    total = sum(pcts.values())
    return {k: round(v / total * 100, 2) for k, v in pcts.items()}


def generate_master_table():
    """Generate master_optimization_table with mock data."""
    rows = []
    for state_name, base_budget, base_hdi in STATES:
        budget = round(base_budget * rand_range(0.9, 1.1))
        raw_pcts = {}
        for sector, (lo, hi) in SECTOR_RANGES.items():
            raw_pcts[sector] = rand_range(lo, hi)
        pcts = normalize_pcts(raw_pcts)
        allocs = {s: round(budget * pcts[s] / 100, 2) for s in SECTORS}

        hdi = round(base_hdi + rand_range(-0.05, 0.05), 3)
        hdi = max(0.40, min(0.90, hdi))
        imr = round(max(5, 60 - hdi * 60 + rand_range(-5, 5)), 1)
        literacy = round(min(99, hdi * 100 + rand_range(-5, 5)), 1)
        poverty = round(max(2, 50 - hdi * 50 + rand_range(-3, 3)), 1)
        fiscal_deficit = round(rand_range(1.5, 5.5), 2)
        health_outcome = round(min(100, hdi * 120 + rand_range(-10, 10)), 1)
        education_outcome = round(min(100, hdi * 115 + rand_range(-8, 8)), 1)
        composite_roi = round(
            (health_outcome * 0.3 + education_outcome * 0.3 +
             (100 - poverty) * 0.2 + literacy * 0.2) * rand_range(0.85, 1.15) / 1.1, 2)
        composite_roi = min(100, max(10, composite_roi))
        anomaly_flag = -1 if random.random() < 0.1 else 1
        cluster_id = random.randint(0, 4)

        row = {"state": state_name, "total_budget_crore": budget}
        for s in SECTORS:
            row[f"{s}_allocation_crore"] = allocs[s]
        for s in SECTORS:
            row[f"{s}_allocation_pct"] = pcts[s]
        row.update({
            "infant_mortality_rate": imr, "literacy_rate_pct": literacy,
            "poverty_headcount_pct": poverty, "hdi_score": hdi,
            "fiscal_deficit_pct_gsdp": fiscal_deficit, "composite_roi_score": composite_roi,
            "health_outcome_score": health_outcome, "education_outcome_score": education_outcome,
            "anomaly_flag": anomaly_flag, "cluster_id": cluster_id,
        })
        rows.append(row)
    return rows


def generate_historical_trends():
    """Generate 30-year historical trend data."""
    rows = []
    for state_name, base_budget, _ in STATES:
        for year in range(1995, 2025):
            year_idx = year - 1995
            growth_factor = (1 + 0.08) ** year_idx
            total = round(base_budget * 0.15 * growth_factor * rand_range(0.9, 1.1))
            raw_pcts = {}
            for sector, (lo, hi) in SECTOR_RANGES.items():
                shift = 0
                if sector in ("health", "education"):
                    shift = year_idx * 0.05
                elif sector == "admin":
                    shift = -year_idx * 0.03
                raw_pcts[sector] = max(1, rand_range(lo, hi) + shift)
            pcts = normalize_pcts(raw_pcts)
            row = {"state": state_name, "year": year, "total_budget_crore": total}
            for s in SECTORS:
                row[f"{s}_allocation_crore"] = round(total * pcts[s] / 100, 2)
                row[f"{s}_allocation_pct"] = pcts[s]
            rows.append(row)
    return rows


def write_csv(filepath, rows):
    if not rows:
        return
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    fieldnames = list(rows[0].keys())
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"  [OK] Written {len(rows)} rows to {filepath}")


def main():
    print("CivicSight -- Data Ingestion Pipeline")
    print("=" * 50)

    # Step 1: Generate base mock data
    print("\n[1/4] Generating mock master data...")
    master = generate_master_table()

    # Step 2: Try to enrich with real API data
    api_key = load_api_key()
    if api_key:
        print(f"\n[2/4] Fetching real data from data.gov.in (key: {api_key[:8]}...)")
        api_data = fetch_all_api_data(api_key)
        if api_data:
            print(f"\n[3/4] Merging API data into master table...")
            master = enrich_with_api_data(master, api_data)
        else:
            print("\n[3/4] No API data fetched, using mock data only")
    else:
        print("\n[2/4] No API key found in .env -- using mock data only")
        print("       To use real data: add DATAGOV_API_KEY=your-key to .env")
        print("[3/4] Skipped API merge")

    # Step 3: Write CSVs
    print("\n[4/4] Writing output files...")
    write_csv(os.path.join(OUTPUT_DIR, "master_optimization_table.csv"), master)

    trends = generate_historical_trends()
    write_csv(os.path.join(OUTPUT_DIR, "historical_trends.csv"), trends)

    print("\n[DONE] Data ingestion complete!")
    print(f"   Output directory: {OUTPUT_DIR}")
    if api_key:
        print(f"   Raw API responses saved to: {os.path.join(OUTPUT_DIR, 'raw_api')}")


if __name__ == "__main__":
    main()