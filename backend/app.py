#!/usr/bin/env python3
"""TiFlow public qualification backend: stdlib only, no financial transactions."""
import hmac
import json
import os
import re
import sqlite3
import sys
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
from compare import init_quotes, add_quote, quotes_for

DB_PATH = Path(os.getenv("TIFLOW_DB", "/var/lib/tiflow/tiflow.sqlite3"))
ALLOWED_ORIGIN = os.getenv("TIFLOW_ALLOWED_ORIGIN", "https://cvlad97.github.io").rstrip("/")
HOST = os.getenv("TIFLOW_HOST", "127.0.0.1")
PORT = int(os.getenv("TIFLOW_PORT", "18762"))
ADMIN_TOKEN = os.getenv("TIFLOW_ADMIN_TOKEN", "")
CONTACTS_ENABLED = os.getenv("TIFLOW_CONTACTS_ENABLED", "false").lower() == "true"
CATEGORIES = ["Transport & camions", "Industrie & machines", "Immobilier & locaux",
              "Agriculture", "Commerce & services", "Énergie & équipements"]
EMAIL = re.compile(r"^[^@\s]{1,75}@[^@\s]{3,125}$")
VALID_STATUS = {"pending_review", "approved", "rejected"}


def connect():
    conn = sqlite3.connect(DB_PATH, timeout=5)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA busy_timeout = 5000")
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    DB_PATH.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    with connect() as conn:
        conn.execute("PRAGMA journal_mode=WAL")
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS requests(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          name TEXT NOT NULL, email TEXT NOT NULL,
          category TEXT NOT NULL, need TEXT NOT NULL,
          budget TEXT NOT NULL DEFAULT '', location TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'new',
          consent INTEGER NOT NULL DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS rate_limits(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_key TEXT NOT NULL, created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS rate_limits_client_idx ON rate_limits(client_key,created_at);
        CREATE TABLE IF NOT EXISTS opportunities(
          id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL,
          source_name TEXT NOT NULL, source_url TEXT NOT NULL,
          published_at TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          status TEXT NOT NULL DEFAULT 'pending_review'
        );
        CREATE INDEX IF NOT EXISTS opportunities_status_idx ON opportunities(status);
        """)
        init_quotes(conn)


def clean_text(value, limit):
    if not isinstance(value, str):
        raise ValueError("Format texte requis.")
    value = " ".join(value.strip().split())
    if len(value) > limit:
        raise ValueError("Champ trop long.")
    return value


class Handler(BaseHTTPRequestHandler):
    server_version = "TiFlowAPI/0.1"
    sys_version = ""

    def log_message(self, fmt, *args):
        # URLs, email addresses and message bodies must not be logged.
        sys.stderr.write("tiflow %s %s\n" % (self.address_string(), fmt % args))

    def headers_secure(self, content_type="application/json; charset=utf-8"):
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
        self.send_header("Vary", "Origin")

    def respond(self, code, obj):
        data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.headers_secure()
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def origin_ok(self):
        return self.headers.get("Origin") == ALLOWED_ORIGIN

    def authorized(self):
        auth = self.headers.get("Authorization", "")
        return bool(ADMIN_TOKEN) and hmac.compare_digest(auth, "Bearer " + ADMIN_TOKEN)

    def do_OPTIONS(self):
        if not self.origin_ok():
            self.respond(403, {"error": "origin_not_allowed"})
            return
        self.send_response(204)
        self.headers_secure()
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Max-Age", "600")
        self.end_headers()

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == "/health":
            self.respond(200, {"status": "ok", "service": "tiflow-qualification",
                               "contacts_enabled": CONTACTS_ENABLED, "financial_transactions": False})
        elif path == "/api/v1/categories":
            self.respond(200, {"data": CATEGORIES})
        elif path == "/api/v1/opportunities":
            with connect() as conn:
                rows = conn.execute("""SELECT id,title,category,source_name,source_url,published_at,status
                  FROM opportunities WHERE status='approved'
                  ORDER BY published_at DESC LIMIT 50""").fetchall()
            self.respond(200, {"data": [dict(r) for r in rows]})
        elif path == "/api/v1/admin/requests":
            if not self.authorized():
                self.respond(401, {"error": "unauthorized"})
                return
            with connect() as conn:
                rows = conn.execute("SELECT id,created_at,name,email,category,need,budget,location,status FROM requests ORDER BY id DESC LIMIT 100").fetchall()
            self.respond(200, {"data": [dict(r) for r in rows]})
        elif path == "/api/v1/admin/opportunities":
            if not self.authorized():
                self.respond(401, {"error": "unauthorized"})
                return
            with connect() as conn:
                rows = conn.execute("SELECT * FROM opportunities ORDER BY created_at DESC LIMIT 100").fetchall()
            self.respond(200, {"data": [dict(r) for r in rows]})
        elif path == "/api/v1/admin/quotes":
            if not self.authorized():
                self.respond(401, {"error": "unauthorized"})
                return
            try:
                request_id = int(parse_qs(urlsplit(self.path).query).get("request_id", ["0"])[0])
                if request_id <= 0: raise ValueError("Identifiant de demande requis")
                with connect() as conn:
                    records = quotes_for(conn, request_id)
                self.respond(200, {"data": records, "note": "Classement uniquement entre offres vérifiées à spécifications et quantités identiques."})
            except ValueError:
                self.respond(400, {"error": "invalid_request_id"})
        else:
            self.respond(404, {"error": "not_found"})

    def read_body(self):
        if "application/json" not in self.headers.get("Content-Type", ""):
            raise ValueError("Contenu JSON requis.")
        try:
            size = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            raise ValueError("Taille de requête invalide.")
        if size < 2 or size > 12000:
            raise ValueError("Taille de requête invalide.")
        try:
            obj = json.loads(self.rfile.read(size))
        except (ValueError, UnicodeDecodeError):
            raise ValueError("JSON invalide.")
        if not isinstance(obj, dict):
            raise ValueError("Objet JSON requis.")
        return obj

    def do_POST(self):
        path = urlsplit(self.path).path
        if path == "/api/v1/admin/quotes":
            if not self.authorized():
                self.respond(401, {"error": "unauthorized"})
                return
            try:
                data = self.read_body()
                with connect() as conn:
                    quote_id = add_quote(conn, data)
                self.respond(201, {"id": quote_id, "status": "pending_review"})
            except (ValueError, TypeError, sqlite3.Error) as e:
                self.respond(400, {"error": "invalid_quote", "message": str(e)[:110]})
            return
        if path != "/api/v1/requests":
            self.respond(404, {"error": "not_found"})
            return
        if not CONTACTS_ENABLED:
            self.respond(503, {"error": "contacts_not_enabled"})
            return
        if not self.origin_ok():
            self.respond(403, {"error": "origin_not_allowed"})
            return
        try:
            d = self.read_body()
            if d.get("website"):
                self.respond(202, {"status": "pending_review"})
                return
            if d.get("consent") is not True:
                raise ValueError("Consentement de contact requis.")
            name = clean_text(d.get("name"), 100)
            email = clean_text(d.get("email"), 160).lower()
            category = clean_text(d.get("category"), 100)
            need = clean_text(d.get("need"), 2000)
            budget = clean_text(d.get("budget", ""), 60)
            location = clean_text(d.get("location"), 100)
            if len(name)<2 or not EMAIL.fullmatch(email) or category not in CATEGORIES or len(need)<15 or len(location)<2:
                raise ValueError("Informations incomplètes.")
            # Socket peer is trustworthy here: only the reverse proxy can access the loopback listener.
            client_key = self.client_address[0]
            now = int(time.time())
            with connect() as conn:
                conn.execute("DELETE FROM rate_limits WHERE created_at<?", (now-86400,))
                count = conn.execute("SELECT COUNT(*) FROM rate_limits WHERE client_key=? AND created_at>?", (client_key, now-3600)).fetchone()[0]
                if count >= 6:
                    self.respond(429, {"error": "rate_limited"})
                    return
                conn.execute("INSERT INTO rate_limits(client_key,created_at) VALUES(?,?)", (client_key,now))
                cur = conn.execute("""INSERT INTO requests(name,email,category,need,budget,location,consent)
                   VALUES(?,?,?,?,?,?,1)""", (name,email,category,need,budget,location))
            self.respond(201, {"id": cur.lastrowid, "status": "pending_review"})
        except (ValueError, TypeError) as e:
            self.respond(400, {"error": "validation_failed", "message": str(e)})
        except sqlite3.Error:
            self.respond(503, {"error": "storage_unavailable"})

    def do_PATCH(self):
        path = urlsplit(self.path).path
        if path.startswith("/api/v1/admin/quotes/"):
            if not self.authorized():
                self.respond(401, {"error": "unauthorized"})
                return
            try:
                quote_id=int(path.rsplit("/",1)[-1])
                data=self.read_body()
                if not isinstance(data.get("verified"),bool): raise ValueError("Validation booléenne requise")
                with connect() as conn:
                    count=conn.execute("UPDATE quotes SET verified=? WHERE id=?",(int(data["verified"]),quote_id)).rowcount
                self.respond(200 if count else 404, {"status": "updated" if count else "not_found"})
            except (ValueError, sqlite3.Error) as e:
                self.respond(400, {"error": "invalid_quote_status", "message": str(e)[:110]})
            return
        parts = path.split("/")
        if len(parts) != 6 or parts[1:5] != ["api","v1","admin","opportunities"]:
            self.respond(404, {"error": "not_found"})
            return
        if not self.authorized():
            self.respond(401, {"error": "unauthorized"})
            return
        try:
            d = self.read_body()
            status = d.get("status")
            if status not in VALID_STATUS:
                raise ValueError("Statut invalide.")
            with connect() as conn:
                changed = conn.execute("UPDATE opportunities SET status=? WHERE id=?", (status, parts[5])).rowcount
            self.respond(200 if changed else 404, {"status": status if changed else "not_found"})
        except ValueError as e:
            self.respond(400, {"error": str(e)})


if __name__ == "__main__":
    init_db()
    print(f"TiFlow backend listening on {HOST}:{PORT} (finance disabled)", flush=True)
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
