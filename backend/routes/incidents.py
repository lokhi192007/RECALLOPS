from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from memory.hindsight import client, BANK_ID

from services.incident_analyzer import (
    generate_incident_analysis,
    generate_similarity_analysis,
    prepare_historical_memories,
    group_historical_memories
)

from database import (
    save_incident,
    get_all_incidents,
    get_incident_analytics
)


router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)


# ==========================================
# INCIDENT INPUT MODEL
# ==========================================

class Incident(BaseModel):
    incident_id: str
    service: str
    problem: str
    symptoms: str
    root_cause: Optional[str] = None
    resolution: Optional[str] = None
    outcome: Optional[str] = None
    severity: str = "High"


# ==========================================
# SEARCH INPUT MODEL
# ==========================================

class IncidentSearch(BaseModel):
    query: str = Field(min_length=3)

# ==========================================
# INCIDENT SIMILARITY INPUT MODEL
# ==========================================

class IncidentSimilarityRequest(BaseModel):
    service: str
    problem: str
    symptoms: str


# ==========================================
# STORE INCIDENT IN HINDSIGHT
# ==========================================

@router.post("/")
def create_incident(incident: Incident):

    try:
        incident_memory = f"""
        Incident ID: {incident.incident_id}

        Service: {incident.service}

        Problem: {incident.problem}

        Symptoms: {incident.symptoms}

        Root Cause: {incident.root_cause}

        Resolution: {incident.resolution}

        Outcome: {incident.outcome}

        Severity: {incident.severity}
        """

        result = client.retain(
            bank_id=BANK_ID,
            content=incident_memory
        )

        return {
            "success": True,
            "message": "Incident stored in Hindsight",
            "incident_id": incident.incident_id
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==========================================
# SEARCH HISTORICAL INCIDENTS
# ==========================================

@router.post("/search")
def search_incidents(request: IncidentSearch):

    try:
        result = client.recall(
            bank_id=BANK_ID,
            query=request.query
        )

        memories = [
            memory.text
            for memory in result.results
        ]

        return {
            "success": True,
            "query": request.query,
            "memories": memories
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# ==========================================
# SMART INCIDENT SIMILARITY DETECTION
# ==========================================

@router.post("/similar")
def find_similar_incidents(request: IncidentSimilarityRequest):

    try:

        # Build a descriptive search query
        search_query = f"""
        Find historical production incidents similar to this incident.

        Service: {request.service}

        Problem: {request.problem}

        Symptoms: {request.symptoms}

        Focus on matching:
        - Service affected
        - Error patterns
        - Failure symptoms
        - Historical root causes
        - Previous resolutions
        """

        # Search Hindsight persistent memory
        result = client.recall(
            bank_id=BANK_ID,
            query=search_query
        )

        # Extract historical memories
        similar_incidents = [
            memory.text
            for memory in result.results
        ]

        return {
            "success": True,
            "service": request.service,
            "similar_incidents_found": len(similar_incidents),
            "similar_incidents": similar_incidents
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
@router.post("/similarity-analysis")
def analyze_incident_similarity(request: IncidentSimilarityRequest):

    try:
        # Step 1: Search Hindsight
        search_query = f"""
        Find historical production incidents similar to this incident.

        Service: {request.service}
        Problem: {request.problem}
        Symptoms: {request.symptoms}

        Focus on matching service, error patterns,
        failure symptoms, root causes and resolutions.
        """

        result = client.recall(
            bank_id=BANK_ID,
            query=search_query
        )

        # Step 2: Extract retrieved memories
        historical_memories = [
            memory.text for memory in result.results
        ]

        retrieved_count = len(historical_memories)

        # Step 3: Prepare current incident details
        incident_data = {
            "service": request.service,
            "problem": request.problem,
            "symptoms": request.symptoms
        }

        # Step 4: Remove duplicates and rank memories
        selected_memories = prepare_historical_memories(
            incident_data,
            historical_memories
        )

        grouped_memories = group_historical_memories(
            selected_memories
        )

        # Step 5: Generate Groq AI analysis
        analysis = generate_similarity_analysis(
            incident_data,
            selected_memories,
            grouped_memories
        )

        # Step 6: Return results
        return {
            "success": True,
            "service": request.service,
            "retrieved_memory_records": retrieved_count,
            "memories_used_for_analysis": len(selected_memories),
            "unique_memory_groups": len(grouped_memories),

            "grouped_memory_evidence": grouped_memories,

            "memory_evidence": [
                {
                    "reference": f"HM-{index}",
                    "content": memory
                }
                for index, memory in enumerate(selected_memories, start=1)
            ],

            "analysis": analysis
    }
    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
# ==========================================
# HINDSIGHT REFLECTION
# ==========================================

@router.post("/reflect")
def reflect_on_incidents(request: IncidentSearch):

    try:
        result = client.reflect(
            bank_id=BANK_ID,
            query=request.query
        )

        return {
            "success": True,
            "query": request.query,
            "answer": result.text
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==========================================
# AI INCIDENT ANALYSIS
# ==========================================

@router.post("/analyze")
def analyze_incident(incident: Incident):

    try:

        # Search historical knowledge
        search_query = (
            f"{incident.service}: "
            f"{incident.problem}. "
            f"{incident.symptoms}"
        )

        memory_result = client.recall(
            bank_id=BANK_ID,
            query=search_query
        )

        historical_memories = [
            memory.text
            for memory in memory_result.results
        ]

        # Convert incident to dictionary
        incident_data = incident.model_dump()

        # Generate Groq AI analysis
        analysis = generate_incident_analysis(
            incident_data,
            historical_memories
        )

        # Save structured incident in SQLite
        save_incident(
            incident_data,
            analysis
        )

        print(
            "INCIDENT SAVED IN SQLITE:",
            incident.incident_id
        )

        # Store newly analyzed incident in Hindsight
        incident_memory = f"""
        NEW PRODUCTION INCIDENT

        Incident ID: {incident.incident_id}
        Service: {incident.service}
        Problem: {incident.problem}
        Symptoms: {incident.symptoms}
        Severity: {incident.severity}

        Confirmed Root Cause:
        {incident.root_cause or "Not yet identified"}

        Confirmed Resolution:
        {incident.resolution or "Not yet applied"}

        Confirmed Outcome:
        {incident.outcome or "Pending"}

        AI Investigation:
        {analysis}

        IMPORTANT:
        The AI investigation contains hypotheses
        and recommendations.

        These are not confirmed facts unless
        verified by an engineer.
        """

        retain_result = client.retain(
            bank_id=BANK_ID,
            content=incident_memory
        )

        print("HINDSIGHT MEMORY SAVED:")
        print(retain_result)

        return {
            "success": True,
            "incident_id": incident.incident_id,
            "historical_memories": historical_memories,
            "analysis": analysis
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==========================================
# GET ALL INCIDENTS FROM SQLITE
# ==========================================

@router.get("/")
def get_incidents():

    try:

        incidents = get_all_incidents()

        return {
            "success": True,
            "total": len(incidents),
            "incidents": incidents
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==========================================
# GET INCIDENT ANALYTICS
# ==========================================

@router.get("/analytics")
def get_analytics():

    try:

        analytics = get_incident_analytics()

        return {
            "success": True,
            "analytics": analytics
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )