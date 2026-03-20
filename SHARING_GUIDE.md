# Complete Guide: Share FECS with Your Team

## 🎯 Choose Your Method

| Method | Best For | Difficulty | Internet Required |
|--------|----------|------------|-------------------|
| **Method 1: Project Files** | Small teams, local development | ⭐ Easy | Yes (first time) |
| **Method 2: Docker Hub** | Remote teams, easy updates | ⭐⭐ Medium | Yes |
| **Method 3: Image Files** | Offline deployment, no internet | ⭐⭐ Medium | No |
| **Method 4: GitHub** | Open source, version control | ⭐⭐⭐ Advanced | Yes |

---

## Method 1: Share Project Files (Easiest) ⭐

### You Do:
1. Zip the entire `forest_emergency_communication` folder
2. Share via Google Drive, OneDrive, or USB

### Your Friends Do:
```bash
# Extract the folder
# Open PowerShell/Terminal in the folder
docker compose up
```

**Pros:** Simple, includes source code  
**Cons:** Large file size (~100MB), needs to rebuild images

---

## Method 2: Docker Hub (Recommended for Teams) ⭐⭐

### You Do (One Time):

```bash
# 1. Login to Docker Hub
docker login

# 2. Tag images (replace 'yourusername')
docker tag forest_emergency_communication-backend:latest yourusername/fecs-backend:latest
docker tag forest_emergency_communication-frontend:latest yourusername/fecs-frontend:latest

# 3. Push to Docker Hub
docker push yourusername/fecs-backend:latest
docker push yourusername/fecs-frontend:latest
```

### Your Friends Do:

```bash
# 1. Create project folder
mkdir fecs
cd fecs

# 2. Create docker-compose.yml (see DOCKER_HUB_GUIDE.md)

# 3. Create mosquitto config
mkdir -p mosquitto/config
echo "listener 1883
allow_anonymous true
persistence true
persistence_location /mosquitto/data/
log_dest stdout" > mosquitto/config/mosquitto.conf

# 4. Run
docker compose up -d
```

**Pros:** Easy updates, no large file transfers  
**Cons:** Requires Docker Hub account, images are public (unless paid)

---

## Method 3: Export Image Files (Offline) ⭐⭐

### You Do:

```bash
# Export images
docker save forest_emergency_communication-backend:latest -o fecs_backend.tar
docker save forest_emergency_communication-frontend:latest -o fecs_frontend.tar

# Share these .tar files + docker-compose.yml + mosquitto folder
```

### Your Friends Do:

```bash
# Load images
docker load -i fecs_backend.tar
docker load -i fecs_frontend.tar

# Run
docker compose up -d
```

**Pros:** Works offline, no Docker Hub needed  
**Cons:** Large files (~1.4GB), manual updates

---

## Method 4: GitHub + Automated Builds ⭐⭐⭐

### You Do:

```bash
# 1. Create GitHub repository
# 2. Push code to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/fecs.git
git push -u origin main

# 3. Connect Docker Hub to GitHub for auto-builds
# (Configure in Docker Hub settings)
```

### Your Friends Do:

```bash
# Clone and run
git clone https://github.com/yourusername/fecs.git
cd fecs
docker compose up --build
```

**Pros:** Version control, easy collaboration, automatic updates  
**Cons:** Requires GitHub account, more setup

---

## 🚀 Quick Start for Friends (Any Method)

### Prerequisites:
1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Ensure Docker is running

### Access Application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs
- Default Login: `admin` / `admin123`

### Common Commands:
```bash
# Start
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f

# Restart
docker compose restart

# Update (if using Docker Hub)
docker compose pull
docker compose up -d
```

---

## 🌐 Network Access (Same WiFi)

If friends want to access from their computer while you run it:

### On Your Computer:
```bash
# Find your IP address
ipconfig  # Windows
ifconfig  # Mac/Linux

# Example: 192.168.1.100
```

### Update docker-compose.yml:
```yaml
frontend:
  environment:
    REACT_APP_API_URL: http://192.168.1.100:8000
    REACT_APP_WS_URL: ws://192.168.1.100:8000
```

### Friends Access:
- http://192.168.1.100:3000

---

## 📦 Recommended: Create Deployment Package

Create a complete package for easy sharing:

```bash
# Create package folder
mkdir fecs_package
cd fecs_package

# Copy files
copy docker-compose.yml .
mkdir mosquitto\config
copy mosquitto\config\mosquitto.conf mosquitto\config\

# Create README
echo "FECS Deployment Package

1. Install Docker Desktop
2. Run: docker compose up -d
3. Access: http://localhost:3000
4. Login: admin / admin123

For help, see DEPLOYMENT_GUIDE.md" > README.txt

# Zip and share
```

---

## 🔒 Security Notes

Before sharing:
1. ✅ Change default admin password
2. ✅ Update SECRET_KEY in docker-compose.yml
3. ✅ Review .env files for sensitive data
4. ✅ Add .gitignore if using GitHub

---

## 💡 My Recommendation

**For 1-5 friends (same location):**  
→ Use **Method 1** (Share project files)

**For remote team (5+ people):**  
→ Use **Method 2** (Docker Hub)

**For offline/field deployment:**  
→ Use **Method 3** (Export images)

**For long-term project:**  
→ Use **Method 4** (GitHub)
