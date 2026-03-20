#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."

until pg_isready -h postgres -p 5432 -U fecs_user 2>/dev/null; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

>&2 echo "PostgreSQL is up - executing command"

echo "Running database migrations..."
alembic upgrade head

echo "Creating admin user if not exists..."
python -c "
from app.database import SessionLocal
from app.models import User, UserRole
from app.services.auth_service import get_password_hash

db = SessionLocal()
try:
    existing = db.query(User).filter_by(username='admin').first()
    if not existing:
        admin = User(
            username='admin',
            password_hash=get_password_hash('admin123'),
            role=UserRole.ADMIN,
            email='admin@fecs.local',
            employee_id='EMP_ADMIN_001'
        )
        db.add(admin)
        db.commit()
        print('Admin user created successfully')
    else:
        print('Admin user already exists')
except Exception as e:
    print(f'Error creating admin user: {e}')
    db.rollback()
finally:
    db.close()
"

echo "Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
