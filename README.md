# RECALLOPS
### Don't Debug the Same Problem Twice.

**An AI-powered Production Incident Intelligence Platform that learns from historical failures using persistent AI memory.**

RECALLOPS helps developers investigate production incidents by retrieving historical knowledge, comparing similar incidents, and generating AI-powered investigation guidance.

---

## 🚀 Project Overview

Production teams often spend valuable time investigating recurring issues because previous incident reports, root causes, and resolutions are scattered across different systems.

RECALLOPS explores a different approach: an AI agent that remembers previous incidents and uses historical knowledge to support future investigations.

It combines persistent memory with Large Language Model (LLM) analysis to make incident investigation more informed and context-aware.

## ✨ Key Features

- **Incident Management:** Create and track production incidents.
- **Persistent AI Memory:** Store and retrieve historical knowledge using Hindsight.
- **AI Incident Analysis:** Generate investigation guidance using Groq.
- **Similar Incident Detection:** Retrieve potentially related historical incidents.
- **Historical Evidence Comparison:** Compare current problems with previously retained information.
- **Continuous Learning:** Retain incident information and AI analysis for future investigations.
- **Analytics Dashboard:** Monitor incident statistics using SQLite.
- **Evidence-Aware Analysis:** Distinguish documented information from AI-generated hypotheses.

## 🧠 How RECALLOPS Works

```text
       New Production Incident
                 |
                 v
        Incident Information
                 |
                 v
       Hindsight Memory Retrieval
                 |
                 v
       Historical Evidence Search
                 |
                 v
          Groq AI Analysis
                 |
                 v
       Investigation Recommendations
                 |
                 v
        SQLite Incident Storage
                 |
                 v
       Retain Knowledge in Hindsight
                 |
                 v
         Future Investigations
```

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React |
| Development Server | Vite |
| Styling | Tailwind CSS |
| Backend | Python |
| API Framework | FastAPI |
| AI Memory | Hindsight |
| LLM Integration | Groq |
| Database | SQLite |
| API Testing | Swagger UI |

## 📂 Project Structure

```text
RECALLOPS/
│
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── agent.py
│   ├── database.py
│   ├── requirements.txt
│   │
│   ├── memory/
│   │   └── hindsight.py
│   │
│   ├── routes/
│   │   ├── incidents.py
│   │   └── dashboard.py
│   │
│   └── services/
│       ├── incident_analyzer.py
│       ├── log_processor.py
│       └── deployment_tracker.py
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- Git
- Groq API key
- Hindsight API credentials

### 1. Clone the Repository

```bash
git clone https://github.com/lokhi192007/RECALLOPS.git
cd RECALLOPS
```

### 2. Backend Setup

Open a terminal:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
..\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the backend directory.

Add:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b

HINDSIGHT_API_KEY=your_hindsight_api_key
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=recallops
```

Replace the placeholders with your own credentials.

**Never commit your `.env` file or expose API keys publicly.**

### 4. Start the Backend

From the `backend` directory:

```bash
uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

### 5. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local address displayed by Vite, usually:

```text
http://localhost:5173
```

## 🔍 Core Capabilities

### AI-Powered Incident Analysis

RECALLOPS combines current incident information with retrieved historical memories to generate investigation guidance.

### Persistent Memory

Hindsight allows the system to retain incident knowledge and retrieve relevant information during future investigations.

### Similar Incident Analysis

The system compares a new incident with historical memory records and generates an evidence-aware analysis.

### Incident Analytics

SQLite stores incident information and supports dashboard statistics and service-level analysis.

## 🔐 Reliability and Safety

RECALLOPS follows important principles:

- Historical similarity does not prove identical root causes.
- AI-generated explanations are hypotheses until verified.
- Missing evidence should not be treated as confirmed information.
- Production changes require human review and approval.

## 🚧 Future Improvements

- Advanced semantic memory filtering.
- Deployment-event correlation.
- Improved historical incident grouping.
- Investigation feedback and resolution verification.
- Expanded observability integrations.

## 🎯 Project Goal

The goal of RECALLOPS is to explore how AI agents can learn from previous production incidents and help engineers make better-informed investigation decisions.

**Every incident should leave behind knowledge that makes the next investigation easier.**

## 👨‍💻 Developer

**Lokeshwaran A.**

- GitHub: [@lokhi192007](https://github.com/lokhi192007)
- LinkedIn: [Lokeshwaran A.](https://linkedin.com/in/lokeshwaran-a-a02052380)

---

*Built with Python, React, Groq, Hindsight, and a passion for AI-powered engineering.*