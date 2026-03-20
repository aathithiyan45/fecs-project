# FECS Deployment Guide for Team Members

## Prerequisites
- Docker Desktop installed (Windows/Mac) or Docker Engine (Linux)
- 4GB RAM minimum
- 10GB free disk space

## Quick Start (Using Project Files)

### Step 1: Get the Project
```bash
# Copy the entire forest_emergency_communication folder to your machine
```

### Step 2: Start the Application
```bash
cd forest_emergency_communication
docker compose up -d
```

### Step 3: Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs
- Login: admin / admin123

### Step 4: Stop the Application
```bash
docker compose down
```

## Deployment Options

### Option A: Local Development (Hot Reload)
For developers who want to modify code:

```bash
# Edit docker-compose.yml and add volume mounts:
# Under backend service:
    volumes:
      - ./backend:/app

# Under frontend service:
    volumes:
      - ./frontend:/app
      - /app/node_modules

# Then run:
docker compose up
```

### Option B: Production Deployment (Standalone)
For deploying to remote servers:

1. **Build and save images:**
```bash
# On your machine (where you have the code)
docker compose build
docker save forest_emergency_communication-backend:latest -o fecs_backend.tar
docker save forest_emergency_communication-frontend:latest -o fecs_frontend.tar
```

2. **Transfer to target machine:**
- Copy `fecs_backend.tar`, `fecs_frontend.tar`, and `docker-compose.yml` to target machine

3. **Load and run on target machine:**
```bash
docker load -i fecs_backend.tar
docker load -i fecs_frontend.tar
docker compose up -d
```

### Option C: Docker Registry (Best for Teams)
Push images to Docker Hub or private registry:

```bash
# Tag images
docker tag forest_emergency_communication-backend:latest yourusername/fecs-backend:v1.0
docker tag forest_emergency_communication-frontend:latest yourusername/fecs-frontend:v1.0

# Push to Docker Hub
docker push yourusername/fecs-backend:v1.0
docker push yourusername/fecs-frontend:v1.0

# Team members pull and run:
docker pull yourusername/fecs-backend:v1.0
docker pull yourusername/fecs-frontend:v1.0
docker compose up -d
```

## Network Configuration

### Same Network (LAN) Access
If friends want to access from other computers on the same network:

1. Find your IP address:
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

2. Friends access via:
- Frontend: http://YOUR_IP:3000
- Backend: http://YOUR_IP:8000

3. Update frontend environment in docker-compose.yml:
```yaml
frontend:
  environment:
    REACT_APP_API_URL: http://YOUR_IP:8000
    REACT_APP_WS_URL: ws://YOUR_IP:8000
```

### Remote Server Deployment
For deploying to cloud/remote server:

1. **Install Docker on server**
2. **Copy project files to server**
3. **Update environment variables** in docker-compose.yml
4. **Configure firewall** to allow ports 3000, 8000
5. **Run:** `docker compose up -d`

## Troubleshooting

### Containers won't start
```bash
# Check logs
docker compose logs

# Restart
docker compose restart

# Clean restart
docker compose down -v
docker compose up --build
```

### Port already in use
```bash
# Change ports in docker-compose.yml:
ports:
  - "3001:3000"  # Frontend
  - "8001:8000"  # Backend
```

### Database reset needed
```bash
# WARNING: Deletes all data
docker compose down -v
docker compose up -d
```

## Data Persistence

All data is stored in Docker volumes:
- `postgres_data` - Database
- `mosquitto_data` - MQTT messages
- `mosquitto_logs` - MQTT logs

To backup:
```bash
docker run --rm -v forest_emergency_communication_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_backup.tar.gz /data
```

## Security Notes

1. **Change default passwords** in production
2. **Update SECRET_KEY** in .env file
3. **Enable MQTT authentication** for production
4. **Use HTTPS** for remote access
5. **Configure firewall rules**

## System Requirements

- **Minimum**: 2 CPU cores, 4GB RAM, 10GB disk
- **Recommended**: 4 CPU cores, 8GB RAM, 20GB disk
- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

## Support

For issues:
1. Check logs: `docker compose logs`
2. Verify all containers running: `docker compose ps`
3. Test connectivity: `docker compose exec backend ping postgres`
