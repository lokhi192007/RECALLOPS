import os
from dotenv import load_dotenv
from hindsight_client import Hindsight

# Load environment variables from backend/.env
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH)

# Read configuration
API_KEY = os.getenv("HINDSIGHT_API_KEY")
BASE_URL = os.getenv("HINDSIGHT_BASE_URL")
BANK_ID = os.getenv("HINDSIGHT_BANK_ID")

# Validate configuration
if not API_KEY:
    raise ValueError("HINDSIGHT_API_KEY is missing")

if not BASE_URL:
    raise ValueError("HINDSIGHT_BASE_URL is missing")

if not BANK_ID:
    raise ValueError("HINDSIGHT_BANK_ID is missing")

# Initialize Hindsight client
client = Hindsight(
    base_url=BASE_URL,
    api_key=API_KEY
)

print("Hindsight client initialized successfully!")
