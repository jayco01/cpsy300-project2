import io
import json
import os
import time
import azure.functions as func
from azure.storage.blob import BlobServiceClient
import pandas as pd

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

CONN_STR = os.environ.get("AZURE_STORAGE_CONNECTION_STRING")
CONTAINER = os.environ.get("CONTAINER_NAME", "datasets")
BLOB_CANDIDATES = ["ALL_DIETS.csv", "All_Diets.csv"]

NUMERIC_COLS = ["Protein(g)", "Carbs(g)", "Fat(g)"]
USE_COLS = ["Diet_type", "Recipe_name", "Cuisine_type"] + NUMERIC_COLS


def load_dataset() -> pd.DataFrame:
    """Download and clean the diet dataset from Azure Blob Storage."""
    if not CONN_STR:
        raise ValueError("AZURE_STORAGE_CONNECTION_STRING environment variable is not configured.")

    blob_service_client = BlobServiceClient.from_connection_string(CONN_STR)
    container_client = blob_service_client.get_container_client(CONTAINER)

    # Handle case-sensitivity gracefully
    blob_client = None
    for name in BLOB_CANDIDATES:
        try:
            candidate = container_client.get_blob_client(name)
            if candidate.exists():
                blob_client = candidate
                break
        except Exception:
            continue

    if blob_client is None:
        blob_client = container_client.get_blob_client(BLOB_CANDIDATES[0])

    stream = blob_client.download_blob().readall()
    df = pd.read_csv(io.BytesIO(stream), usecols=lambda c: c in USE_COLS)

    # Impute missing values with column means
    for col in NUMERIC_COLS:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].mean())

    return df


@app.route(route="nutritional_insights", methods=["GET"])
def nutritional_insights(req: func.HttpRequest) -> func.HttpResponse:
    """HTTP trigger endpoint providing nutritional aggregations and charts data."""
    start_time = time.time()
    diet_filter = req.params.get("diet_type", "all").strip().lower()

    try:
        df = load_dataset()

        available_diets = sorted([str(d) for d in df["Diet_type"].dropna().unique()])

        # Apply filter if selected
        if diet_filter and diet_filter != "all":
            df_filtered = df[df["Diet_type"].str.lower() == diet_filter]
            if df_filtered.empty:
                df_filtered = df
        else:
            df_filtered = df

        # 1. Average Macronutrients by Diet Type (Bar Chart)
        avg_macros = (
            df_filtered.groupby("Diet_type", observed=True)[NUMERIC_COLS]
            .mean()
            .round(2)
            .reset_index()
            .to_dict(orient="records")
        )

        # 2. Recipe Distribution by Diet Type (Pie Chart)
        diet_distribution = df["Diet_type"].value_counts().to_dict()

        # 3. Scatter Plot Data (Protein vs Carbs vs Fat, top 100 items)
        scatter_sample = (
            df_filtered[["Recipe_name", "Diet_type", "Protein(g)", "Carbs(g)", "Fat(g)"]]
            .head(100)
            .round(2)
            .to_dict(orient="records")
        )

        # 4. Correlation Matrix (Heatmap)
        corr_df = df_filtered[NUMERIC_COLS].corr().round(2)
        correlation_matrix = {
            "columns": NUMERIC_COLS,
            "values": corr_df.values.tolist(),
        }

        # 5. Top Protein Recipes
        top_recipes = (
            df_filtered.sort_values("Protein(g)", ascending=False)
            .head(5)[["Recipe_name", "Diet_type", "Protein(g)", "Carbs(g)", "Fat(g)"]]
            .round(2)
            .to_dict(orient="records")
        )

        execution_time_ms = round((time.time() - start_time) * 1000, 2)

        response_data = {
            "status": "success",
            "metadata": {
                "execution_time_ms": execution_time_ms,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
                "total_records": len(df),
                "filtered_records": len(df_filtered),
                "active_filter": diet_filter,
            },
            "available_diets": available_diets,
            "avg_macros": avg_macros,
            "diet_distribution": diet_distribution,
            "scatter_data": scatter_sample,
            "correlation_matrix": correlation_matrix,
            "top_recipes": top_recipes,
        }

        return func.HttpResponse(
            body=json.dumps(response_data),
            status_code=200,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        )

    except Exception as e:
        execution_time_ms = round((time.time() - start_time) * 1000, 2)
        error_data = {
            "status": "error",
            "error": str(e),
            "metadata": {
                "execution_time_ms": execution_time_ms,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            },
        }
        return func.HttpResponse(
            body=json.dumps(error_data),
            status_code=500,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"},
        )
