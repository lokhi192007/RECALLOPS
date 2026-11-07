import sqlite3
import os

# Database file location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "recallops.db")


# Create database connection
def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


# Initialize database
def initialize_database():
    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            incident_id TEXT PRIMARY KEY,
            service TEXT NOT NULL,
            problem TEXT NOT NULL,
            symptoms TEXT NOT NULL,
            root_cause TEXT,
            resolution TEXT,
            outcome TEXT,
            severity TEXT DEFAULT 'High',
            analysis TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.commit()
    connection.close()

    print("RECALLOPS SQLite database initialized!")


# Save incident
def save_incident(incident, analysis=None):
    connection = get_connection()

    connection.execute("""
        INSERT OR REPLACE INTO incidents (
            incident_id, service, problem, symptoms,
            root_cause, resolution, outcome, severity, analysis
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        incident["incident_id"],
        incident["service"],
        incident["problem"],
        incident["symptoms"],
        incident.get("root_cause"),
        incident.get("resolution"),
        incident.get("outcome"),
        incident.get("severity", "High"),
        analysis
    ))

    connection.commit()
    connection.close()


# Get all incidents
def get_all_incidents():
    connection = get_connection()

    rows = connection.execute("""
        SELECT * FROM incidents
        ORDER BY created_at DESC
    """).fetchall()

    incidents = [dict(row) for row in rows]

    connection.close()

    return incidents


# Get incident analytics
def get_incident_analytics():
    connection = get_connection()

    total = connection.execute(
        "SELECT COUNT(*) FROM incidents"
    ).fetchone()[0]

    critical = connection.execute("""
        SELECT COUNT(*) FROM incidents
        WHERE LOWER(severity) = 'high'
    """).fetchone()[0]

    resolved = connection.execute("""
        SELECT COUNT(*) FROM incidents
        WHERE resolution IS NOT NULL
        AND TRIM(resolution) != ''
    """).fetchone()[0]

    pending = total - resolved

    service_stats = connection.execute("""
        SELECT service, COUNT(*) AS count
        FROM incidents
        GROUP BY service
    """).fetchall()

    severity_stats = connection.execute("""
        SELECT severity, COUNT(*) AS count
        FROM incidents
        GROUP BY severity
    """).fetchall()

    connection.close()

    return {
        "total": total,
        "critical": critical,
        "resolved": resolved,
        "pending": pending,
        "service_stats": [dict(row) for row in service_stats],
        "severity_stats": [dict(row) for row in severity_stats]
    }

def get_incident_analytics():

    connection = get_connection()

    # Total incidents
    total = connection.execute("""
        SELECT COUNT(*) FROM incidents
    """).fetchone()[0]

    # Incidents grouped by severity
    severity_rows = connection.execute("""
        SELECT severity, COUNT(*) AS count
        FROM incidents
        GROUP BY severity
    """).fetchall()

    severity = {
        row["severity"]: row["count"]
        for row in severity_rows
    }

    # Incidents grouped by service
    service_rows = connection.execute("""
        SELECT service, COUNT(*) AS count
        FROM incidents
        GROUP BY service
        ORDER BY count DESC
    """).fetchall()

    services = [
        {
            "service": row["service"],
            "count": row["count"]
        }
        for row in service_rows
    ]

    # Resolved and pending incidents
    resolved = connection.execute("""
        SELECT COUNT(*)
        FROM incidents
        WHERE LOWER(COALESCE(outcome, '')) LIKE '%resolved%'
    """).fetchone()[0]

    pending = total - resolved

    connection.close()

    return {
        "total_incidents": total,
        "resolved_incidents": resolved,
        "pending_incidents": pending,
        "severity_breakdown": severity,
        "service_breakdown": services
    }