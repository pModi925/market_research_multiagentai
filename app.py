#!/usr/bin/env python
"""
AI Market Research Generator - Flask Web Application
Integrates with CrewAI multi-agent system for market research report generation.
"""

import sys
import os
import json
import warnings
import threading
from datetime import datetime
from pathlib import Path

from flask import Flask, render_template, request, jsonify, send_file
from dotenv import load_dotenv

# Suppress pysbd warnings
warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

# Load environment variables — use absolute path so it works regardless of CWD
_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(_env_path)

# Add src to path so we can import the crew module
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from market_research_crew.crew import MarketResearchCrew

app = Flask(__name__)

# Store for reports and job status
reports_store = []
jobs = {}  # job_id -> { status, result, product_idea, created_at }

# Directory for saved reports
REPORTS_DIR = Path(__file__).parent / "report"
REPORTS_DIR.mkdir(exist_ok=True)

HISTORY_FILE = Path(__file__).parent / "report" / "history.json"


def load_history():
    """Load report history from disk."""
    global reports_store
    if HISTORY_FILE.exists():
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                reports_store = json.load(f)
        except (json.JSONDecodeError, IOError):
            reports_store = []


def save_history():
    """Save report history to disk."""
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(reports_store, f, indent=2, default=str)
    except IOError:
        pass


def run_crew_task(job_id: str, product_idea: str):
    """Execute the CrewAI pipeline in a background thread."""
    try:
        jobs[job_id]["status"] = "running"

        # Create and run the crew
        crew_instance = MarketResearchCrew()
        result = crew_instance.crew().kickoff(inputs={"product_idea": product_idea})

        # Extract the raw output
        report_text = str(result)

        # Save to report file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_filename = f"report_{timestamp}.md"
        report_path = REPORTS_DIR / report_filename
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(report_text)

        # Store report in history
        report_entry = {
            "id": job_id,
            "product_idea": product_idea,
            "report": report_text,
            "created_at": datetime.now().isoformat(),
            "filename": report_filename,
        }
        reports_store.insert(0, report_entry)
        save_history()

        # Update job status
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["result"] = report_text
        jobs[job_id]["filename"] = report_filename

    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)


# ==================== Routes ==================== #


@app.route("/")
def index():
    """Render the homepage."""
    return render_template("index.html")


@app.route("/run", methods=["POST"])
def run_crew():
    """Start the CrewAI pipeline for a given product idea."""
    data = request.get_json()
    if not data or not data.get("product_idea", "").strip():
        return jsonify({"status": "error", "message": "Product idea is required."}), 400

    product_idea = data["product_idea"].strip()

    # Create a unique job ID
    job_id = datetime.now().strftime("%Y%m%d%H%M%S%f")

    jobs[job_id] = {
        "status": "queued",
        "product_idea": product_idea,
        "created_at": datetime.now().isoformat(),
        "result": None,
        "error": None,
    }

    # Run the crew in a background thread
    thread = threading.Thread(target=run_crew_task, args=(job_id, product_idea))
    thread.daemon = True
    thread.start()

    return jsonify({"status": "started", "job_id": job_id})


@app.route("/status/<job_id>")
def job_status(job_id):
    """Check the status of a running job."""
    if job_id not in jobs:
        return jsonify({"status": "error", "message": "Job not found."}), 404

    job = jobs[job_id]

    response = {
        "status": job["status"],
        "product_idea": job["product_idea"],
    }

    if job["status"] == "completed":
        response["report"] = job["result"]
        response["filename"] = job.get("filename", "")

    if job["status"] == "failed":
        response["error"] = job.get("error", "Unknown error occurred.")

    return jsonify(response)


@app.route("/history")
def get_history():
    """Return past reports."""
    # Return summaries only (without full report text for the list)
    summaries = []
    for r in reports_store[:20]:  # Last 20 reports
        summaries.append({
            "id": r["id"],
            "product_idea": r["product_idea"],
            "created_at": r["created_at"],
        })
    return jsonify({"reports": summaries})


@app.route("/report/<report_id>")
def get_report(report_id):
    """Get a specific report by ID."""
    for r in reports_store:
        if r["id"] == report_id:
            return jsonify({"status": "success", "report": r})
    return jsonify({"status": "error", "message": "Report not found."}), 404


@app.route("/download/<report_id>")
def download_report(report_id):
    """Download a report as a .txt file."""
    for r in reports_store:
        if r["id"] == report_id:
            filename = r.get("filename", f"report_{report_id}.md")
            filepath = REPORTS_DIR / filename
            if filepath.exists():
                return send_file(filepath, as_attachment=True, download_name=filename)
            else:
                # Create a temp file from stored report
                temp_path = REPORTS_DIR / f"report_{report_id}.md"
                with open(temp_path, "w", encoding="utf-8") as f:
                    f.write(r["report"])
                return send_file(temp_path, as_attachment=True, download_name=f"report_{report_id}.md")

    return jsonify({"status": "error", "message": "Report not found."}), 404


# ==================== Main ==================== #

if __name__ == "__main__":
    load_history()
    print("\n>>> AI Market Research Generator is running!")
    print("    Open http://localhost:5000 in your browser\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
