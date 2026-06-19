import psycopg2
from psycopg2 import pool

db_pool = None

DB_CONFIG = {
    "dbname": "linuxlab",
    "user": "labuser",
    "password": "labpass",
    "host": "localhost",
    "port": 5432
}

# -------------------------
# CONNECTION POOL (IMPORTANT for 300 users)
# -------------------------
def init_db_pool():
    global db_pool
    db_pool = psycopg2.pool.SimpleConnectionPool(
        1, 20,
        **DB_CONFIG
    )
# -------------------------
# GET CONNECTION
# -------------------------
def get_conn():
    return db_pool.getconn()

def release_conn(conn):
    db_pool.putconn(conn)


# -------------------------
# INIT TABLES
# -------------------------
def init_db():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT
        )
    """)

    conn.commit()
    cur.close()
    release_conn(conn)
