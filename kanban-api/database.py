import os
import psycopg2

DB_URL = os.getenv("DATABASE_URL")

if not DB_URL:
    raise ValueError("❌ DATABASE_URL is not set! Make sure it's configured properly.")

def get_db_connection():
    return psycopg2.connect(DB_URL)
