"""WSGI entry point for Gunicorn"""
import sys
from app import app, db

# Initialize database tables immediately when WSGI starts
try:
    with app.app_context():
        db.create_all()
        print("WSGI: Database tables created/verified successfully", file=sys.stderr)
except Exception as e:
    print(f"WSGI: Database initialization error: {e}", file=sys.stderr)

if __name__ == "__main__":
    app.run()
