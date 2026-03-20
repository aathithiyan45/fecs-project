# Docker Setup for FECS

## Quick Start

### 1. Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+

### 2. Setup Environment
```bash
# Copy environment template
copy .env.example .env

# Edit .env and set SECRET_KEY (generate with: openssl rand -hex 32)
```

### 3. Build and Run
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- MQTT Broker: localhost:1883

### 5. Default Credentials
- Username: `admin` or Employee ID: `EMP_ADMIN_001`
- Password: `admin123`
- **Change password after first login**

## Docker Services

### postgres
- PostgreSQL 16.13 database
- Port: 5432
- Volume: postgres_data (persistent storage)

### mosquitto
- Eclipse Mosquitto MQTT broker
- Ports: 1883 (MQTT), 9001 (WebSocket)
- Volumes: mosquitto_data, mosquitto_logs

### backend
- FastAPI application
- Port: 8000
- Auto-runs migrations on startup
- Auto-creates admin user if not exists

### frontend
- React.js application
- Port: 3000
- Development server with hot reload

## Useful Commands

```bash
# View running containers
docker-compose ps

# Restart specific service
docker-compose restart backend

# View service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Execute command in container
docker-compose exec backend bash
docker-compose exec postgres psql -U fecs_user -d fecs_db

# Rebuild after code changes
docker-compose up -d --build

# Test MQTT
docker-compose exec mosquitto mosquitto_pub -t fecs/incoming -m "test001|DEV_001|10.9347|78.1212|E|M|1705315800|1|A3F2"
```

## Production Deployment

### 1. Update docker-compose.yml
- Remove volume mounts for code (./backend:/app, ./frontend:/app)
- Set proper SECRET_KEY in .env
- Configure strong database password
- Enable MQTT authentication

### 2. Build Production Images
```bash
# Build optimized images
docker-compose build --no-cache

# Tag for registry
docker tag fecs_backend:latest your-registry/fecs_backend:v1.0
docker tag fecs_frontend:latest your-registry/fecs_frontend:v1.0
```

### 3. Security Hardening
- Change default admin password
- Enable MQTT authentication
- Use secrets management
- Configure firewall rules
- Enable SSL/TLS

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Verify database connection
docker-compose exec postgres pg_isready -U fecs_user

# Manually run migrations
docker-compose exec backend alembic upgrade head
```

### Frontend can't connect to backend
- Check REACT_APP_API_URL in docker-compose.yml
- Verify backend is running: `docker-compose ps`
- Check network: `docker network inspect forest_emergency_communication_fecs_network`

### MQTT connection issues
```bash
# Test MQTT broker
docker-compose exec mosquitto mosquitto_sub -t '#' -v

# Check mosquitto logs
docker-compose logs mosquitto
```

### Database reset
```bash
# WARNING: Deletes all data
docker-compose down -v
docker-compose up -d
```

## Development Workflow

### Hot Reload Enabled
- Backend: Code changes auto-reload (volume mounted)
- Frontend: React hot reload active (volume mounted)

### Database Migrations
```bash
# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "description"

# Apply migrations
docker-compose exec backend alembic upgrade head

# Rollback
docker-compose exec backend alembic downgrade -1
```

## Network Architecture

```
┌─────────────────────────────────────────┐
│         fecs_network (bridge)           │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │ Frontend │  │ Backend  │           │
│  │  :3000   │  │  :8000   │           │
│  └────┬─────┘  └────┬─────┘           │
│       │             │                  │
│       │      ┌──────┴──────┐          │
│       │      │             │          │
│       │  ┌───▼────┐  ┌────▼─────┐    │
│       │  │Postgres│  │Mosquitto │    │
│       │  │ :5432  │  │  :1883   │    │
│       │  └────────┘  └──────────┘    │
│       │                               │
└───────┼───────────────────────────────┘
        │
   ┌────▼────┐
   │ Browser │
   └─────────┘
```
