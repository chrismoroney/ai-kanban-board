import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Get database URL from environment
DB_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """Returns a new PostgreSQL connection."""
    return psycopg2.connect(DB_URL)
