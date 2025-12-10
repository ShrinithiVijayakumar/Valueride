"""
VALUE RIDE - Spark Backend Application
Integrates with Spark Web UI at localhost:4040
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
import pandas as pd
import json
import time
from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import os

# Initialize Flask app for API endpoints
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Global variables
spark = None
cars_df = None
filtered_df = None
job_history = []

def initialize_spark():
    """Initialize Spark Session with Web UI enabled"""
    global spark
    
    spark = SparkSession.builder \
        .appName("VALUE_RIDE_DataProcessor") \
        .config("spark.ui.enabled", "true") \
        .config("spark.ui.port", "4040") \
        .config("spark.sql.adaptive.enabled", "true") \
        .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
        .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer") \
        .config("spark.executor.memory", "2g") \
        .config("spark.driver.memory", "1g") \
        .getOrCreate()
    
    # Set log level to reduce noise
    spark.sparkContext.setLogLevel("WARN")
    
    # Get the actual Web UI URL
    ui_url = spark.sparkContext.uiWebUrl or "http://localhost:4040"
    
    print(f"✅ Spark Session initialized successfully!")
    print(f"🔥 Spark Web UI available at: {ui_url}")
    print(f"📊 Application Name: {spark.sparkContext.appName}")
    
    return spark

def load_car_data():
    """Load and process car dataset with Spark"""
    global cars_df, spark
    
    try:
        print("📁 Loading car dataset...")
        
        # Define schema for better performance
        schema = StructType([
            StructField("Brand", StringType(), True),
            StructField("model", StringType(), True),
            StructField("Year", IntegerType(), True),
            StructField("Age", IntegerType(), True),
            StructField("kmDriven", StringType(), True),
            StructField("Transmission", StringType(), True),
            StructField("Owner", StringType(), True),
            StructField("FuelType", StringType(), True),
            StructField("PostedDate", StringType(), True),
            StructField("AdditionInfo", StringType(), True),
            StructField("AskPrice", StringType(), True)
        ])
        
        # Load CSV with proper handling
        cars_df = spark.read \
            .option("header", "true") \
            .option("inferSchema", "false") \
            .schema(schema) \
            .csv("used_car_dataset_cleaned.csv")
        
        # Cache the DataFrame for better performance
        cars_df.cache()
        
        # Clean and transform data
        cars_df = cars_df.withColumn(
            "normalizedPrice", 
            regexp_replace(col("AskPrice"), "[₹,\\s]", "").cast("int")
        ).withColumn(
            "normalizedKM",
            regexp_replace(regexp_replace(col("kmDriven"), "[,\\s]", ""), "km.*", "").cast("int")
        ).withColumn(
            "displayName",
            concat_ws(" ", col("Brand"), col("model"))
        ).withColumn(
            "id",
            monotonically_increasing_id()
        )
        
        count = cars_df.count()
        print(f"✅ Loaded {count} cars successfully!")
        
        # Add job to history
        add_job_history("CSV Data Loading", "SUCCEEDED", f"Loaded {count} records")
        
        return cars_df
        
    except Exception as e:
        print(f"❌ Error loading data: {str(e)}")
        add_job_history("CSV Data Loading", "FAILED", str(e))
        return None

def add_job_history(job_name, status, details=""):
    """Add job to history tracking"""
    global job_history
    
    job = {
        "id": len(job_history) + 1,
        "name": job_name,
        "status": status,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "details": details,
        "duration": "0.0s"  # Will be updated if needed
    }
    
    job_history.insert(0, job)
    print(f"📝 Job recorded: {job_name} - {status}")

def filter_cars(filters):
    """Apply filters to car dataset using Spark"""
    global cars_df, filtered_df, spark
    
    if cars_df is None:
        return None
    
    try:
        print("🔍 Applying filters with Spark...")
        start_time = time.time()
        
        # Start with original DataFrame
        filtered_df = cars_df
        
        # Apply text search
        if filters.get('search'):
            search_term = filters['search'].lower()
            filtered_df = filtered_df.filter(
                lower(col("displayName")).contains(search_term)
            )
        
        # Apply fuel type filter
        if filters.get('fuelType'):
            filtered_df = filtered_df.filter(col("FuelType") == filters['fuelType'])
        
        # Apply transmission filter
        if filters.get('transmission'):
            filtered_df = filtered_df.filter(col("Transmission") == filters['transmission'])
        
        # Apply price range
        if filters.get('priceMin') or filters.get('priceMax'):
            price_min = filters.get('priceMin', 0)
            price_max = filters.get('priceMax', 999999999)
            
            if filters.get('approximate', False):
                # Add 10% tolerance for approximate search
                tolerance = 0.1
                price_min = price_min * (1 - tolerance)
                price_max = price_max * (1 + tolerance)
            
            filtered_df = filtered_df.filter(
                (col("normalizedPrice") >= price_min) & 
                (col("normalizedPrice") <= price_max)
            )
        
        # Apply year range
        if filters.get('yearMin') or filters.get('yearMax'):
            year_min = filters.get('yearMin', 1900)
            year_max = filters.get('yearMax', 2030)
            
            if filters.get('approximate', False):
                # Add 2 years tolerance
                year_min = year_min - 2
                year_max = year_max + 2
            
            filtered_df = filtered_df.filter(
                (col("Year") >= year_min) & 
                (col("Year") <= year_max)
            )
        
        # Apply KM range
        if filters.get('kmMin') or filters.get('kmMax'):
            km_min = filters.get('kmMin', 0)
            km_max = filters.get('kmMax', 9999999)
            
            if filters.get('approximate', False):
                # Add 10% tolerance
                tolerance = 0.1
                km_min = km_min * (1 - tolerance)
                km_max = km_max * (1 + tolerance)
            
            filtered_df = filtered_df.filter(
                (col("normalizedKM") >= km_min) & 
                (col("normalizedKM") <= km_max)
            )
        
        # Cache filtered result
        filtered_df.cache()
        
        # Get count to trigger execution
        count = filtered_df.count()
        duration = time.time() - start_time
        
        print(f"✅ Filtering complete! Found {count} cars in {duration:.2f}s")
        
        # Add job to history
        add_job_history(
            "Data Filtering Transform", 
            "SUCCEEDED", 
            f"Filtered to {count} records in {duration:.2f}s"
        )
        
        return filtered_df
        
    except Exception as e:
        print(f"❌ Error filtering data: {str(e)}")
        add_job_history("Data Filtering Transform", "FAILED", str(e))
        return None

# API Endpoints
@app.route('/api/spark/status', methods=['GET'])
def spark_status():
    """Get Spark application status"""
    if spark is None:
        return jsonify({
            "status": "disconnected",
            "webui_url": None,
            "app_name": None
        })
    
    # Get the actual Spark Web UI URL
    ui_url = spark.sparkContext.uiWebUrl
    if not ui_url:
        ui_url = "http://localhost:4041"  # Default fallback
    
    return jsonify({
        "status": "connected",
        "webui_url": ui_url,
        "app_name": spark.sparkContext.appName,
        "app_id": spark.sparkContext.applicationId,
        "master": spark.sparkContext.master,
        "version": spark.version
    })

@app.route('/api/cars/load', methods=['POST'])
def load_cars():
    """Load car data via API"""
    try:
        result = load_car_data()
        if result is not None:
            count = cars_df.count()
            return jsonify({
                "success": True,
                "count": count,
                "message": f"Loaded {count} cars successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to load data"
            }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/api/cars/filter', methods=['POST'])
def filter_cars_api():
    """Filter cars via API"""
    try:
        filters = request.json or {}
        result = filter_cars(filters)
        
        if result is not None:
            # Convert to pandas for JSON serialization
            pandas_df = result.toPandas()
            cars_list = pandas_df.to_dict('records')
            
            return jsonify({
                "success": True,
                "count": len(cars_list),
                "cars": cars_list[:100],  # Limit for performance
                "total_count": len(cars_list)
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to filter data"
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/api/spark/jobs', methods=['GET'])
def get_job_history():
    """Get Spark job history"""
    return jsonify({
        "jobs": job_history,
        "total": len(job_history)
    })

@app.route('/api/spark/metrics', methods=['GET'])
def get_metrics():
    """Get Spark metrics"""
    total_jobs = len(job_history)
    succeeded_jobs = len([j for j in job_history if j['status'] == 'SUCCEEDED'])
    failed_jobs = len([j for j in job_history if j['status'] == 'FAILED'])
    
    data_count = 0
    if cars_df is not None:
        try:
            data_count = cars_df.count()
        except:
            data_count = 0
    
    return jsonify({
        "total_jobs": total_jobs,
        "succeeded_jobs": succeeded_jobs,
        "failed_jobs": failed_jobs,
        "active_jobs": 0,  # Simplified for demo
        "data_processed": data_count
    })

@app.route('/api/visualization/data', methods=['POST'])
def get_visualization_data():
    """Get data for visualizations"""
    try:
        if filtered_df is None:
            return jsonify({
                "success": False,
                "message": "No filtered data available"
            }), 400
        
        # Get aggregated data for charts
        pandas_df = filtered_df.toPandas()
        
        # Price distribution
        price_ranges = [
            {"label": "Under 2L", "min": 0, "max": 200000},
            {"label": "2L-5L", "min": 200000, "max": 500000},
            {"label": "5L-10L", "min": 500000, "max": 1000000},
            {"label": "10L-20L", "min": 1000000, "max": 2000000},
            {"label": "20L+", "min": 2000000, "max": float('inf')}
        ]
        
        price_dist = []
        for range_info in price_ranges:
            count = len(pandas_df[
                (pandas_df['normalizedPrice'] >= range_info['min']) & 
                (pandas_df['normalizedPrice'] < range_info['max'])
            ])
            price_dist.append({"label": range_info['label'], "count": count})
        
        # Fuel type distribution
        fuel_dist = pandas_df['FuelType'].value_counts().to_dict()
        
        # Year vs Price data (sample for performance)
        year_price_data = pandas_df[['Year', 'normalizedPrice']].dropna().to_dict('records')
        
        return jsonify({
            "success": True,
            "price_distribution": price_dist,
            "fuel_distribution": fuel_dist,
            "year_price_data": year_price_data[:500]  # Limit for performance
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

def run_flask_app():
    """Run Flask app in separate thread"""
    print("🚀 Starting Flask API server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)

if __name__ == "__main__":
    print("🎯 VALUE RIDE - Spark Backend Starting...")
    print("=" * 50)
    
    # Initialize Spark
    spark = initialize_spark()
    
    # Load initial data
    cars_df = load_car_data()
    
    # Start Flask API in background thread
    flask_thread = threading.Thread(target=run_flask_app)
    flask_thread.daemon = True
    flask_thread.start()
    
    print("\n" + "=" * 50)
    print("🎉 VALUE RIDE Spark Backend Ready!")
    
    # Get actual Spark Web UI URL
    ui_url = spark.sparkContext.uiWebUrl or "http://localhost:4040"
    print(f"🔥 Spark Web UI: {ui_url}")
    print("🌐 API Server: http://localhost:5000")
    print("📊 Website: http://localhost:8000")
    print("=" * 50)
    
    try:
        # Keep the main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down VALUE RIDE Spark Backend...")
        spark.stop()
        print("✅ Spark context stopped. Goodbye!")