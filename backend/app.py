from __future__ import annotations

import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = BASE_DIR / "uploads"
STATIC_DIR = BASE_DIR / "static"
DB_PATH = DATA_DIR / "reports.db"

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                status TEXT NOT NULL CHECK(status IN ('lost', 'found')),
                title TEXT NOT NULL,
                description TEXT,
                lat REAL NOT NULL,
                lng REAL NOT NULL,
                contact_phone TEXT NOT NULL DEFAULT '',
                photo_url TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        cols = conn.execute("PRAGMA table_info(reports)").fetchall()
        col_names = {row[1] for row in cols}
        if "contact_phone" not in col_names:
            conn.execute(
                "ALTER TABLE reports ADD COLUMN contact_phone TEXT NOT NULL DEFAULT ''"
            )
        conn.commit()


def blur_coordinate(value: float) -> float:
    # 2 decimal places is roughly neighborhood-level precision.
    return round(value, 2)


app = Flask(__name__, static_folder=str(STATIC_DIR), static_url_path="")
init_db()


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/reports")
def list_reports():
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT id, status, title, description, lat, lng, contact_phone, photo_url, created_at
            FROM reports
            ORDER BY created_at DESC
            """
        ).fetchall()

    reports = [dict(row) for row in rows]
    return jsonify({"reports": reports})


@app.post("/api/reports")
def create_report():
    status = request.form.get("status", "")
    title = request.form.get("title", "")
    description = request.form.get("description", "")
    contact_phone = request.form.get("contact_phone", "")
    lat_raw = request.form.get("lat", "")
    lng_raw = request.form.get("lng", "")
    photo = request.files.get("photo")

    clean_status = status.strip().lower()
    if clean_status not in {"lost", "found"}:
        return jsonify({"detail": "status must be 'lost' or 'found'"}), 400

    if not title.strip():
        return jsonify({"detail": "title is required"}), 400
    clean_phone = "".join(ch for ch in contact_phone if ch.isdigit())
    if not clean_phone:
        return jsonify({"detail": "contact phone is required"}), 400

    try:
        lat = float(lat_raw)
        lng = float(lng_raw)
    except ValueError:
        return jsonify({"detail": "lat/lng must be numbers"}), 400

    if photo is None:
        return jsonify({"detail": "photo is required"}), 400

    if photo.content_type not in ALLOWED_IMAGE_TYPES:
        return jsonify({"detail": "photo must be jpg/png/webp"}), 400

    file_bytes = photo.read()
    if len(file_bytes) > MAX_PHOTO_SIZE_BYTES:
        return jsonify({"detail": "photo is too large (max 5MB)"}), 400

    ext = Path(photo.filename or "").suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
        ext = ".jpg"

    report_id = str(uuid.uuid4())
    filename = f"{report_id}{ext}"
    output_path = UPLOAD_DIR / filename
    output_path.write_bytes(file_bytes)

    blurred_lat = blur_coordinate(lat)
    blurred_lng = blur_coordinate(lng)
    created_at = datetime.now(timezone.utc).isoformat()
    photo_url = f"/uploads/{filename}"

    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO reports (id, status, title, description, lat, lng, contact_phone, photo_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                report_id,
                clean_status,
                title.strip(),
                description.strip(),
                blurred_lat,
                blurred_lng,
                clean_phone,
                photo_url,
                created_at,
            ),
        )
        conn.commit()

    return (
        jsonify(
        {
            "report": {
                "id": report_id,
                "status": clean_status,
                "title": title.strip(),
                "description": description.strip(),
                "lat": blurred_lat,
                "lng": blurred_lng,
                "contact_phone": clean_phone,
                "photo_url": photo_url,
                "created_at": created_at,
            }
        }
        ),
        201,
    )


@app.get("/uploads/<path:filename>")
def uploaded_file(filename: str):
    return send_from_directory(UPLOAD_DIR, filename)


@app.get("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")


if __name__ == "__main__":
    # Disable Flask debugger/reloader to avoid ctypes dependency on this host.
    app.run(host="0.0.0.0", port=8000, debug=False, use_reloader=False)
