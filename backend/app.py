import os
import sqlite3
import bcrypt
from datetime import timedelta
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, create_refresh_token
)
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:5179",
        "http://localhost:5180",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "http://127.0.0.1:5177",
        "http://127.0.0.1:5178",
        "http://127.0.0.1:5179",
        "http://127.0.0.1:5180",
    ]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)

@app.after_request
def after_request(response):
    origin = request.headers.get("Origin", "")
    allowed = [
        "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180",
        "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175", "http://127.0.0.1:5176", "http://127.0.0.1:5177", "http://127.0.0.1:5178", "http://127.0.0.1:5179", "http://127.0.0.1:5180",
    ]
    if origin in allowed:
        response.headers["Access-Control-Allow-Origin"]      = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"]     = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"]     = "GET, POST, PUT, DELETE, OPTIONS"
    return response

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        origin = request.headers.get("Origin", "")
        allowed = [
            "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180",
            "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175", "http://127.0.0.1:5176", "http://127.0.0.1:5177", "http://127.0.0.1:5178", "http://127.0.0.1:5179", "http://127.0.0.1:5180",
        ]
        if origin in allowed:
            res = app.make_default_options_response()
            res.headers["Access-Control-Allow-Origin"]      = origin
            res.headers["Access-Control-Allow-Credentials"] = "true"
            res.headers["Access-Control-Allow-Headers"]     = "Content-Type, Authorization"
            res.headers["Access-Control-Allow-Methods"]     = "GET, POST, PUT, DELETE, OPTIONS"
            return res

@app.before_request
def log_request():
    print(f"[{request.method}] {request.path} | Origin: {request.headers.get('Origin', 'none')}")

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "curriculum-ai-super-secret-key-2025")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)

jwt = JWTManager(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "curriculum_ai.db")


# ─── Database ────────────────────────────────────────────────────────────────

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db:
        db.close()


import json

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT    NOT NULL,
                email       TEXT    NOT NULL UNIQUE,
                password    TEXT    NOT NULL,
                provider    TEXT    NOT NULL DEFAULT 'local',
                photo_url   TEXT,
                firebase_uid TEXT,
                created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
                reset_token TEXT,
                phone       TEXT,
                institution TEXT,
                role        TEXT,
                bio         TEXT,
                country     TEXT,
                timezone    TEXT
            )
        """)
        # Ensure older tables are migrated to include newer columns
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        
        for col in ["photo_url", "firebase_uid", "reset_token", "phone", "institution", "role", "bio", "country", "timezone"]:
            if col not in columns:
                conn.execute(f"ALTER TABLE users ADD COLUMN {col} TEXT")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS history_records (
                id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id             INTEGER NOT NULL,
                role                TEXT NOT NULL,
                program_name        TEXT NOT NULL,
                domain              TEXT NOT NULL,
                industry_focus      TEXT NOT NULL,
                education_level     TEXT NOT NULL,
                semester_count      INTEGER NOT NULL,
                date_generated      TEXT NOT NULL,
                pdf_export_status   INTEGER NOT NULL DEFAULT 0,
                json_export_status  INTEGER NOT NULL DEFAULT 0,
                curriculum_data     TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
            
        conn.commit()



# ─── Helpers ─────────────────────────────────────────────────────────────────

def user_row_to_dict(row):
    d = {
        "id":           row["id"],
        "name":         row["name"],
        "email":        row["email"],
        "provider":     row["provider"],
        "photo_url":    row["photo_url"] if "photo_url" in row.keys() else None,
        "firebase_uid": row["firebase_uid"] if "firebase_uid" in row.keys() else None,
        "created_at":   row["created_at"],
    }
    for col in ["phone", "institution", "role", "bio", "country", "timezone"]:
        d[col] = row[col] if col in row.keys() else None
    return d


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name     = (data.get("name") or "").strip()
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    db = get_db()
    existing = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    cur = db.execute(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        (name, email, hashed)
    )
    db.commit()

    user = db.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    access_token  = create_access_token(identity=str(user["id"]))
    refresh_token = create_refresh_token(identity=str(user["id"]))

    return jsonify({
        "message": "Account created",
        "user":    user_row_to_dict(user),
        "access_token":  access_token,
        "refresh_token": refresh_token,
    }), 201


@app.route("/api/login", methods=["POST"])
def login():
    data     = request.get_json(silent=True) or {}
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    db   = get_db()
    user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

    if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token  = create_access_token(identity=str(user["id"]))
    refresh_token = create_refresh_token(identity=str(user["id"]))

    return jsonify({
        "message": "Login successful",
        "user":    user_row_to_dict(user),
        "access_token":  access_token,
        "refresh_token": refresh_token,
    }), 200


@app.route("/api/logout", methods=["POST"])
@jwt_required()
def logout():
    # JWT is stateless; client discards tokens. Server-side blocklist optional.
    return jsonify({"message": "Logged out"}), 200


import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_reset_email(email, reset_link):
    smtp_host = os.getenv("SMTP_HOST", "localhost")
    smtp_port = int(os.getenv("SMTP_PORT", 1025))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASS", "")
    smtp_sender = os.getenv("SMTP_SENDER", "noreply@syllabix.com")
    smtp_tls = os.getenv("SMTP_TLS", "False").lower() in ("true", "1", "yes")
    smtp_ssl = os.getenv("SMTP_SSL", "False").lower() in ("true", "1", "yes")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset Your Password - SyllabiX"
    msg["From"] = smtp_sender
    msg["To"] = email

    text_content = f"Please reset your password by clicking on the following link: {reset_link}"
    html_content = f"""
    <html>
      <body style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Reset Your Password</h2>
        <p>You requested a password reset for your SyllabiX account.</p>
        <p>Please click the button below to set a new password:</p>
        <div style="margin: 24px 0;">
          <a href="{reset_link}" style="background-color: #5B5FEF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="{reset_link}">{reset_link}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </body>
    </html>
    """
    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    server = None
    try:
        if smtp_ssl:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
            if smtp_tls or smtp_port == 587:
                server.starttls()
                
        if smtp_user and smtp_pass:
            try:
                server.login(smtp_user, smtp_pass)
            except smtplib.SMTPAuthenticationError as ae:
                print(f"[SMTP DIAGNOSTIC] SMTP Authentication Failed: {ae}")
                raise Exception(f"SMTP Authentication Failed: {ae}")
            
        server.sendmail(smtp_sender, [email], msg.as_string())
        print(f"[SMTP DIAGNOSTIC] Email Sent Successfully to {email}")
    except smtplib.SMTPConnectError as ce:
        print(f"[SMTP DIAGNOSTIC] SMTP Connection Failed: {ce}")
        raise Exception(f"SMTP Connection Failed: {ce}")
    except Exception as e:
        if "Authentication Failed" in str(e):
            raise e
        print(f"[SMTP DIAGNOSTIC] Email Delivery Failed: {e}")
        raise e
    finally:
        if server:
            try:
                server.quit()
            except Exception:
                pass


@app.route("/api/forgot-password", methods=["POST"])
def forgot_password():
    data  = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        print("[SMTP DIAGNOSTIC] Forgot Password Request Failed: Email is required")
        return jsonify({"error": "Email is required"}), 400

    db   = get_db()
    user = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()

    if not user:
        print(f"[SMTP DIAGNOSTIC] User Not Found: {email}")
        return jsonify({"error": "User Not Found"}), 404

    import secrets
    token = secrets.token_urlsafe(32)
    db.execute("UPDATE users SET reset_token = ? WHERE id = ?", (token, user["id"]))
    db.commit()

    origin = request.headers.get("Origin") or "http://localhost:5173"
    reset_link = f"{origin}/reset-password?token={token}"
    print(f"[SMTP DIAGNOSTIC] Reset token generated: {token}")
    print(f"[SMTP DIAGNOSTIC] Reset link created: {reset_link}")

    try:
        send_reset_email(email, reset_link)
    except Exception as e:
        err_msg = str(e)
        if "Authentication Failed" in err_msg:
            print("[SMTP DIAGNOSTIC] SMTP Authentication Failed")
            return jsonify({"error": "SMTP Authentication Failed"}), 500
        elif "Connection Failed" in err_msg:
            print("[SMTP DIAGNOSTIC] SMTP Connection Failed")
            return jsonify({"error": "SMTP Connection Failed"}), 500
        else:
            print(f"[SMTP DIAGNOSTIC] Email Delivery Failed")
            return jsonify({"error": "Email Delivery Failed"}), 500

    print(f"[SMTP DIAGNOSTIC] Email Sent Successfully")
    return jsonify({"message": "Password reset link has been sent to your email"}), 200



@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json(silent=True) or {}
    token = data.get("token") or ""
    password = data.get("password") or ""

    if not token or not password:
        return jsonify({"error": "Token and password are required"}), 400

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    db = get_db()
    user = db.execute("SELECT id FROM users WHERE reset_token = ?", (token,)).fetchone()

    if not user:
        return jsonify({"error": "Invalid or expired reset token"}), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    db.execute("UPDATE users SET password = ?, reset_token = NULL WHERE id = ?", (hashed, user["id"]))
    db.commit()

    return jsonify({"message": "Password has been reset successfully"}), 200


@app.route("/api/google-auth", methods=["POST"])
def google_auth():
    """Handle Google OAuth — receives verified profile from Firebase client SDK."""
    data         = request.get_json(silent=True) or {}
    name         = (data.get("name") or "").strip()
    email        = (data.get("email") or "").strip().lower()
    photo_url    = data.get("photoURL") or data.get("photo_url") or ""
    firebase_uid = data.get("uid") or ""

    if not email:
        return jsonify({"error": "Invalid Google credentials"}), 400

    db   = get_db()
    user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

    if not user:
        cur = db.execute(
            "INSERT INTO users (name, email, password, provider, photo_url, firebase_uid) VALUES (?, ?, ?, ?, ?, ?)",
            (name, email, "", "google", photo_url, firebase_uid)
        )
        db.commit()
        user = db.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    else:
        # Update photo/uid if they changed
        db.execute(
            "UPDATE users SET photo_url = ?, firebase_uid = ? WHERE id = ?",
            (photo_url, firebase_uid, user["id"])
        )
        db.commit()
        user = db.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()

    access_token  = create_access_token(identity=str(user["id"]))
    refresh_token = create_refresh_token(identity=str(user["id"]))

    return jsonify({
        "message": "Google login successful",
        "user":    user_row_to_dict(user),
        "access_token":  access_token,
        "refresh_token": refresh_token,
    }), 200


@app.route("/api/profile", methods=["GET", "PUT"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    db      = get_db()
    
    if request.method == "GET":
        user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"user": user_row_to_dict(user)}), 200

    # Handle PUT to update profile info
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    institution = (data.get("institution") or "").strip()
    role = (data.get("role") or "").strip()
    bio = (data.get("bio") or "").strip()
    country = (data.get("country") or "").strip()
    timezone = (data.get("timezone") or "").strip()
    photo_url = data.get("photo_url") or ""

    if not name or not email:
        return jsonify({"error": "Name and email are required"}), 400

    # Phone Number Validation
    if phone:
        # Check that it contains only digits and length is exactly 10
        if not phone.isdigit() or len(phone) != 10:
            return jsonify({"error": "Please enter a valid 10-digit phone number."}), 400

    # Check email uniqueness if email changed
    current_user = db.execute("SELECT email FROM users WHERE id = ?", (user_id,)).fetchone()
    if not current_user:
        return jsonify({"error": "User not found"}), 404
        
    if current_user["email"].lower() != email:
        existing = db.execute("SELECT id FROM users WHERE email = ? AND id != ?", (email, user_id)).fetchone()
        if existing:
            return jsonify({"error": "Email already registered"}), 409

    db.execute("""
        UPDATE users
        SET name = ?, email = ?, phone = ?, institution = ?, role = ?, bio = ?, country = ?, timezone = ?, photo_url = ?
        WHERE id = ?
    """, (name, email, phone, institution, role, bio, country, timezone, photo_url, user_id))
    db.commit()

    updated_user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return jsonify({
        "message": "Profile updated successfully",
        "user": user_row_to_dict(updated_user)
    }), 200


@app.route("/api/history", methods=["GET"])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    role = request.args.get("role", "").strip()
    db = get_db()
    
    if role:
        cursor = db.execute(
            "SELECT * FROM history_records WHERE user_id = ? AND role = ? ORDER BY date_generated DESC",
            (user_id, role)
        )
    else:
        cursor = db.execute(
            "SELECT * FROM history_records WHERE user_id = ? ORDER BY date_generated DESC",
            (user_id,)
        )
        
    rows = cursor.fetchall()
    records = []
    for r in rows:
        try:
            curr_data = json.loads(r["curriculum_data"])
        except Exception:
            curr_data = {}
            
        records.append({
            "id": r["id"],
            "user_id": r["user_id"],
            "role": r["role"],
            "program_name": r["program_name"],
            "domain": r["domain"],
            "industry_focus": r["industry_focus"],
            "education_level": r["education_level"],
            "semester_count": r["semester_count"],
            "date_generated": r["date_generated"],
            "pdf_export_status": bool(r["pdf_export_status"]),
            "json_export_status": bool(r["json_export_status"]),
            "curriculum_data": curr_data
        })
    return jsonify(records), 200


@app.route("/api/history", methods=["POST"])
@jwt_required()
def add_history():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    
    role = data.get("role") or "faculty"
    program_name = data.get("program_name") or ""
    domain = data.get("domain") or data.get("skill") or ""
    industry_focus = data.get("industry_focus") or ""
    education_level = data.get("education_level") or ""
    
    # Calculate semester count
    semester_count = data.get("semester_count")
    if semester_count is None:
        duration = data.get("program_duration") or ""
        try:
            semester_count = int(duration.split()[0])
        except Exception:
            semester_count = 4
            
    date_generated = data.get("date_generated") or data.get("createdAt") or ""
    pdf_export_status = 1 if data.get("pdf_export_status") else 0
    json_export_status = 1 if data.get("json_export_status") else 0
    
    curr_data = data.get("curriculum_data")
    if not curr_data:
        curr_data = data
        if "program_name" in data:
            program_name = data["program_name"]
        if "skill" in data:
            domain = data["skill"]
        if "industry_focus" in data:
            industry_focus = data["industry_focus"]
        if "education_level" in data:
            education_level = data["education_level"]
        if "createdAt" in data:
            date_generated = data["createdAt"]
            
    curr_data_str = json.dumps(curr_data)
    
    db = get_db()
    cursor = db.execute("""
        INSERT INTO history_records 
        (user_id, role, program_name, domain, industry_focus, education_level, semester_count, date_generated, pdf_export_status, json_export_status, curriculum_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, role, program_name, domain, industry_focus, education_level, semester_count, date_generated, pdf_export_status, json_export_status, curr_data_str))
    db.commit()
    
    new_id = cursor.lastrowid
    return jsonify({"message": "History saved successfully", "id": new_id}), 201


@app.route("/api/history/<int:record_id>", methods=["DELETE"])
@jwt_required()
def delete_history(record_id):
    user_id = get_jwt_identity()
    db = get_db()
    
    record = db.execute("SELECT id FROM history_records WHERE id = ? AND user_id = ?", (record_id, user_id)).fetchone()
    if not record:
        return jsonify({"error": "History record not found or unauthorized"}), 404
        
    db.execute("DELETE FROM history_records WHERE id = ?", (record_id,))
    db.commit()
    return jsonify({"message": "History deleted successfully"}), 200


@app.route("/api/history/<int:record_id>/export", methods=["PUT"])
@jwt_required()
def update_export_status(record_id):
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    export_type = data.get("type")
    status = 1 if data.get("status") else 0
    
    if export_type not in ["pdf", "json"]:
        return jsonify({"error": "Invalid export type"}), 400
        
    db = get_db()
    record = db.execute("SELECT id, curriculum_data FROM history_records WHERE id = ? AND user_id = ?", (record_id, user_id)).fetchone()
    if not record:
        return jsonify({"error": "History record not found or unauthorized"}), 404
        
    try:
        curr_data = json.loads(record["curriculum_data"])
    except Exception:
        curr_data = {}
        
    if export_type == "pdf":
        db.execute("UPDATE history_records SET pdf_export_status = ? WHERE id = ?", (status, record_id))
        curr_data["pdf_export_status"] = bool(status)
    else:
        db.execute("UPDATE history_records SET json_export_status = ? WHERE id = ?", (status, record_id))
        curr_data["json_export_status"] = bool(status)
        
    db.execute("UPDATE history_records SET curriculum_data = ? WHERE id = ?", (json.dumps(curr_data), record_id))
    db.commit()
    return jsonify({"message": "Export status updated successfully"}), 200



@app.route("/", methods=["GET"])
def root():
    return jsonify({"status": "running", "service": "SyllabiX Auth API", "version": "1.0"}), 200


@app.route("/health", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "SyllabiX Auth API"}), 200


# ─── Bootstrap ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    print("")
    print("[OK] SyllabiX backend running on http://localhost:5000")
    print("")
    print("[ROUTES]")
    for rule in sorted(app.url_map.iter_rules(), key=lambda r: r.rule):
        methods = ", ".join(sorted(m for m in rule.methods if m != "HEAD"))
        print(f"  {methods:<30} {rule.rule}")
    print("")
    app.run(debug=True, port=5000, use_reloader=False)
