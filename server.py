#!/usr/bin/env python3
"""
JC Culinary Web Server & SQLite Database Backend
Provides REST API endpoints for memories (gallery) & Ema notes, and serves static files.
"""

import os
import sys
import json
import sqlite3
import base64
import uuid
import mimetypes
from urllib.parse import urlparse, parse_qs
from http.server import HTTPServer, SimpleHTTPRequestHandler
import datetime

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.sqlite")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOADS_DIR, exist_ok=True)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Table for Gallery Memories
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT DEFAULT 'hangout',
        date TEXT,
        location TEXT DEFAULT 'JC Culinary',
        image TEXT NOT NULL,
        description TEXT,
        uploader TEXT DEFAULT 'JC Member',
        likes INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Table for Wooden Ema Notes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        color TEXT DEFAULT 'amber',
        date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Table for Users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        isAdmin INTEGER DEFAULT 0
    )
    """)

    # Populate default users if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        default_users = [
            ("jikul@gmail.com", "JC Culinary", "112233", 1),
            ("admin@jikul.id", "Mail Admin", "112233", 1),
            ("ilma@jikul.id", "Ilma Member", "112233", 0)
        ]
        cursor.executemany("INSERT INTO users (email, name, password, isAdmin) VALUES (?, ?, ?, ?)", default_users)

    # Populate default gallery data if empty
    cursor.execute("SELECT COUNT(*) FROM memories")
    if cursor.fetchone()[0] == 0:
        default_memories = [
            ("g1", "Festival Bunkasai 2025 — Yukata Parade", "bunkasai", "2025-10-15", "Japanese Garden", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80", "Penampilan spektakuler rombongan Nihongo Club di Festival Budaya Bunkasai!", "Ilma", 42),
            ("g2", "Sesi Belajar Bersama (勉強会) — Kanji N3", "belajar", "2025-04-20", "Ruang Kelas Japanese Corner", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80", "Diskusi seru tata bahasa (Bunpou) dan cara cepat menghafal Kanji N3.", "Amel", 31),
            ("g3", "JC Culinary & Japanese Food Gathering", "hangout", "2025-12-10", "JC Culinary Corner", "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80", "Nikmatnya ramen dan takoyaki hangat buatan tim JC Culinary saat gathering akhir tahun!", "JC Culinary", 58)
        ]
        cursor.executemany("INSERT INTO memories (id, title, category, date, location, image, description, uploader, likes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", default_memories)

    # Populate default notes if empty
    cursor.execute("SELECT COUNT(*) FROM notes")
    if cursor.fetchone()[0] == 0:
        default_notes = [
            ("n1", "Mail (Super Admin)", "Terima kasih untuk 4 tahun yang luar biasa ini! Mari terus jaga persahabatan dan kecintaan kita pada budaya Jepang. いつまでも友達でいよう！", "rose", "30 Ags 2026"),
            ("n2", "JC Culinary", "Selamat datang di JC Culinary! Semoga kenangan indah dan sajian penuh cinta senantiasa menyertai setiap langkah kita.", "amber", "30 Ags 2026")
        ]
        cursor.executemany("INSERT INTO notes (id, author, content, color, date) VALUES (?, ?, ?, ?, ?)", default_notes)

    conn.commit()
    conn.close()

def save_base64_image(base64_str):
    """Save base64 data to uploads directory and return relative URL"""
    if not base64_str or not base64_str.startswith("data:image/"):
        return base64_str
    
    try:
        header, encoded = base64_str.split(",", 1)
        ext = "jpg"
        if "png" in header:
            ext = "png"
        elif "gif" in header:
            ext = "gif"
        elif "webp" in header:
            ext = "webp"
        
        filename = f"upload_{uuid.uuid4().hex[:12]}.{ext}"
        filepath = os.path.join(UPLOADS_DIR, filename)
        
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(encoded))
            
        return f"/uploads/{filename}"
    except Exception as e:
        print(f"[Error saving image] {e}")
        return base64_str

class JCHttpHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # API: Get all memories
        if path == "/api/memories":
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM memories ORDER BY created_at DESC")
            rows = [dict(row) for row in cursor.fetchall()]
            conn.close()
            return self._send_json({"success": True, "data": rows})

        # API: Get all Ema notes
        elif path == "/api/notes":
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM notes ORDER BY created_at DESC")
            rows = [dict(row) for row in cursor.fetchall()]
            conn.close()
            return self._send_json({"success": True, "data": rows})

        # API: Get users
        elif path == "/api/users":
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT email, name, isAdmin FROM users")
            rows = [dict(row) for row in cursor.fetchall()]
            conn.close()
            return self._send_json({"success": True, "data": rows})

        # API: Health Check
        elif path == "/api/health":
            return self._send_json({"status": "healthy", "server": "JC Culinary Python SQLite Server"})

        # Static files
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        content_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else "{}"
        
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        # API: Add memory (upload foto)
        if path == "/api/memories":
            title = payload.get("title", "Momen Indah")
            category = payload.get("category", "hangout")
            date_val = payload.get("date", datetime.date.today().strftime("%Y-%m-%d"))
            location = payload.get("location", "JC Culinary")
            raw_image = payload.get("image", "")
            description = payload.get("description", "")
            uploader = payload.get("uploader", "JC Member")
            
            # Save base64 image to file if applicable
            saved_image = save_base64_image(raw_image)
            memory_id = payload.get("id") or f"mem_{uuid.uuid4().hex[:8]}"

            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO memories (id, title, category, date, location, image, description, uploader, likes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            """, (memory_id, title, category, date_val, location, saved_image, description, uploader))
            conn.commit()

            cursor.execute("SELECT * FROM memories WHERE id = ?", (memory_id,))
            new_row = dict(cursor.fetchone())
            conn.close()

            return self._send_json({"success": True, "message": "Momen berhasil disimpan ke database server!", "data": new_row}, status=201)

        # API: Like memory
        elif path.startswith("/api/memories/") and path.endswith("/like"):
            mem_id = path.split("/")[3]
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("UPDATE memories SET likes = likes + 1 WHERE id = ?", (mem_id,))
            conn.commit()
            cursor.execute("SELECT * FROM memories WHERE id = ?", (mem_id,))
            row = cursor.fetchone()
            conn.close()
            if row:
                return self._send_json({"success": True, "data": dict(row)})
            return self._send_json({"success": False, "error": "Not found"}, status=404)

        # API: Add Ema Note (gantung pesan baru)
        elif path == "/api/notes":
            author = payload.get("author", "JC Member")
            content = payload.get("content", "")
            color = payload.get("color", "amber")
            date_val = payload.get("date", datetime.date.today().strftime("%d %b %Y"))
            note_id = payload.get("id") or f"ema_{uuid.uuid4().hex[:8]}"

            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO notes (id, author, content, color, date)
            VALUES (?, ?, ?, ?, ?)
            """, (note_id, author, content, color, date_val))
            conn.commit()

            cursor.execute("SELECT * FROM notes WHERE id = ?", (note_id,))
            new_row = dict(cursor.fetchone())
            conn.close()

            return self._send_json({"success": True, "message": "Pesan Ema berhasil disimpan ke database server!", "data": new_row}, status=201)

        # API: Change Password
        elif path == "/api/auth/change-password":
            email = payload.get("email", "").lower().strip()
            old_pass = payload.get("oldPassword", "").strip()
            new_pass = payload.get("newPassword", "").strip()

            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,))
            user = cursor.fetchone()

            if not user or user["password"] != old_pass:
                conn.close()
                return self._send_json({"success": False, "error": "Password lama tidak sesuai!"}, status=400)

            cursor.execute("UPDATE users SET password = ? WHERE LOWER(email) = ?", (new_pass, email))
            conn.commit()
            conn.close()

            return self._send_json({"success": True, "message": "Password berhasil diperbarui di database server!"})

        # API: Login check
        elif path == "/api/auth/login":
            email = payload.get("email", "").lower().strip()
            password = payload.get("password", "").strip()

            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT email, name, isAdmin, password FROM users WHERE LOWER(email) = ?", (email,))
            user = cursor.fetchone()
            conn.close()

            if not user or user["password"] != password:
                return self._send_json({"success": False, "error": "Email atau password salah!"}, status=401)

            user_dict = dict(user)
            del user_dict["password"]
            return self._send_json({"success": True, "user": user_dict})

        return self._send_json({"error": "Endpoint not found"}, status=404)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # API: Delete Memory
        if path.startswith("/api/memories/"):
            mem_id = path.split("/")[3]
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM memories WHERE id = ?", (mem_id,))
            conn.commit()
            conn.close()
            return self._send_json({"success": True, "message": f"Momen {mem_id} dihapus dari database."})

        # API: Delete Note
        elif path.startswith("/api/notes/"):
            note_id = path.split("/")[3]
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))
            conn.commit()
            conn.close()
            return self._send_json({"success": True, "message": f"Pesan {note_id} dihapus dari database."})

        return self._send_json({"error": "Endpoint not found"}, status=404)

def get_local_ip():
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def run_server():
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

    init_db()
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, JCHttpHandler)
    local_ip = get_local_ip()
    print("=" * 65)
    print("  [JC CULINARY] SERVER & DATABASE (SQLite) AKTIF!")
    print("=" * 65)
    print(f"  * Akses di Laptop ini       : http://localhost:{PORT}")
    print(f"  * Akses di HP / Device Lain : http://{local_ip}:{PORT}")
    print("=" * 65)
    print(f"  * Database Path            : {DB_PATH}")
    print("  * Akun Admin               : jikul@gmail.com (Pass: 112233)")
    print("=" * 65)
    print("  [INFO] Setiap upload dari device mana pun akan tersimpan")
    print("         ke database ini & otomatis tersinkronisasi!")
    print("=" * 65)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Server dihentikan]")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
