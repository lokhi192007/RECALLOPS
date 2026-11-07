
import os
import re 
from pathlib import Path
from difflib import SequenceMatcher
from dotenv import load_dotenv
from groq import Groq

# Load backend environment variables
BACKEND_DIR = Path(__file__).resolve().parents[1]

load_dotenv(BACKEND_DIR / ".env")

# Initialize Groq
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-120b"
)

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is missing")

groq_client = Groq(api_key=GROQ_API_KEY)


def generate_incident_analysis(incident, historical_memories):

    memory_context = "\n".join(
        f"- {memory}" for memory in historical_memories
    )

    if not memory_context:
        memory_context = "No relevant historical incidents found."

    prompt = f"""
You are RECALLOPS, a production incident intelligence agent.

Analyze the following production incident.

CURRENT INCIDENT:
{incident}

RELEVANT HISTORICAL MEMORIES:
{memory_context}

YOUR TASK:

1. Explain the current incident.
2. Identify possible root causes.
3. Compare it with historical incidents.
4. Suggest investigation steps.
5. Recommend possible resolutions.
6. Explain why each recommendation is relevant.
7. Identify what must be verified by an engineer.

IMPORTANT RULES:

- Do not invent facts.
- Do not treat historical similarity as proof of the same root cause.
- Clearly distinguish confirmed information from hypotheses.
- Do not claim a solution is verified unless its outcome is documented.
- Never recommend automatic production changes.
- Require engineer approval before applying any fix.

Use clear professional language.
"""

    response = groq_client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert production incident "
                    "analysis assistant."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        max_completion_tokens=2000
    )

    return response.choices[0].message.content

# AI incident analysis using Hindsight + Groq

def generate_similarity_analysis(
    incident,
    historical_memories,
    grouped_memories=None
):
    """
    Generates evidence-based incident similarity analysis.

    Uses original HM references and optional incident-level
    grouping to prevent duplicate records being counted
    as separate historical incidents.
    """

    # Assign stable references to selected memories.
    labelled_memories = []

    for index, memory in enumerate(historical_memories):
        memory_id = f"HM-{index + 1}"

        labelled_memories.append({
            "id": memory_id,
            "text": memory
        })

    memory_context = "\n\n".join(
        f"[{memory['id']}]\n{memory['text'][:2000]}"
        for memory in labelled_memories
    )

    if not memory_context:
        memory_context = "No relevant historical memories found."

    # Prepare incident grouping context.
    if grouped_memories:
        grouping_context = "\n\n".join(
            (
                f"Group: {group['group_id']}\n"
                f"Incident ID: {group['incident_id'] or 'Not documented'}\n"
                f"Memory references: "
                f"{', '.join(record['reference'] for record in group['records'])}\n"
                f"Record count: {len(group['records'])}"
            )
            for group in grouped_memories
        )
    else:
        grouping_context = (
            "No incident grouping information supplied. "
            "Do not assume unlinked memories represent "
            "different incidents."
        )

    prompt = f"""
You are RECALLOPS, an evidence-based production
incident intelligence agent.

Analyze the current incident using the supplied
historical Hindsight memories and grouping information.

CURRENT INCIDENT:
{incident}

HISTORICAL MEMORY RECORDS:
{memory_context}

INCIDENT-LEVEL GROUPING:
{grouping_context}

YOUR TASK:

1. Identify the most relevant historical evidence.
2. Compare historical symptoms with the current incident.
3. Identify records belonging to the same confirmed incident.
4. Distinguish historical incidents from investigation guidance.
5. Identify documented root causes, resolutions and outcomes.
6. Suggest possible root-cause hypotheses.
7. Recommend investigation and verification steps.
8. Explain lessons learned from historical evidence.

MANDATORY GROUPING RULES:

1. Records sharing the same explicit incident ID belong
   to the same identified incident.

2. Multiple memories belonging to one incident must not
   be counted as multiple incidents.

3. Records without incident IDs must be labelled
   "Unlinked historical evidence".

4. Never assume that two unlinked records describe
   the same incident solely because their symptoms match.

5. Never assume that unlinked records describe
   different incidents either.

6. Do not report the number of unique historical incidents
   by counting unlinked records.

7. Grouping indicates record association, not proof
   that all facts in those records are independently verified.

8. Investigation guidance and general recommendations
   must not be presented as historical incidents.

MANDATORY EVIDENCE RULES:

1. Every historical factual claim must include its
   memory reference, such as [HM-1].

2. Use only supplied memory references.

3. Never invent memory IDs or incident IDs.

4. Similar symptoms do not prove identical root causes.

5. A historical hypothesis is not a confirmed root cause.

6. A suggested resolution is not a verified resolution.

7. A resolution is documented only when the memory
   explicitly states that it was applied.

8. An outcome is verified only when the memory
   explicitly records the result.

9. If evidence is missing, write "Not documented".

10. Do not describe duplicated memory records as
    independent incident occurrences.

11. Distinguish the current incident from historical incidents.

12. Do not infer that a previous remediation will
    necessarily resolve the current incident.

OUTPUT FORMAT:

## 1. Similarity Analysis Summary

Summarize the current incident and its strongest
historical matches.

Distinguish confirmed incident IDs from unlinked evidence.

## 2. Historical Incident and Evidence Grouping

For each confirmed incident ID, include:
- Incident ID
- Associated memory references
- Historical details
- Matching symptoms
- Documented root cause
- Documented resolution
- Documented outcome

For unlinked evidence, explain that the records have
no confirmed incident ID.

Do not count unlinked records as separate incidents.

## 3. Most Relevant Historical Matches

For each relevant memory, include:
- Memory reference
- Historical details
- Matching symptoms
- Documented root cause
- Root-cause evidence
- Documented resolution
- Resolution evidence
- Documented outcome
- Outcome evidence

## 4. Evidence Classification

Separate:
- Confirmed historical facts
- Historical hypotheses
- Investigation guidance
- Suggested recommendations
- Unknown information

Include memory references.

## 5. Possible Root-Cause Hypotheses

List possible causes, supporting evidence,
and what an engineer must verify.

Clearly label unconfirmed causes as hypotheses.

## 6. Recommended Investigation Steps

Provide practical, evidence-based investigation steps.

## 7. Lessons From Historical Incidents

Explain what can be learned from previous incidents.

Do not treat duplicate memories as separate incidents.

## 8. Engineer Verification Required

Explain what must be verified before applying
any production change.

IMPORTANT:

- Do not invent facts.
- Do not invent incident IDs.
- Do not count duplicate memory records as separate incidents.
- Do not confuse historical incidents with the current incident.
- Do not claim an outcome was successful without evidence.
- Never recommend automatic production changes.
- Require engineer approval before production fixes.

Use professional, clear and concise language.
"""

    response = groq_client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are RECALLOPS, an evidence-based "
                    "production incident intelligence assistant. "
                    "Maintain strict traceability between "
                    "historical claims and source memories. "
                    "Distinguish incident identity from "
                    "similarity of symptoms."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
        max_completion_tokens=3000
    )

    return response.choices[0].message.content


def are_conservative_duplicates(memory_a, memory_b):
    """
    Conservative near-duplicate detection.

    Allows small wording and metadata differences while
    preserving records containing meaningful additional facts.
    """

    def normalize(text):
        text = str(text).lower()

        # Remove dates and metadata labels.
        text = re.sub(
            r"\b20\d{2}-\d{2}-\d{2}\b",
            " ",
            text
        )

        text = re.sub(
            r"\|\s*(when|where|involving|to):",
            " ",
            text
        )

        # Normalize common technical variations.
        replacements = {
            "database": "db",
            "maxpoolsize": "poolsize",
            "connection pool": "pool",
            "connection-pool": "pool",
            "restarting the service": "restart service",
            "restarted the service": "restart service",
            "increasing the pool limit": "increase pool",
            "increased the pool limit": "increase pool",
            "increasing maxpoolsize": "increase poolsize",
        }

        for old, new in replacements.items():
            text = text.replace(old, new)

        text = re.sub(r"[^a-z0-9_ ]", " ", text)
        text = re.sub(r"\s+", " ", text)

        return text.strip()

    text_a = normalize(memory_a)
    text_b = normalize(memory_b)

    if not text_a or not text_b:
        return False

    words_a = set(text_a.split())
    words_b = set(text_b.split())

    if not words_a or not words_b:
        return False

    # Similarity based on shared meaningful words.
    intersection = words_a & words_b
    union = words_a | words_b

    jaccard_score = len(intersection) / len(union)

    # Containment catches cases where one memory adds
    # a small amount of metadata to another.
    containment_score = len(intersection) / min(
        len(words_a),
        len(words_b)
    )

    sequence_score = SequenceMatcher(
        None,
        text_a,
        text_b
    ).ratio()

    # Require substantial overlap and strong similarity.
    return (
        containment_score >= 0.90
        and (
            jaccard_score >= 0.75
            or sequence_score >= 0.85
        )
    )

def prepare_historical_memories(incident, historical_memories):

    service = incident.get("service", "").strip().lower()
    problem = incident.get("problem", "").strip().lower()
    symptoms = incident.get("symptoms", "").strip().lower()

    search_text = f"{service} {problem} {symptoms}"

    stop_words = {
        "the", "and", "for", "with", "from", "this",
        "that", "are", "was", "were", "has", "have",
        "into", "because", "due", "what", "when",
        "where", "which", "their", "there"
    }

    keywords = {
        word for word in re.findall(
            r"\b[a-z0-9_]+\b", search_text
        )
        if len(word) > 2 and word not in stop_words
    }

    processed_memories = []
    seen_fingerprints = set()

    exact_duplicates_removed = 0
    semantic_duplicates_removed = 0

    for memory in historical_memories:

        text = str(memory).strip()

        if not text:
            continue

        # Normalize text for duplicate detection.
        normalized = text.lower()

        # Remove Hindsight metadata that may differ
        # between otherwise identical memory records.
        normalized = re.sub(
            r"\|\s*(when|where|involving|to):[^|]*",
            "",
            normalized
        )

        normalized = re.sub(
            r"\b20\d{2}-\d{2}-\d{2}\b",
            "",
            normalized
        )

        normalized = re.sub(
            r"\s+",
            " ",
            normalized
        )

        normalized = normalized.strip(" .|")

        # Create a normalized fingerprint.
        fingerprint = normalized

        # Remove exact and metadata-only duplicates.
        if fingerprint in seen_fingerprints:
            exact_duplicates_removed += 1
            continue

        seen_fingerprints.add(fingerprint)

        # Remove highly similar duplicate memories conservatively.
        is_duplicate = any(
            are_conservative_duplicates(text, item["text"])
            for item in processed_memories
        )

        if is_duplicate:
            semantic_duplicates_removed += 1
            continue

        # Identify incident IDs.
        incident_ids = re.findall(
            r"\bINC-[A-Za-z0-9_-]+\b",
            text,
            re.IGNORECASE
        )

        # Classify memory type.
        memory_lower = text.lower()

        guidance_terms = [
            "engineers should",
            "investigate",
            "recommended actions",
            "check quotas",
            "collect real-time metrics",
            "review recent changes",
            "controlled tests",
            "correlating with traffic"
        ]

        investigation_terms = [
            "currently being investigated",
            "under investigation",
            "potential hypotheses",
            "investigating database connection"
        ]

        if any(term in memory_lower for term in guidance_terms):
            category = "INVESTIGATION_GUIDANCE"

        elif any(
            term in memory_lower
            for term in investigation_terms
        ):
            category = "INVESTIGATION_UPDATE"

        else:
            category = "HISTORICAL_INCIDENT"

        # Calculate relevance.
        memory_words = set(
            re.findall(r"\b[a-z0-9_]+\b", memory_lower)
        )

        matching_keywords = keywords.intersection(
            memory_words
        )

        relevance_score = len(matching_keywords)

        if service and service in memory_lower:
            relevance_score += 5

        if category == "HISTORICAL_INCIDENT":
            relevance_score += 3

        if incident_ids:
            relevance_score += 2

        processed_memories.append({
            "text": text,
            "category": category,
            "score": relevance_score,
            "has_incident_id": bool(incident_ids)
        })

    # Rank by relevance while preserving original memory text.
    processed_memories.sort(
        key=lambda item: (
            item["score"],
            item["has_incident_id"]
        ),
        reverse=True
    )

    # Limit the number of memories sent to Groq.
    selected_memories = processed_memories[:15]

    print("\n========== RECALLOPS MEMORY FILTER ==========")
    print("Original memories:", len(historical_memories))
    print("Exact duplicates removed:", exact_duplicates_removed)
    print("Semantic duplicates removed:", semantic_duplicates_removed)
    print("Unique records after filtering:", len(processed_memories))
    print("Records selected for analysis:", len(selected_memories))
    print("=============================================\n")
    print("DEBUG: prepare_historical_memories() executed")
    return [item["text"] for item in selected_memories]
    
def group_historical_memories(historical_memories):
    """
    Groups memory records by incident ID.

    Records without an incident ID are kept as separate
    unlinked evidence records to avoid incorrect grouping.
    """

    groups = {}

    for index, memory in enumerate(historical_memories, start=1):

        text = str(memory).strip()

        if not text:
            continue

        incident_ids = re.findall(
            r"\bINC-[A-Za-z0-9_-]+\b",
            text,
            re.IGNORECASE
        )

        if incident_ids:
            group_id = incident_ids[0].upper()
        else:
            group_id = f"UNLINKED-{index}"

        if group_id not in groups:
            groups[group_id] = {
                "group_id": group_id,
                "incident_id": (
                    group_id if group_id.startswith("INC-") else None
                ),
                "records": []
            }

        groups[group_id]["records"].append({
            "reference": f"HM-{index}",
            "content": text
        })

    return list(groups.values())