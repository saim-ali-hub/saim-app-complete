from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

import os
import pty
import subprocess
import pwd
import select
import fcntl
import termios
import struct
import json
import hashlib
from jose import jwt
from passlib.hash import bcrypt

from db import init_db_pool
from psycopg2 import pool
from shell import start_shell, sessions
from db import get_conn, release_conn

app = FastAPI()

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# -------------------------
# DATABASE STARTUP
# -------------------------
@app.on_event("startup")
def startup():
    init_db_pool()

SECRET = "linuxlab-secret"

# -------------------------
# DATABASE AUTH
# ------------------------
def create_token(username):
    return jwt.encode({"user": username}, SECRET, algorithm="HS256")

def verify(token):
    return jwt.decode(token, SECRET, algorithms=["HS256"])

# -------------------------
# REGISTER
# -------------------------
import grp
import subprocess

GROUP_NAME = "students"

@app.post("/register")
async def register(data: dict):

    username = data["username"]
    password = data["password"]

    hashed = hashlib.sha256(password.encode()).hexdigest()

    # -------------------------
    # DB INSERT (POSTGRESQL)
    # -------------------------
    conn = get_conn()
    c = conn.cursor()

    c.execute("""
        INSERT INTO users (username, password)
        VALUES (%s, %s)
        ON CONFLICT (username)
        DO UPDATE SET password = EXCLUDED.password
    """, (username, hashed))

    conn.commit()
    c.close()
    release_conn(conn)

    # -------------------------
    # 2. CREATE LINUX USER (FOR SHELL ACCESS)
    # -------------------------
    try:
        pwd.getpwnam(username)
    except KeyError:
        subprocess.run([
        "useradd",
        "-m",
        "-G", GROUP_NAME,
        "-s", "/bin/bash",
        username
    ], check=True)

        subprocess.run(
            f'echo "{username}:{password}" | chpasswd',
            shell=True,
            check=True
        )

    return {"status": "user ready"}

# -------------------------
# LOGIN
# -------------------------
@app.post("/login")
def login(data: dict):
    conn = get_conn()
    c = conn.cursor()

    c.execute("SELECT password FROM users WHERE username=%s", (data["username"],))
    row = c.fetchone()
    conn.close()

    if not row:
        return {"token": None}

    hashed_input = hashlib.sha256(data["password"].encode()).hexdigest()

    if hashed_input == row[0]:
        token = jwt.encode({"user": data["username"]}, SECRET, algorithm="HS256")
        return {"token": token}

    return {"token": None}

# -------------------------
# WEBSOCKET TERMINAL
# -------------------------
import asyncio
import os
import json
import select
import fcntl
import termios
import struct

@app.websocket("/ws/{username}")
async def ws_terminal(ws: WebSocket, username: str):

    await ws.accept()

    master, _ = start_shell(username)

    # --------------------------------
    # SHELL -> BROWSER
    # --------------------------------
    async def shell_to_ws():

        while True:

            await asyncio.sleep(0.01)

            r, _, _ = select.select([master], [], [], 0)

            if master in r:

                try:
                    output = os.read(master, 8192)

                    if output:
                        await ws.send_text(
                            output.decode(errors="ignore")
                        )

                except:
                    break

    # --------------------------------
    # BROWSER -> SHELL
    # --------------------------------
    async def ws_to_shell():

        while True:

            data = await ws.receive_text()

            # -------------------------
            # HANDLE TERMINAL RESIZE
            # -------------------------
            if data.startswith("{"):

                try:
                    msg = json.loads(data)

                    if msg.get("type") == "resize":

                        winsize = struct.pack(
                            "HHHH",
                            msg["rows"],
                            msg["cols"],
                            0,
                            0
                        )

                        fcntl.ioctl(
                            master,
                            termios.TIOCSWINSZ,
                            winsize
                        )

                        continue

                except:
                    pass

            # -------------------------
            # SEND RAW BYTES TO PTY
            # -------------------------
            os.write(master, data.encode())

    try:

        await asyncio.gather(
            shell_to_ws(),
            ws_to_shell()
        )

    except Exception as e:

        print("WS closed:", e)

    finally:

        os.close(master)
